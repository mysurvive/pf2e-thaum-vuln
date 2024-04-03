import { Implement } from "../implement";
import { getImplement } from "../helpers";

class Regalia extends Implement {
  constructor(actor, implementItem) {
    const regaliaRules = [
      {
        key: "FlatModifier",
        selector: ["deception", "diplomacy", "intimidation"],
        value: 1,
        type: "circumstance",
        label: "Regalia Implement Initiate",
        predicate: [],
        hideIfDisabled: true,
      },
      {
        key: "Aura",
        radius: 500,
        effects: [
          {
            affects: "allies",
            events: ["enter"],
            uuid: "Item.7lf9PJMMidflGW3F",
            predicate: ["target:effect:follow-the-expert"],
          },
        ],
        traits: ["visual"],
        label: "Regalia Follow The Expert Bonus",
        slug: "regalia-follow-the-expert-bonus",
        appearance: {
          border: null,
          highlight: { alpha: 0, color: "#000000" },
        },
      },
      {
        key: "Aura",
        radius: 15,
        effects: [
          {
            affects: "allies",
            events: ["enter"],
            uuid: "Item.KHgPNbkHnU20zPHG",
          },
        ],
        traits: ["emotion", "mental", "visual"],
        label: "Regalia Aura",
        slug: "regalia-aura",
      },
      {
        key: "FlatModifier",
        selector: ["deception", "intimidation", "diplomacy"],
        value: 2,
        type: "circumstance",
        label: "Regalia Implement Adept",
        predicate: ["adept:regalia", "proficiency:master"],
        hideIfDisabled: true,
      },
      {
        key: "AdjustDegreeOfSuccess",
        selector: "skill-check",
        adjustment: {
          criticalFailure: "one-degree-better",
        },
        predicate: [
          "paragon:regalia",
          "action:coerce",
          "action:make-an-impression",
          "action:request",
        ],
      },
    ];

    super("regalia", actor, regaliaRules, implementItem);
  }
}

Hooks.on("createImplementEffects", async (userID, a, impDelta, imps) => {
  if (
    game.user.id === userID &&
    imps["regalia"]?.uuid &&
    impDelta.find(
      (i) =>
        i.name ===
        game.i18n.localize("PF2E.SpecificRule.Thaumaturge.Implement.Regalia")
    )?.changed
  ) {
    console.log("imps", imps["regalia"].uuid);
    const _regalia = a.attributes.implements["regalia"];
    console.log("_regalia", _regalia);
    _regalia.createEffectsOnItem(_regalia.implementItem);
  }
});

Hooks.on("deleteImplementEffects", (a) => {
  if (getImplement(a, "regalia")?.uuid) {
    const _regalia = a.attributes.implements["regalia"];
    _regalia.deleteEffectsOnItem();
  }
});

export { Regalia };
