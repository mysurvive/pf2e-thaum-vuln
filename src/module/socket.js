import {
  MORTAL_WEAKNESS_TARGET_SOURCEID,
  PERSONAL_ANTITHESIS_TARGET_SOURCEID,
} from "./utils/index.js";

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

export function sharedWarding(eff, a) {
  return socket.executeAsGM(_socketSharedWarding, eff, a);
}

export async function applySWEffect(sa, selectedAlly, EVEffect) {
  return socket.executeAsGM(_socketApplySWEffect, sa, selectedAlly, EVEffect);
}

export function updateEVEffect(targ, effect, value, damageType) {
  return socket.executeAsGM(
    _socketUpdateEVEffect,
    targ,
    effect,
    value,
    damageType
  );
}

export function deleteEVEffect(effects) {
  return socket.executeAsGM(_socketDeleteEVEffect, effects);
}

async function _socketCreateEffectOnTarget(aID, effect, evTargets, iwrData) {
  const a = await fromUuid(aID);

  if (effect.flags.core.sourceId === MORTAL_WEAKNESS_TARGET_SOURCEID) {
    effect.system.rules[0].value = iwrData;
    a.setFlag("pf2e-thaum-vuln", "EVValue", `${effect.system.rules[0].value}`);
  } else if (
    effect.flags.core.sourceId === PERSONAL_ANTITHESIS_TARGET_SOURCEID
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
    await tg.createEmbeddedDocuments("Item", [effect]);
  }
  return;
}

//This is a temporary fix until a later pf2e system update. The function hooks on renderChatMessage attack-rolls
//If the thaumaturge makes an attack-roll, the target's weakness updates with the correct amount
//If it's not the thaumaturge that makes the attack-roll, it changes the weakness to 0
async function _socketUpdateEVEffect(targ, effect, value, damageType) {
  for (let eff of effect) {
    eff = await fromUuid(eff);
    targ = await fromUuid(targ);
    if (eff.slug !== "breached-defenses-target") {
      const updates = {
        _id: eff._id,
        system: {
          rules: [
            {
              key: "Weakness",
              type: game.pf2e.system.sluggify(damageType),
              value: value,
              predicate: [],
              slug: eff.system.rules[0].slug,
            },
          ],
        },
      };
      await targ.actor.updateEmbeddedDocuments("Item", [updates]);
    }
  }
}

//Deletes the effect from the actor passed to the method
async function _socketDeleteEVEffect(effects) {
  for (let effect of effects) {
    effect = await fromUuid(effect);
    effect.delete();
  }
}

async function _socketApplySWEffect(saUuid, selectedAlly, EVEffect) {
  const ally = await fromUuid(selectedAlly);
  const sa = await fromUuid(saUuid);
  EVEffect = await fromUuid(EVEffect);
  const EVValue = sa.getFlag("pf2e-thaum-vuln", "EVValue");
  await ally.createEmbeddedDocuments("Item", [EVEffect]);
  await ally.setFlag("pf2e-thaum-vuln", "effectSource", saUuid);
  await ally.setFlag("pf2e-thaum-vuln", "EVValue", EVValue);
  return;
}

async function _socketUbiquitousWeakness(allies, saUuid, EVEffect) {
  const sa = await fromUuid(saUuid);
  const EVValue = sa.getFlag("pf2e-thaum-vuln", "EVValue");
  for (let ally of allies) {
    ally = await fromUuid(ally);
    await ally.createEmbeddedDocuments("Item", [EVEffect]);
    await ally.setFlag("pf2e-thaum-vuln", "effectSource", saUuid);
    await ally.setFlag("pf2e-thaum-vuln", "EVValue", EVValue);
  }
}

async function _socketSharedWarding(eff, a) {
  a = await fromUuid(a);
  const allTokens = canvas.tokens.placeables;
  eff = await fromUuid(eff);

  const affectedTokens = allTokens.filter(
    (token) =>
      a._object.distanceTo(token) <= 30 && token.actor.alliance === "party"
  );
  for (let token of affectedTokens) {
    if (token != a._object) {
      await token.actor.createEmbeddedDocuments("Item", [eff]);
      token.actor.setFlag(
        "pf2e-thaum-vuln",
        "EVTargetID",
        a.actor.getFlag("pf2e-thaum-vuln", "EVTargetID")
      );
      token.actor.setFlag("pf2e-thaum-vuln", "EWSourceActor", a.actor.uuid);
    }
  }
}
