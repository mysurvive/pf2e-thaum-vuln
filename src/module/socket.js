import {
  MORTAL_WEAKNESS_TARGET_UUID,
  PERSONAL_ANTITHESIS_TARGET_UUID,
  MORTAL_WEAKNESS_EFFECT_SOURCEID,
  PERSONAL_ANTITHESIS_EFFECT_SOURCEID,
  BREACHED_DEFENSES_TARGET_UUID,
  BREACHED_DEFENSES_EFFECT_SOURCEID,
  CURSED_EFFIGY_UUID,
  CURSED_EFFIGY_SOURCEID,
} from "./utils/index.js";

import { getActorEVEffect } from "./utils/helpers.js";

let socket;

Hooks.once("socketlib.ready", () => {
  socket = socketlib.registerModule("pf2e-thaum-vuln");
  socket.register("createEffectOnTarget", _socketCreateEffectOnTarget);
  socket.register("updateEVEffect", _socketUpdateEVEffect);
  socket.register("deleteEVEffect", _socketDeleteEVEffect);
  socket.register("applySWEffect", _socketApplySWEffect);
  socket.register("sharedWarding", _socketSharedWarding);
  socket.register("ubiquitousWeakness", _socketUbiquitousWeakness);
});

export function createEffectOnTarget(a, effect, evTargets, iwrData) {
  let aID = a.uuid;
  return socket.executeAsGM(
    _socketCreateEffectOnTarget,
    aID,
    effect,
    evTargets,
    iwrData
  );
}

export function ubiquitousWeakness(eff, selectedAlly, a) {
  return socket.executeAsGM(
    _socketUbiquitousWeakness,
    selectedAlly,
    a.actor.uuid,
    eff
  );
}

export function sharedWarding(eff) {
  return socket.executeAsGM(_socketSharedWarding, eff);
}

export async function applySWEffect(sa, selectedAlly, EVEffect) {
  return socket.executeAsGM(_socketApplySWEffect, sa, selectedAlly, EVEffect);
}

export function updateEVEffect(a, damageType) {
  return socket.executeAsGM(_socketUpdateEVEffect, a, damageType);
}

export function deleteEVEffect(effects) {
  return socket.executeAsGM(_socketDeleteEVEffect, effects);
}

async function _socketCreateEffectOnTarget(aID, effect, evTargets, iwrData) {
  const a = await fromUuid(aID);

  if (effect.flags.core.sourceId === MORTAL_WEAKNESS_EFFECT_SOURCEID) {
    effect.system.rules[0].value = iwrData;
    a.setFlag("pf2e-thaum-vuln", "EVValue", `${effect.system.rules[0].value}`);
  } else if (
    effect.flags.core.sourceId === PERSONAL_ANTITHESIS_EFFECT_SOURCEID
  ) {
    effect.system.rules[0].value = Math.floor(a.level / 2) + 2;
    a.setFlag("pf2e-thaum-vuln", "EVValue", `${effect.system.rules[0].value}`);
  }

  effect.name = effect.name + ` (${a.name})`;
  for (let targ of evTargets) {
    let tg = await fromUuid(targ);
    if (tg.actor) {
      tg = tg.actor;
    }
    tg.createEmbeddedDocuments("Item", [effect]);
  }
  return;
}

