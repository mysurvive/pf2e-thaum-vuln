import { Implement } from "../implement";
import { getImplement } from "../helpers";
import { INTENSIFY_VULNERABILITY_WEAPON_EFFECT_UUID } from "../../utils";

class Weapon extends Implement {
  static slug = "weapon";
  static intensifyEffectUuid = INTENSIFY_VULNERABILITY_WEAPON_EFFECT_UUID;

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
        label: "pf2e-thaum-vuln.implements.weapon.implementsInterruption.label",
        predicate: [{ or: ["class:thaumaturge", "feat:implement-initiate"] }],
      },
      {
        key: "Note",
        selector: "attack-roll",
        text: "pf2e-thaum-vuln.implements.weapon.implementsInterruption.text.success",
        outcome: ["criticalSuccess"],
        title:
          "pf2e-thaum-vuln.implements.weapon.implementsInterruption.title.success",
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
        title:
          "pf2e-thaum-vuln.implements.weapon.implementsInterruption.title.failure",
        predicate: [
          { or: ["adept:weapon", "paragon:weapon"] },
          "implements-interruption-attack",
        ],
        slug: "implements-interruption-adept",
      },
      {
        key: "Note",
        selector: "attack-roll",
        text: "pf2e-thaum-vuln.implements.weapon.implementsInterruption.text.success",
        outcome: ["success", "criticalSuccess"],
        title:
          "pf2e-thaum-vuln.implements.weapon.implementsInterruption.title.success",
        predicate: ["paragon:weapon", "implements-interruption-attack"],
        slug: "implements-interruption-paragon",
      },
    ];

    super(actor, implementItem, weaponRules, "weapon");
  }
}

Hooks.on(
  "createImplementEffects",
  Weapon.createImplementEffectsHook.bind(Weapon)
);

Hooks.on("deleteImplementEffects", (a) => {
  const weapon = getImplement(a, "weapon");
  if (weapon?.item) {
    weapon.deleteEffectsOnItem();
  }
});

export { Weapon };
