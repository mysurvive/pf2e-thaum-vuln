import { Implement } from "../implement";
import { getImplement } from "../helpers";
import {
  INTENSIFY_VULNERABILITY_REGALIA_EFFECT_UUID,
  REGALIA_AURA_ADEPT_EFFECT_UUID,
  REGALIA_AURA_INITIATE_EFFECT_UUID,
  REGALIA_AURA_PARAGON_EFFECT_UUID,
} from "../../utils";

class Regalia extends Implement {
  static slug = "regalia";
  static intensifyEffectUuid = INTENSIFY_VULNERABILITY_REGALIA_EFFECT_UUID;

  constructor(actor, implementItem) {
    const regaliaRules = [
      {
        key: "FlatModifier",
        selector: ["deception", "diplomacy", "intimidation"],
        value: 1,
        type: "circumstance",
        label: "Regalia Implement Initiate",
        predicate: [{ or: ["class:thaumaturge", "feat:implement-initiate"] }],
        hideIfDisabled: true,
        slug: "regalia-implement-initiate",
      },
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
        predicate: [
          { or: ["class:thaumaturge", "feat:implement-initiate"] },
          { nor: ["adept:regalia", "paragon:regalia"] },
        ],
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
        predicate: ["adept:regalia", { not: "paragon:regalia" }],
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
        predicate: ["paragon:regalia"],
      },
      {
        key: "FlatModifier",
        selector: ["deception", "intimidation", "diplomacy"],
        value: 2,
        type: "circumstance",
        label: "Regalia Implement Adept",
        predicate: [
          { or: ["adept:regalia", "paragon:regalia"] },
          {
            or: ["proficiency:master", "proficiency:legendary"],
          },
        ],
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
        phase: "afterDerived",
        value: 1,
        predicate: [{ or: ["class:thaumaturge", "feat:implement-initiate"] }],
      },
      {
        key: "ActiveEffectLike",
        mode: "upgrade",
        path: "flags.pf2e.followTheExpert.bonus.trained",
        value: 2,
        phase: "afterDerived",
        predicate: ["adept:regalia"],
      },
      {
        key: "ActiveEffectLike",
        mode: "upgrade",
        path: "flags.pf2e.followTheExpert.bonus.trained",
        value: 3,
        phase: "afterDerived",
        predicate: ["paragon:regalia"],
      },
      {
        key: "ActiveEffectLike",
        mode: "upgrade",
        path: "flags.pf2e.followTheExpert.bonus.expert",
        value: 3,
        phase: "afterDerived",
        predicate: ["adept:regalia"],
      },
      {
        key: "ActiveEffectLike",
        mode: "upgrade",
        path: "flags.pf2e.followTheExpert.bonus.expert",
        value: 4,
        phase: "afterDerived",
        predicate: ["paragon:regalia"],
      },
      {
        key: "ActiveEffectLike",
        mode: "upgrade",
        path: "flags.pf2e.followTheExpert.bonus.master",
        value: 4,
        phase: "afterDerived",
        predicate: [{ or: ["paragon:regalia", "adept:regalia"] }],
      },
    ];

    super(actor, implementItem, regaliaRules, "regalia");
  }
}

Hooks.on(
  "createImplementEffects",
  Regalia.createImplementEffectsHook.bind(Regalia)
);

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
  const frightenedActors = game.canvas.tokens.placeables
    .map((t) => {
      if (
        t.actor?.itemTypes.condition.some(
          (c) =>
            c.sourceId ===
            "Compendium.pf2e.conditionitems.Item.TBSHQspnbcqxsmjL"
        ) &&
        t.actor?.itemTypes.effect.some(
          (e) =>
            e.slug === "effect-regalia-aura-initiate" ||
            e.slug === "effect-regalia-aura-adept" ||
            e.slug === "effect-regalia-aura-paragon"
        )
      ) {
        return t.actor.id;
      }
    })
    .filter((u) => u != undefined);

  const whisperList = game.users.map((u) => {
    if (frightenedActors.includes(u.character?.id)) return u.id;
    return game.users.activeGM;
  });

  // Don't attempt to send whispers if there are no targets for the whispers
  if (whisperList.length > 0) {
    ChatMessage.create({
      user: game.user.id,
      whisper: whisperList,
      content: game.i18n.localize(
        "pf2e-thaum-vuln.implements.regalia.frightenedReminder"
      ),
    });
  }
});

export { Regalia };
