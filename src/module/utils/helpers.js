import { TargetEffectSourceIDs } from ".";

function getMWTargets(t) {
  let targs = new Array();
  for (let token of canvas.tokens.objects.children) {
    if (
      (t.actor.sourceId && token?.actor?.sourceId === t.actor.sourceId) ||
      (t.actor.prototypeToken?.name &&
        token?.actor?.prototypeToken?.name === t.actor.prototypeToken?.name)
    ) {
      targs.push(token.actor.uuid);
    }
  }
  return targs;
}

/**
 * Gets and returns the highest IWR value from an array that is passed in
 *
 * @param iwr An array of weaknesses pulled from the target actor
 * @returns   The highest weakness from the target or a randomly selected weakness if the target
 *            has multiple highest weaknesses of the same value
 */
function getGreatestIWR(iwr) {
  if (iwr) {
    let gIWR = iwr[0];
    for (const n of iwr) {
      if (n.value >= gIWR.value) {
        gIWR = n;
      }
    }
    const allGIWR = iwr.filter((w) => w.value === gIWR.value);
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

// Return an array of Tokens that are the targets of the message.  Message
// should be something that has targets, like a damage roll.
function messageTargetTokens(message) {
  // It's ok to use fromUuidSync here since any tokens that are the targets of a
  // current attack will surely be in the game.
  return (
    message
      .getFlag("pf2e-thaum-vuln", "targets")
      ?.map((t) => fromUuidSync(t.tokenUuid)?.object) ?? []
  );

  // The system already has a flag, getFlag('pf2e', 'context.target'), for the
  // target of attack damage rolls.  But it's limited to one target and doesn't
  // get set on saving throw spell damage rolls.
}

// Does the actor have the feat, searching by slug
function hasFeat(actor, slug) {
  return actor.itemTypes.feat.some((feat) => feat.slug === slug);
}

function getEffectOnActor(actor, sourceId) {
  return actor.itemTypes.effect.find((effect) => effect.sourceId === sourceId);
}

function getTargetRollOptions(actor) {
  const selfRollOptions = actor.getSelfRollOptions();
  return selfRollOptions.map((t) => t.replace(/^self/, "target"));
}

export {
  targetEVPrimaryTarget,
  getMWTargets,
  getEffectOnActor,
  getGreatestIWR,
  getIWR,
  getActorEVEffect,
  getTargetRollOptions,
  BDGreatestBypassableResistance,
  createEffectData,
  hasFeat,
  messageTargetTokens,
};
