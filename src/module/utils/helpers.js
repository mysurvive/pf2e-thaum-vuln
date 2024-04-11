import { TargetEffectSourceIDs } from ".";

function getMWTargets(t) {
  let targs = new Array();
  for (let token of canvas.tokens.objects.children) {
    if (token?.actor?.name === t.actor.name) {
      targs.push(token.actor.uuid);
    }
  }
  return targs;
}

//Gets and returns the highest IWR value from an array that is passed in
function getGreatestIWR(iwr) {
  if (iwr) {
    let gIWR = iwr[0];
    let allGIWR = [];
    for (const n of iwr) {
      if (n.value >= gIWR.value) {
        if (n.value === gIWR.value) {
          allGIWR.push(n);
        }
        gIWR = n;
      }
    }
    if (allGIWR.length > 1) {
      gIWR = allGIWR[Math.floor(Math.random() * allGIWR.length)];
    }
    return gIWR;
  }
}

//gets and returns the IWR information from from the selected token or actor
function getIWR(a) {
  if (a.actor) {
    a = a.actor;
  }
  const iwr = (() => {
    return {
      resistances: a.attributes?.resistances,
      weaknesses: a.attributes?.weaknesses,
      immunities: a.attributes?.immunities,
    };
  })();
  return iwr;
}

//Gets the thaum effects from the character
function getActorEVEffect(a, targetID) {
  if (targetID === undefined) {
    let effects = new Array();
    if (a.items !== undefined) {
      for (const item of a.items) {
        if (item.flags["pf2e-thaum-vuln"]?.EffectOrigin === a.uuid) {
          effects.push(item);
        }
      }
    } else {
      console.warn(
        `[PF2E Exploit Vulnerability] - ${a.name} has no valid items object.`,
        a
      );
    }
    return effects;
  } else if (targetID === "*") {
    let effects = new Array();
    for (let item of a.items) {
      if (TargetEffectSourceIDs.includes(item.getFlag("core", "sourceId"))) {
        effects.push(item);
      }
    }
    return effects;
  } else {
    let effects = new Array();
    if (a.items !== undefined) {
      for (const item of a.items) {
        if (item.flags["pf2e-thaum-vuln"]?.EffectOrigin === targetID) {
          effects.push(item);
        }
      }
    } else {
      console.warn(
        `[PF2E Exploit Vulnerability] - ${a.name} has no valid items object.`,
        a
      );
    }
    return effects;
  }
}

//gets and returns the greatest bypassable resistance
function BDGreatestBypassableResistance(t) {
  const r = getIWR(t).resistances;
  if (r) {
    let bypassResists = new Array();
    for (let resist of r) {
      if (resist.exceptions.length != 0) {
        bypassResists.push(resist);
      }
    }
    if (bypassResists.length != 0) {
      let gBD = bypassResists[0];
      for (let resist of bypassResists) {
        if (resist.value >= gBD.value) {
          gBD = resist;
        }
      }
      return gBD;
    }
  }
}

function targetEVPrimaryTarget(a) {
  const primaryTargetUuid = a.getFlag("pf2e-thaum-vuln", "primaryEVTarget");
  const primaryTarget = canvas.scene.tokens.filter(
    (token) => token.actor.uuid === primaryTargetUuid
  )[0]._object;
  if (primaryTarget) {
    for (const target of game.user.targets) {
      target.setTarget(false, { user: game.user, releaseOthers: false });
    }
    game.user.targets.clear();
    primaryTarget.setTarget(true, { user: game.user, releaseOthers: false });
    game.user.targets.add(primaryTarget);
  }
}

// Create an effect object, using an existing effect uuid as a template.
//
// An optional origin can be supplied, to set the actor/token/item creating the
// effect.  Origin is normally set when dragging an effect from chat, but the
// module code bypasses that step.
async function createEffectData(uuid, origin = null) {
  const effect = (await fromUuid(uuid)).toObject();
  (effect.flags.core ??= {}).sourceId = uuid;
  if (origin !== null) {
    // If context is set, then all these properties are non-optional, but can be null
    effect.system.context = {
      origin: {
        actor: origin.actor ?? null,
        token: origin.token ?? null,
        item: origin.item ?? null,
        spellcasting: origin.spellcasting ?? null,
      },
      roll: null,
      target: null,
    };
  }
  return effect;
}

export {
  targetEVPrimaryTarget,
  getMWTargets,
  getGreatestIWR,
  getIWR,
  getActorEVEffect,
  BDGreatestBypassableResistance,
  createEffectData,
};
