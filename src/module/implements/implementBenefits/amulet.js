import { applyAbeyanceEffects } from "../../socket";
import { INTENSIFY_VULNERABILITY_AMULET_EFFECT_UUID } from "../../utils";

async function amuletsAbeyance(a, allies, strikeDamageTypes) {
  const amuletImplementData = a
    .getFlag("pf2e-thaum-vuln", "selectedImplements")
    .find(
      (i) =>
        i.name ===
        game.i18n.localize("PF2E.SpecificRule.Thaumaturge.Implement.Amulet")
    );
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

  new Dialog(
    {
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

                if (
                  character
                    .getFlag("pf2e-thaum-vuln", "selectedImplements")
                    .find(
                      (i) =>
                        i.name ===
                        game.i18n.localize(
                          "PF2E.SpecificRule.Thaumaturge.Implement.Amulet"
                        )
                    ).adept === true
                ) {
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
        $(document).ready(function () {
          const character = a;
          if (
            character
              .getFlag("pf2e-thaum-vuln", "selectedImplements")
              .find(
                (i) =>
                  i.name ===
                  game.i18n.localize(
                    "PF2E.SpecificRule.Thaumaturge.Implement.Amulet"
                  )
              ).paragon === true
          ) {
            $(".character-button").css("background-color", "red");
            $(".character-button").attr("chosen", true);
          }
          if ($(".character-button").length === 1) {
            $(".character-button").css("background-color", "red");
            $(".character-button").attr("chosen", true);
          }
          $(".character-button").bind("click", function (e) {
            $(e.target).siblings().removeAttr("chosen");
            $(".character-button").css("background-color", "rgba(0,0,0,0)");
            $(e.currentTarget).css("background-color", "red");
            $(e.currentTarget).attr("chosen", true);
          });
        });
      },
      close: () => {},
    },
    a
  ).render(true, { width: canvas.dimensions.width / 6 });
}

//async function checkChatForAmulet(message, html) {
export const amuletChatButton = {
  listen: async (message, html) => {
    if (!game.ready) return;
    const aArray =
      game.canvas.tokens.placeables.filter(
        (t) =>
          t?.actor?.class?.name === game.i18n.localize("PF2E.TraitThaumaturge")
      ) ?? undefined;
    for (const a of aArray) {
      if (
        a?.actor.isOwner &&
        a?.actor?.items.some(
          (i) =>
            i.name ===
              game.i18n.localize(
                "PF2E.SpecificRule.Thaumaturge.Implement.Amulet"
              ) && i.type === "feat"
        ) &&
        !game.settings.get("pf2e-thaum-vuln", "reactionCheckerHandlesAmulet")
      ) {
        const effectRange = 15;
        const targets = message.flags["pf2e-thaum-vuln"].targets;
        const amuletImplementData = a.actor
          .getFlag("pf2e-thaum-vuln", "selectedImplements")
          .find(
            (i) =>
              i?.name ===
              game.i18n.localize(
                "PF2E.SpecificRule.Thaumaturge.Implement.Amulet"
              )
          );
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

        const amuletUuid = a.actor
          .getFlag("pf2e-thaum-vuln", "selectedImplements")
          .find(
            (i) =>
              i.name ===
              game.i18n.localize(
                "PF2E.SpecificRule.Thaumaturge.Implement.Amulet"
              )
          ).uuid;

        const amulet = amuletUuid ? await fromUuid(amuletUuid) : undefined;
        const diceTotalArea = html.find(".dice-roll.damage-roll");

        if (amulet?.isHeld) {
          const evReactionBtn = `<button class="pf2e-ev-reaction-btn" style="display: flex; align-items: center; justify-content: space-between;" title="Amulet's Abeyance Reaction"><span style="white-space:nowrap;">Use Amulet's Abeyance</span><img src="modules/pf2e-thaum-vuln/assets/chosen-implement.webp" style="width: 1.5em;border:none;"/></button>`;
          $(diceTotalArea).after(
            $(evReactionBtn).click({ actor: a.actor }, function () {
              amuletsAbeyance(a.actor, targetedAlliesInRange, damageTypes);
            })
          );
        }
      }
    }
  },
};

async function checkChatForAbeyanceEffect(message, html) {
  if (
    !canvas.initialized ||
    game.settings.get("pf2e-thaum-vuln", "reactionCheckerHandlesAmulet")
  )
    return;
  const damageTakenCard = $(html).find(".damage-taken");
  if (damageTakenCard.length <= 0) return;
  if (game.user.isGM) {
    const abeyanceTokens = canvas.tokens.placeables.filter((t) =>
      t?.actor?.items.find((i) => i.slug === "effect-amulets-abeyance")
    );
    for (const token of abeyanceTokens) {
      token.actor.items
        .find((i) => i.slug === "effect-amulets-abeyance")
        .delete();
    }
  }
}

async function removeLingeringEffect(combatant) {
  if (
    combatant.actor?.class?.name ===
      game.i18n.localize("PF2E.TraitThaumaturge") &&
    game.user.isGM &&
    !game.settings.get("pf2e-thaum-vuln", "reactionCheckerHandlesAmulet")
  ) {
    const lingeringEffectTokens = canvas.tokens.placeables.filter((t) =>
      t.actor.items.find(
        (i) =>
          i.slug === "effect-amulets-abeyance-lingering-resistance" &&
          i.getFlag("pf2e-thaum-vuln", "effectSource") === combatant.actor.uuid
      )
    );
    for (const token of lingeringEffectTokens) {
      token.actor.items
        .find(
          (i) =>
            i.slug === "effect-amulets-abeyance-lingering-resistance" &&
            i.getFlag("pf2e-thaum-vuln", "effectSource") ===
              combatant.actor.uuid
        )
        .delete();
    }
  }
}

export async function amuletIntensify() {
  const a = game.user?.character?.actor ?? canvas.tokens.controlled[0]?.actor;
  if (
    !a.items.some((i) => i.slug === "intensify-vulnerability") ||
    !a
      .getFlag("pf2e-thaum-vuln", "selectedImplements")
      .some((i) => i?.name === "Amulet")
  )
    return ui.notifications.warn(
      "You do not have the ability to Intensify Vulnerability. Check your sheet to make sure you have Intensify Vulnerability and you have the Amulet implement chosen."
    );

  const amuletUuid = a
    .getFlag("pf2e-thaum-vuln", "selectedImplements")
    .find(
      (i) =>
        i.name ===
        game.i18n.localize("PF2E.SpecificRule.Thaumaturge.Implement.Amulet")
    ).uuid;
  const amulet = amuletUuid ? await fromUuid(amuletUuid) : undefined;
  if (!amulet?.isHeld)
    return ui.notifications.warn(
      "You must be holding your Amulet to use Intensify Vulnerability"
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
}

Hooks.on("pf2e.startTurn", async (combatant) => {
  removeLingeringEffect(combatant);
});

Hooks.on("renderChatMessage", async (message, html) => {
  amuletChatButton.listen(message, html);
  checkChatForAbeyanceEffect(message, html);
});
