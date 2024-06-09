import { Implement } from "../implement";
import { getImplement } from "../helpers";
import {
  INTENSIFY_VULNERABILITY_REGALIA_EFFECT_UUID,
  REGALIA_AURA_ADEPT_EFFECT_UUID,
  REGALIA_AURA_INITIATE_EFFECT_UUID,
  REGALIA_AURA_PARAGON_EFFECT_UUID,
} from "../../utils";

class Regalia extends Implement {
  static intensifyEffectUuid = INTENSIFY_VULNERABILITY_REGALIA_EFFECT_UUID;

  constructor(actor, implementItem) {
    const regaliaRules = [
      // Bonus to Deception, Diplomancy, Intimidation
      {
        key: "FlatModifier",
        selector: ["deception", "diplomacy", "intimidation"],
        value: 1,
        type: "circumstance",
        label: "Regalia Implement",
        predicate: ["regalia:initiate"],
        hideIfDisabled: true,
        slug: "regalia-implement-initiate",
      },
      {
        key: "FlatModifier",
        selector: ["deception", "diplomacy", "intimidation"],
        value: 2,
        type: "circumstance",
        label: "Regalia Implement",
        predicate: [
          { gte: ["self:implement:regalia:rank", 2] },
          "proficiency:master",
        ],
        hideIfDisabled: true,
        slug: "regalia-implement-adept",
      },
      // Aura for bonus to saves, damage bonus, etc.
      {
        key: "Aura",
        radius: 15,
        level: "@actor.level",
        effects: [
          {
            affects: "allies",
            events: ["enter"],
            uuid: REGALIA_AURA_INITIATE_EFFECT_UUID,
          },
        ],
        traits: ["emotion", "mental", "visual"],
        label: "Regalia Aura - Initiate",
        slug: "regalia-aura-initiate",
        predicate: ["regalia:initiate"],
      },
      {
        key: "Aura",
        radius: 15,
        level: "@actor.level",
        effects: [
          {
            affects: "allies",
            events: ["enter"],
            uuid: REGALIA_AURA_ADEPT_EFFECT_UUID,
          },
        ],
        traits: ["emotion", "mental", "visual"],
        label: "Regalia Aura - Adept",
        slug: "regalia-aura-adept",
        predicate: ["regalia:adept"],
      },
      {
        key: "Aura",
        radius: 15,
        level: "@actor.level",
        effects: [
          {
            affects: "allies",
            events: ["enter"],
            uuid: REGALIA_AURA_PARAGON_EFFECT_UUID,
          },
        ],
        traits: ["emotion", "mental", "visual"],
        label: "Regalia Aura - Paragon",
        slug: "regalia-aura-paragon",
        predicate: ["regalia:paragon"],
      },
      // DoS improvement at Paragon level
      {
        key: "AdjustDegreeOfSuccess",
        selector: "skill-check",
        adjustment: {
          criticalFailure: "one-degree-better",
        },
        predicate: [
          "regalia:paragon",
          {
            or: [
              "action:coerce",
              "action:make-an-impression",
              "action:request",
            ],
          },
        ],
      },
      // Follow the Expert enhancements
      {
        key: "ActiveEffectLike",
        mode: "override",
        path: "flags.pf2e.followTheExpert.minimum",
        phase: "afterDerived",
        value: 1,
      },
      // FtE bonus when Trained: Initiate +1, Adept +2, Paragon +3
      {
        key: "ActiveEffectLike",
        mode: "upgrade",
        path: "flags.pf2e.followTheExpert.bonus.trained",
        value: "@actor.attributes.implements.regalia.rank",
        phase: "afterDerived",
      },
      // FtE bonus when Expert: Initate +2 (normal), Adept +3, Paragon +4
      {
        key: "ActiveEffectLike",
        mode: "upgrade",
        path: "flags.pf2e.followTheExpert.bonus.expert",
        value: "@actor.attributes.implements.regalia.rank + 1",
        phase: "afterDerived",
        predicate: [{ gte: ["self:implement:regalia:rank", 2] }],
      },
      // FtE bonus when Master: Initate +3 (normal), Adept +4, Paragon +4
      {
        key: "ActiveEffectLike",
        mode: "upgrade",
        path: "flags.pf2e.followTheExpert.bonus.master",
        value: 4,
        phase: "afterDerived",
        predicate: [{ gte: ["self:implement:regalia:rank", 2] }],
      },
    ];

    super(actor, implementItem, regaliaRules, "regalia");
  }
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
  const regalia = getImplement(a, "regalia");
  if (regalia?.item) {
    regalia.deleteEffectsOnItem();
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
