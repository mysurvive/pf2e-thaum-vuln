import { Implement } from "../implement";
import { getImplement } from "../helpers";
import { createEffectData } from "../../utils/helpers";
import { INTENSIFY_VULNERABILITY_WEAPON_EFFECT_UUID } from "../../utils";

class Weapon extends Implement {
  constructor(actor, implementItem) {
    const weaponRules = [
      {
        key: "CriticalSpecialization",
        predicate: ["feature:thaumaturge-weapon-expertise"],
      },
      {
        key: "RollOption",
        domain: "attack-roll",
        toggleable: true,
        option: "implements-interruption-attack",
        label: "Implement's Interruption Attack",
      },
      {
        key: "Note",
        selector: "attack-roll",
        text: game.i18n.localize(
          "pf2e-thaum-vuln.implements.weapon.implementsInterruption.text.success"
        ),
        outcome: ["criticalSuccess"],
        title: game.i18n.localize(
          "pf2e-thaum-vuln.implements.weapon.implementsInterruption.title.success"
        ),
        predicate: [
          { not: "paragon:weapon" },
          "implements-interruption-attack",
        ],
        slug: "implements-interruption-initiate",
      },
      {
        key: "Note",
        selector: "attack-roll",
        text:
          game.i18n.localize(
            "pf2e-thaum-vuln.implements.weapon.implementsInterruption.text.failure"
          ) + "@Damage[1[{item|system.damage.damageType}]]",
        outcome: ["failure"],
        title: game.i18n.localize(
          "pf2e-thaum-vuln.implements.weapon.implementsInterruption.title.failure"
        ),
        predicate: ["adept:weapon", "implements-interruption-attack"],
        slug: "implements-interruption-adept",
      },
      {
        key: "Note",
        selector: "attack-roll",
        text: game.i18n.localize(
          "pf2e-thaum-vuln.implements.weapon.implementsInterruption.text.success"
        ),
        outcome: ["success", "criticalSuccess"],
        title: game.i18n.localize(
          "pf2e-thaum-vuln.implements.weapon.implementsInterruption.title.success"
        ),
        predicate: ["paragon:weapon", "implements-interruption-attack"],
        slug: "implements-interruption-paragon",
      },
    ];

    super(actor, implementItem, weaponRules, "weapon");
  }

  async intensifyImplement() {
    this.actor.createEmbeddedDocuments("Item", [
      await createEffectData(INTENSIFY_VULNERABILITY_WEAPON_EFFECT_UUID, {
        actor: this.actor.uuid,
      }),
    ]);
  }
}

Hooks.on("createImplementEffects", (userID, a, impDelta, imps) => {
  if (
    game.user.id === userID &&
    imps["weapon"]?.uuid &&
    impDelta.find(
      (i) =>
        i.name ===
        game.i18n.localize("PF2E.SpecificRule.Thaumaturge.Implement.Weapon")
    )?.changed
  ) {
    const weapon = getImplement(a, "weapon");
    weapon.createEffectsOnItem(imps["weapon"].uuid);
  }
});

Hooks.on("deleteImplementEffects", (a) => {
  const weapon = getImplement(a, "weapon");
  if (weapon?.item) {
    weapon.deleteEffectsOnItem();
  }
});

export { Weapon };