//This is a temporary fix until a later pf2e system update. The function hooks on renderChatMessage attack-rolls
//If the thaumaturge makes an attack-roll, the target's weakness updates with the correct amount
//If it's not the thaumaturge that makes the attack-roll, it changes the weakness to 0
async function _socketUpdateEVEffect(a, damageType) {
  let updates;
  let tKey;
  let value;
  let origin;
  let rollOptionData;
  if (a === undefined) {
    for (let act of canvas.tokens.placeables) {
      if (act.actor) {
        for (let effect of getActorEVEffect(act.actor, "*")) {
          if (effect?.rules.find((r) => r.key === "Weakness")) {
            if (
              effect?.rules[1]?.option.split(":")[2] != `Actor${a}` &&
              effect?.rules[1]?.option
            ) {
              value = 0;
            } else if (effect?.rules[1]?.option) {
              let acts = effect.rules[1].option.split(":")[2];
              acts = acts.replace("Actor", "Actor.");
              origin = await fromUuid(acts);
              value = origin.getFlag("pf2e-thaum-vuln", "EVValue");
            }
            tKey = effect._id;
            rollOptionData = effect.rules[1]?.option.replace("Actor", "Actor.");
            updates = {
              _id: tKey,
              system: {
                rules: [
                  {
                    key: "Weakness",
                    type: "physical",
                    value: 0,
                    predicate: [],
                    slug: effect.rules[0].slug,
                  },
                  {
                    key: "RollOption",
                    domain: "damage-roll",
                    option: rollOptionData,
                  },
                ],
              },
            };

            await act.actor.updateEmbeddedDocuments("Item", [updates]);
          }
        }
      }
    }
    return;
  }
  let sa = await fromUuid(`Actor.${a}`);

  if (!sa) {
    return;
  }

  if (!(sa.getFlag("pf2e-thaum-vuln", "EVMode") === "breached-defenses")) {
    for (let act of canvas.tokens.placeables) {
      if (act.actor?.uuid != a.uuid) {
        for (let effect of getActorEVEffect(act.actor, "*")) {
          if (effect?.rules.find((r) => r.key === "Weakness")) {
            if (
              (effect?.rules[1]?.option.split(":")[2] === `Actor${a}` ||
                sa.getFlag("pf2e-thaum-vuln", "effectSource") ===
                  effect?.rules[1]?.option
                    .split(":")[2]
                    .replace("Actor", "Actor.")) &&
              effect?.rules[1]?.option
            ) {
              let acts = effect.rules[1].option.split(":")[2];
              acts = acts.replace("Actor", "Actor.");
              origin = await fromUuid(acts);
              value = origin.getFlag("pf2e-thaum-vuln", "EVValue");
            } else if (effect?.rules[1]?.option) {
              value = 0;
            }
            tKey = effect._id;

            rollOptionData = effect.rules[1]?.option.replace("Actor", "Actor.");
            updates = {
              _id: tKey,
              system: {
                rules: [
                  {
                    key: "Weakness",
                    type: `${damageType}`.slugify(),
                    value: value,
                    predicate: [],
                    slug: effect.rules[0].slug,
                  },
                  {
                    key: "RollOption",
                    domain: "damage-roll",
                    option: rollOptionData,
                  },
                ],
              },
            };
            await act.actor.updateEmbeddedDocuments("Item", [updates]);
          }
        }
      }
    }
  }
}

//Deletes the effect from the actor passed to the method
async function _socketDeleteEVEffect(effects) {
  for (let effect of effects) {
    effect.delete();
  }
}

async function _socketApplySWEffect(saUuid, selectedAlly, EVEffect) {
  const ally = await fromUuid(selectedAlly);
  const sa = await fromUuid(saUuid);
  const EVValue = sa.getFlag("pf2e-thaum-vuln", "EVValue");
  EVEffect.system.source = sa.uuid;
  ally.createEmbeddedDocuments("Item", [EVEffect]);
  ally.setFlag("pf2e-thaum-vuln", "effectSource", saUuid);
  ally.setFlag("pf2e-thaum-vuln", "EVValue", EVValue);
  return;
}

async function _socketUbiquitousWeakness(allies, saUuid, EVEffect) {
  const sa = await fromUuid(saUuid);
  const EVValue = sa.getFlag("pf2e-thaum-vuln", "EVValue");
  for (let ally of allies) {
    ally = await fromUuid(ally);
    ally.createEmbeddedDocuments("Item", [EVEffect]);
    ally.setFlag("pf2e-thaum-vuln", "effectSource", saUuid);
    ally.setFlag("pf2e-thaum-vuln", "EVValue", EVValue);
  }
}

async function _socketSharedWarding(eff) {
  const a = canvas.tokens.controlled[0];
  const allTokens = canvas.tokens.placeables;

  const affectedTokens = allTokens.filter(
    (token) => a.distanceTo(token) <= 30 && token.actor.alliance === "party"
  );
  for (let token of affectedTokens) {
    if (token != a) {
      await token.actor.createEmbeddedDocuments("Item", [eff]);
      token.actor.setFlag("pf2e-thaum-vuln", "EWSourceActor", a.actor.uuid);
    }
  }
}
