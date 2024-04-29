import { applyAbeyanceEffects } from "../../socket";
import { INTENSIFY_VULNERABILITY_AMULET_EFFECT_UUID } from "../../utils";
import { getImplement } from "../helpers";
import { Implement } from "../implement";

class Amulet extends Implement {
  constructor(actor, implementItem) {
    super(actor, implementItem, [], "amulet");
  }

  static async listenForAbeyanceChat(message, html) {
    if (
      !game.ready ||
      game.settings.get("pf2e-thaum-vuln", "reactionCheckerHandlesAmulet")
    )
      return;
    for (const a of game.canvas.tokens.placeables.filter(
      (t) => t.actor?.isOwner && t.actor?.attributes?.implements?.amulet
    )) {
      const effectRange = 15;
      const targets = message.flags["pf2e-thaum-vuln"].targets;
      const amuletImplementData = getImplement(a.actor, "amulet");
      let targetedAlliesInRange = new Array();
      if (amuletImplementData?.paragon === true) {
        targetedAlliesInRange = canvas.tokens.placeables.filter(
          (token) =>
            token.actor?.alliance === "party" &&
            a.distanceTo(token) <= effectRange
        );
      } else {
        for (const target of targets) {
          const targetToken = await fromUuid(target.tokenUuid);
          if (
            targetToken._object.actor.alliance === "party" &&
            a.distanceTo(targetToken._object) <= effectRange
          ) {
            targetedAlliesInRange.push(targetToken._object);
          }
        }
      }

      if (
        message.isDamageRoll === false ||
        a.actor.getFlag("pf2e-thaum-vuln", "activeEV") !== true ||
        a.actor.getFlag("pf2e-thaum-vuln", "primaryEVTarget") !==
          `Scene.${message.speaker.scene}.Token.${message.speaker.token}.Actor.${message.speaker.actor}` ||
        targetedAlliesInRange.length <= 0
      )
        continue;

      let damageTypes = new Array();
      const rolls = message.rolls;
      for (const roll of rolls) {
        const instances = roll.instances;
        for (const instance of instances) {
          damageTypes.push(instance.type);
        }
      }

      const amulet = getImplement(a.actor, "amulet");
      const diceTotalArea = html.find(".dice-roll.damage-roll");

      if (amulet?.item?.isHeld) {
        const evReactionBtn = `<span class="pf2e-ev-reaction-area">${a.actor.name}: <button class="pf2e-ev-reaction-btn" style="display: flex; align-items: center; justify-content: space-between;" title="Amulet's Abeyance Reaction"><span style="white-space:nowrap;">Use Amulet's Abeyance</span><img src="modules/pf2e-thaum-vuln/assets/chosen-implement.webp" style="width: 1.5em;border:none;"/></button></span>`;
        $(diceTotalArea).after(
          $(evReactionBtn).click({ actor: a.actor }, function () {
            amulet.amuletsAbeyance(a.actor, targetedAlliesInRange, damageTypes);
          })
        );
      }
    }
  }

  async amuletsAbeyance(a, allies, strikeDamageTypes) {
    const amuletImplementData = getImplement(a, "amulet");
    const adeptResistanceValue = a.level < 15 ? 5 : 10;
    const abeyanceResistanceValue = 2 + a.level;

    const dgContent = {
      allies: allies,
      damageTypes: strikeDamageTypes,
      adeptResistanceValue: adeptResistanceValue,
      abeyanceResistanceValue: abeyanceResistanceValue,
      amuletBenefits: a.items.find(
        (i) =>
          i.name ===
          game.i18n.localize("PF2E.SpecificRule.Thaumaturge.Implement.Amulet")
      ).description,
      amuletRank: amuletImplementData,
    };

    new Dialog({
      title: "Amulet's Abeyance",
      content: await renderTemplate(
        "modules/pf2e-thaum-vuln/templates/amuletsAbeyanceDialog.hbs",
        dgContent
      ),
      buttons: {
        confirm: {
          label: game.i18n.localize("pf2e-thaum-vuln.dialog.confirm"),
          callback: async (dgEndContent) => {
            let abeyanceData = {};
            const character = a;
            const damageTypes = $(dgEndContent)
              .find(".amulets-abeyance-dialog")
              .attr("dmg")
              .split(",");
            for (const btn of $(dgEndContent).find(".character-button")) {
              if ($(btn).attr("chosen")) {
                const chosenUuid = $(btn).attr("id");
                const charName = (await fromUuid(chosenUuid)).name;
                abeyanceData[charName] = {
                  uuid: chosenUuid,
                  abeyanceDamageType: damageTypes,
                };

                if (getImplement(character, "amulet")?.adept) {
                  for (const selector of $(dgEndContent).find("select")) {
                    if (
                      selector.id === "damage-type-" + chosenUuid ||
                      selector.id === "damage-type-adept"
                    ) {
                      const charName = (await fromUuid(chosenUuid)).name;
                      const damageType = $(selector)[0].value;
                      abeyanceData[charName].lingeringDamageType = damageType;
                    }
                  }
                }
              }
            }
            applyAbeyanceEffects(character.uuid, abeyanceData);
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
      game.settings.get("pf2e-thaum-vuln", "reactionCheckerHandlesAmulet") ||
      message.flags.pf2e?.appliedDamage === undefined || // null means damage applied, but reduced to zero
      !message.actor?.isOwner
    )
      return;

    // Probably better to use sourceId, but it's not set when the effect is made.
    message.actor?.itemTypes.effect
      .find((t) => t.slug === "effect-amulets-abeyance")
      ?.delete();
  }

  async intensifyImplement() {
    const a = game.user?.character?.actor ?? canvas.tokens.controlled[0]?.actor;
    if (
      !a.itemTypes.feat.some((i) => i.slug === "intensify-vulnerability") ||
      !getImplement(a, "amulet")
    )
      return ui.notifications.warn(
        game.i18n.localize(
          "pf2e-thaum-vuln.notifications.warn.intensifyImplement.noIntensify"
        )
      );

    const amulet = this.item;
    if (!amulet?.isHeld)
      return ui.notifications.warn(
        game.i18n.localize(
          "pf2e-thaum-vuln.notifications.warn.intensifyImplement.notHeld"
        )
      );

    const intensifyAmuletEffect = (
      await fromUuid(INTENSIFY_VULNERABILITY_AMULET_EFFECT_UUID)
    ).toObject();
    intensifyAmuletEffect.system.rules[0].predicate = [
      "origin:effect:primary-ev-target-" + game.pf2e.system.sluggify(a.name),
    ];
    intensifyAmuletEffect.system.rules[1].predicate = [
      "origin:effect:primary-ev-target-" + game.pf2e.system.sluggify(a.name),
    ];
    a.createEmbeddedDocuments("Item", [intensifyAmuletEffect]);
    //TODO: add chat message stating the abeyance effect has been used
  }
}

Hooks.on("renderChatMessage", async (message, html) => {
  Amulet.listenForAbeyanceChat(message, html);
});

Hooks.on("preCreateChatMessage", async (message) => {
  Amulet.checkChatForAbeyanceEffect(message);
});

export { Amulet };
