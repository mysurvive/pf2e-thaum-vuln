import { applyAbeyanceEffects } from "../../socket";
import {
  GLIMPSE_VULNERABILITY_TARGET_UUID,
  INTENSIFY_VULNERABILITY_AMULET_EFFECT_UUID,
  PRIMARY_TARGET_EFFECT_UUID,
} from "../../utils";
import { getImplement } from "../helpers";
import {
  hasFeat,
  isThaumaturge,
  messageTargetTokens,
} from "../../utils/helpers";
import { Implement } from "../implement";

class Amulet extends Implement {
  static intensifyEffectUuid = INTENSIFY_VULNERABILITY_AMULET_EFFECT_UUID;

  constructor(actor, implementItem) {
    super(actor, implementItem, [], "amulet");
  }

  // Is token an ally we can abey for?
  isAbeyableToken(token, myToken) {
    return (
      myToken &&
      token.actor?.alliance == this.actor.alliance &&
      token.distanceTo(myToken) <= 15
    );
  }

  // Add data about which thaumaturge(s), if any, can use abeyance to the damage roll message flags.
  static addAbeyanceData(message) {
    if (!game.ready || !message.isDamageRoll || !message.actor) return;

    // First, check if attacker is an EV target, since most attackers won't be
    const thaums = message.actor.itemTypes.effect
      .filter(
        (e) =>
          e.sourceId === PRIMARY_TARGET_EFFECT_UUID ||
          e.sourceId === GLIMPSE_VULNERABILITY_TARGET_UUID
      )
      .map((e) => e.origin);
    if (thaums.length == 0) return;

    // Turn target UUID list into Tokens
    const targets = messageTargetTokens(message);

    // For any thaums with the attacker as EV target, check if an allied target is within 15'
    let abeyers = [];
    for (const thaum of thaums) {
      const amulet = getImplement(thaum, "amulet");
      if (
        thaum.getFlag("pf2e-thaum-vuln", "primaryEVTarget") !==
          message.actor.uuid ||
        !amulet?.item?.isHeld
      )
        continue;

      // If we aren't in the initiative, combatant isn't defined
      const token =
        thaum.combatant?.token.object ??
        game.canvas.tokens.placeables.find((t) => t.actor == thaum);
      if (targets.some((t) => amulet.isAbeyableToken(t, token))) {
        abeyers.push({
          actorUuid: thaum.uuid,
          tokenUuid: token.document.uuid,
        });
      }
    }
    if (abeyers.length > 0) {
      message.updateSource({ "flags.pf2e-thaum-vuln.abeyers": abeyers });
    }
  }

  // Add a "Use Abeyance" button to a chat message
  static addAbeyanceButton(message, html) {
    const abeyers = message.getFlag("pf2e-thaum-vuln", "abeyers");
    if (!abeyers) return;

    // Actors, that we own, that can abey
    const actors = abeyers
      .map((abeyer) => fromUuidSync(abeyer.actorUuid))
      .filter(
        (a) =>
          a.isOwner && (isThaumaturge(a) || hasFeat(a, "implement-initiate"))
      );
    if (!actors.length) return;

    const diceTotalArea = html.find(".dice-roll.damage-roll");
    for (const actor of actors) {
      const tokenUuid = abeyers.find(
        (abeyer) => abeyer.actorUuid === actor.uuid
      ).tokenUuid;
      const evReactionBtn = `<span class="pf2e-ev-reaction-area">${
        actor.name
      }: <button class="pf2e-ev-reaction-btn" style="display: flex; align-items: center; justify-content: space-between;" title="${game.i18n.localize(
        "pf2e-thaum-vuln.implements.amulet.abeyance.button.title"
      )}"><span style="white-space:nowrap;">${game.i18n.localize(
        "pf2e-thaum-vuln.implements.amulet.abeyance.button.label"
      )}</span><img src="modules/pf2e-thaum-vuln/assets/chosen-implement.webp" style="width: 1.5em;border:none;"/></button></span>`;
      $(diceTotalArea).after(
        $(evReactionBtn).on("click", () =>
          getImplement(actor, "amulet")?.amuletsAbeyance(message, tokenUuid)
        )
      );
    }
  }

  async amuletsAbeyance(message, tokenUuid) {
    const token = fromUuidSync(tokenUuid).object;
    const allies = (
      this.paragon ? canvas.tokens.placeables : messageTargetTokens(message)
    ).filter((t) => this.isAbeyableToken(t, token));

    const dgContent = {
      allies,
      damageTypes: message.rolls.flatMap((r) => r.instances.map((i) => i.type)),
      adeptResistanceValue: this.actor.level < 15 ? 5 : 10,
      abeyanceResistanceValue: this.actor.level + 2,
      amuletBenefits: this.baseFeat.description,
      amuletRank: this,
    };

    new Dialog({
      title: game.i18n.localize(
        "pf2e-thaum-vuln.implements.amulet.abeyance.dialog.title"
      ),
      content: await renderTemplate(
        "modules/pf2e-thaum-vuln/templates/amuletsAbeyanceDialog.hbs",
        dgContent
      ),
      buttons: {
        confirm: {
          label: game.i18n.localize("pf2e-thaum-vuln.dialog.confirm"),
          callback: (dgEndContent) => {
            let abeyanceData = {};
            for (const btn of $(dgEndContent).find(
              ".character-button[chosen]"
            )) {
              const chosenUuid = $(btn).attr("id");
              abeyanceData[chosenUuid] = {};
              if (this.adept) {
                const id = this.paragon
                  ? `#damage-type-${chosenUuid.replace(/\./g, "\\.")}`
                  : "#damage-type-adept";
                const selector = $(dgEndContent).find(id);
                const damageType = $(selector)[0].value;
                abeyanceData[chosenUuid].lingeringDamageType = damageType;
              }
            }
            applyAbeyanceEffects(this.actor.uuid, abeyanceData);
          },
        },
        cancel: {
          label: game.i18n.localize("pf2e-thaum-vuln.dialog.cancel"),
          callback: () => {},
        },
      },
      default: "confirm",
      render: () => {
        $(document).ready(() => {
          if (this.paragon || $(".character-button").length === 1) {
            $(".character-button").attr("chosen", true);
          }
          $(".character-button").bind("click", (e) => {
            const button = $(e.target);
            if (this.paragon) {
              if (button.attr("chosen")) {
                button.removeAttr("chosen");
              } else {
                button.attr("chosen", true);
              }
            } else {
              button
                .parent()
                .siblings()
                .find(".character-button")
                .removeAttr("chosen");
              button.attr("chosen", true);
            }
          });
        });
      },
    }).render(true, { width: 750 });
  }

  static async checkChatForAbeyanceEffect(message) {
    if (
      !game.ready ||
      message.flags.pf2e?.appliedDamage === undefined || // null means damage applied, but reduced to zero
      !message.actor?.isOwner
    )
      return;

    // Probably better to use sourceId, but it's not set when the effect is made.
    message.actor?.itemTypes.effect
      .find((t) => t.slug === "effect-amulets-abeyance")
      ?.delete();
  }
}

Hooks.on("renderChatMessage", (message, html) => {
  Amulet.addAbeyanceButton(message, html);
});

// Add the hook on init so that it's after the hooks.js hooks
Hooks.once("init", () => {
  Hooks.on("preCreateChatMessage", (message) => {
    if (game.settings.get("pf2e-thaum-vuln", "reactionCheckerHandlesAmulet"))
      return;
    Amulet.checkChatForAbeyanceEffect(message);
    Amulet.addAbeyanceData(message);
  });
});

export { Amulet };
