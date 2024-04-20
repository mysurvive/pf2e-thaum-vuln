import { Implement } from "../implement";
import { getImplement } from "../helpers";

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
        text: "You disrupt the triggering action.",
        outcome: ["criticalSuccess"],
        title: "Weapon: Implement's Interruption",
        predicate: [
          { not: "paragon:weapon" },
          "implements-interruption-attack",
        ],
        slug: "implements-interruption-initiate",
      },
      {
        key: "Note",
        selector: "attack-roll",
        text: `You deal @Damage[1[{item|system.damage.damageType}]].`,
        outcome: ["failure"],
        title: "Implement's Interruption Failure",
        predicate: ["adept:weapon", "implements-interruption-attack"],
        slug: "implements-interruption-adept",
      },
      {
        key: "Note",
        selector: "attack-roll",
        text: "You disrupt the triggering action.",
        outcome: ["success", "criticalSuccess"],
        title: "Weapon: Implement's Interruption",
        predicate: ["paragon:weapon", "implements-interruption-attack"],
        slug: "implements-interruption-paragon",
      },
    ];

    super(actor, implementItem, weaponRules, "weapon");
  }

  async intensifyImplement() {
    this.actor.createEmbeddedDocuments("Item", [
      (await fromUuid("Item.28Jkfm6xZrSUEmsz")).toObject(),
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
    const _weapon = a.attributes.implements["weapon"];
    _weapon.createEffectsOnItem(imps["weapon"].uuid);
  }
});

Hooks.on("deleteImplementEffects", (a) => {
  if (getImplement(a, "weapon")?.uuid) {
    const _weapon = a.attributes.implements["weapon"];
    _weapon.deleteEffectsOnItem();
  }
});

export { Weapon };
