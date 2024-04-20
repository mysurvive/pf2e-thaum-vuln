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
        slug: "regalia-implement-initiate",
      },
      {
        key: "Aura",
        radius: 15,
        effects: [
          {
            affects: "allies",
            events: ["enter"],
            uuid: "Compendium.pf2e-thaum-vuln.thaumaturge-effects.Item.W0hOUNf7dJHmJ63j",
          },
        ],
        traits: ["emotion", "mental", "visual"],
        label: "Regalia Aura - Initiate",
        slug: "regalia-aura-initiate",
        predicate: [{ nor: ["adept:regalia", "paragon:regalia"] }],
      },
      {
        key: "Aura",
        radius: 15,
        effects: [
          {
            affects: "allies",
            events: ["enter"],
            uuid: "Compendium.pf2e-thaum-vuln.thaumaturge-effects.Item.lr1UVbxaToPGdSvw",
          },
        ],
        traits: ["emotion", "mental", "visual"],
        label: "Regalia Aura - Adept",
        slug: "regalia-aura-adept",
        predicate: ["adept:regalia", { not: "paragon:regalia" }],
      },
      {
        key: "Aura",
        radius: 15,
        effects: [
          {
            affects: "allies",
            events: ["enter"],
            uuid: "Compendium.pf2e-thaum-vuln.thaumaturge-effects.Item.rrxQvikt1U3qe4Jx",
          },
        ],
        traits: ["emotion", "mental", "visual"],
        label: "Regalia Aura - Paragon",
        slug: "regalia-aura-paragon",
        predicate: ["paragon:regalia"],
      },
      {
        key: "FlatModifier",
        selector: ["deception", "intimidation", "diplomacy"],
        value: 2,
        type: "circumstance",
        label: "Regalia Implement Adept",
        predicate: ["adept:regalia", "proficiency:master"],
        hideIfDisabled: true,
        slug: "regalia-implement-adept",
      },
      {
        key: "AdjustDegreeOfSuccess",
        selector: "skill-check",
        adjustment: {
          criticalFailure: "one-degree-better",
        },
        predicate: [
          "paragon:regalia",
          {
            or: [
              "action:coerce",
              "action:make-an-impression",
              "action:request",
            ],
          },
        ],
      },
      {
        key: "ActiveEffectLike",
        mode: "override",
        path: "flags.pf2e.followTheExpert.minimum",
        value: 1,
      },
      {
        key: "ActiveEffectLike",
        mode: "upgrade",
        path: "flags.pf2e.followTheExpert.bonus.trained",
        value: 3,
        predicate: ["paragon:regalia"],
      },
      {
        key: "ActiveEffectLike",
        mode: "upgrade",
        path: "flags.pf2e.followTheExpert.bonus.expert",
        value: 4,
        predicate: ["paragon:regalia"],
      },
      {
        key: "ActiveEffectLike",
        mode: "upgrade",
        path: "flags.pf2e.followTheExpert.bonus.master",
        value: 4,
        predicate: ["paragon:regalia"],
      },
    ];

    super(actor, implementItem, regaliaRules, "regalia");
  }

  intensifyImplement() {}
}

Hooks.on("createImplementEffects", (userID, a, impDelta, imps) => {
  if (
    game.user.id === userID &&
    imps["regalia"]?.uuid &&
    impDelta.find(
      (i) =>
        i.name ===
        game.i18n.localize("PF2E.SpecificRule.Thaumaturge.Implement.Regalia")
    )?.changed
  ) {
    const _regalia = a.attributes.implements["regalia"];
    _regalia.createEffectsOnItem(imps["regalia"].uuid);
  }
});

Hooks.on("deleteImplementEffects", (a) => {
  if (getImplement(a, "regalia")?.uuid) {
    const _regalia = a.attributes.implements["regalia"];
    _regalia.deleteEffectsOnItem();
  }
});

Hooks.on("pf2e.endTurn", (combatant) => {
  /**
   * Finds all actors who are frightened and have the Regalia Aura effect
   * applied to them, and reminds them via a whisper at the end of the
   * Thaumaturge's turn to reduce their frightened value by 1.
   */
  const combatActor = game.actors.get(combatant.actorId);
  // Exits early if the combatant doesn't have the implements.regalia attribute on their actor
  if (!combatActor.attributes.implements?.["regalia"]) return;
  const frightenedUserActors = game.users
    .map((u) => {
      if (
        u.character?.itemTypes.condition.some(
          (c) =>
            c.sourceId ===
            "Compendium.pf2e.conditionitems.Item.TBSHQspnbcqxsmjL"
        ) &&
        u.character?.itemTypes.effect.some(
          (e) =>
            e.slug === "effect-regalia-aura-initiate" ||
            e.slug === "effect-regalia-aura-adept" ||
            e.slug === "effect-regalia-aura-paragon"
        )
      )
        return u.id;
    })
    .filter((u) => u != undefined);
  // Don't attempt to send whispers if there are no targets for the whispers
  if (frightenedUserActors.length > 0) {
    ChatMessage.create({
      user: game.user.id,
      type: CONST.CHAT_MESSAGE_TYPES.WHISPER,
      whisper: frightenedUserActors,
      content: game.i18n.localize(
        "pf2e-thaum-vuln.implements.regalia.frightenedReminder"
      ),
    });
  }
});

export { Regalia };
