import { getSVTargets } from "../feats/sympatheticVulnerabilities";
import {
  PERSONAL_ANTITHESIS_EFFECT_SOURCEID,
  MORTAL_WEAKNESS_EFFECT_SOURCEID,
  BREACHED_DEFENSES_EFFECT_SOURCEID,
  MORTAL_WEAKNESS_TARGET_UUID,
  PERSONAL_ANTITHESIS_TARGET_UUID,
  BREACHED_DEFENSES_TARGET_UUID,
  TargetEffectSourceIDs,
} from ".";
import { createEffectOnTarget } from "../socket";
import { createEsotericWarden } from "../feats/esotericWarden";
import { createUWDialog } from "../feats/ubiquitousWeakness";
import { createBreachedDefenses } from "../feats/breachedDefenses";

function getMWTargets(t) {
  let targs = new Array();
  for (let token of canvas.tokens.objects.children) {
    if (token?.actor?.name === t.actor.name) {
      targs.push(token.actor.uuid);
    }
  }
  return targs;
}

const effectPairing = {
  "mortal-weakness": MORTAL_WEAKNESS_TARGET_UUID,
  "personal-antithesis": PERSONAL_ANTITHESIS_TARGET_UUID,
  "breached-defenses": BREACHED_DEFENSES_TARGET_UUID,
};

//Creates the passed effect document on the actor
async function createEffectOnActor(sa, t, effect, rollDOS) {
  let eff = effect.toObject();
  let evMode, EWPredicate, effRuleSlug, effPredicate, effSlug;

  const gIWR = getGreatestIWR(t.actor.attributes.weaknesses);
  const useEVAutomation = game.settings.get(
    "pf2e-thaum-vuln",
    "useEVAutomation"
  );
  const hasEsotericWarden = sa.items.some((i) => i.slug === "esoteric-warden");
  const hasUbiquitousWeakness = sa.items.some(
    (i) => i.slug === "ubiquitous-weakness"
  );
  const hasSympatheticVulnerabilities = sa.items.some(
    (i) => i.slug === "sympathetic-vulnerabilities"
  );

  let evTargets = new Array();
  if (eff.flags.core.sourceId === MORTAL_WEAKNESS_EFFECT_SOURCEID) {
    EWPredicate = "mortal-weakness-target";
    if (getIWR(t).weaknesses.length === 0) {
      return ui.notifications.warn(
        game.i18n.localize(
          "pf2e-thaum-vuln.notifications.warn.mortalWeakness.noWeakness"
        )
      );
    }
    if (useEVAutomation) {
      evTargets = getMWTargets(t);
      if (hasSympatheticVulnerabilities) {
        evTargets = evTargets.concat(getSVTargets(t, eff, gIWR));
      }
    }
    effPredicate = [
      `target:effect:Mortal Weakness Target ${sa.name}`.slugify(),
    ];
    effRuleSlug = "mortal-weakness-effect-magical";
    effSlug = "exploit-mortal-weakness";

    evMode = "mortal-weakness";
  } else if (eff.flags.core.sourceId === PERSONAL_ANTITHESIS_EFFECT_SOURCEID) {
    if (hasSympatheticVulnerabilities && useEVAutomation) {
      evTargets = evTargets.concat(getSVTargets(t, eff, gIWR));
    }
    EWPredicate = "personal-antithesis-target";
    effPredicate =
      `target:effect:Personal Antithesis Target ${sa.name}`.slugify();
    effRuleSlug = "personal-antithesis-effect-magical";
    evMode = "personal-antithesis";

    //breached defenses logic. It mostly works.... there are a few weird cases where it doesn't work such as when the highest
    //resistance that can be bypassed is a combination of two traits (see adamantine golem's resistance bypass from vorpal-adamantine)
    //or if the trait that bypasses it is not in the system/on my list
  } else if (eff.flags.core.sourceId === BREACHED_DEFENSES_EFFECT_SOURCEID) {
    const bypassable = BDGreatestBypassableResistance(t);
    let bDData = await createBreachedDefenses(sa, eff, bypassable);
    evMode = bDData.evMode;
    effPredicate = bDData.effPredicate;
    effRuleSlug = bDData.effRuleSlug;
  }

  if (hasEsotericWarden && rollDOS > 1) {
    createEsotericWarden(rollDOS, EWPredicate, sa, t);
  }

  eff.slug = effSlug;
  eff.system.rules.find((rules) => rules.slug === effRuleSlug).predicate =
    effPredicate;
  if (!evTargets.includes(t.actor.uuid)) {
    evTargets.push(t.actor.uuid);
  }
  //makes sure we don't have duplicates in the target array
  evTargets = [...new Set(evTargets)];

  let iwrData = getIWR(t);
  if (iwrData.weaknesses.length != 0) {
    iwrData = getGreatestIWR(iwrData.weaknesses)?.value;
  }

  let targEffect = await fromUuid(effectPairing[evMode]);
  targEffect = targEffect.toObject();
  targEffect.flags["pf2e-thaum-vuln"] = { EffectOrigin: sa.uuid };
  targEffect.system.slug = (targEffect.system.slug + "-" + sa.name).slugify();

  console.log("target effect", targEffect);

  eff.flags["pf2e-thaum-vuln"] = { EffectOrigin: sa.uuid };
  await createEffectOnTarget(sa, targEffect, evTargets, iwrData);

  await sa.setFlag("pf2e-thaum-vuln", "effectSource", sa.uuid);
  await sa.setFlag("pf2e-thaum-vuln", "activeEV", true);
  await sa.setFlag("pf2e-thaum-vuln", "EVTargetID", evTargets);
  await sa.setFlag("pf2e-thaum-vuln", "EVMode", `${evMode}`);

  await sa.createEmbeddedDocuments("Item", [eff]);
  if (hasUbiquitousWeakness && evMode === "mortal-weakness") {
    createUWDialog(eff);
  }
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
    for (const item of a.items) {
      if (item.flags["pf2e-thaum-vuln"]?.EffectOrigin === a.uuid) {
        effects.push(item);
      }
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
    for (const item of a.items) {
      if (item.flags["pf2e-thaum-vuln"]?.EffectOrigin === targetID) {
        effects.push(item);
      }
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

export {
  getMWTargets,
  createEffectOnActor,
  getGreatestIWR,
  getIWR,
  getActorEVEffect,
  BDGreatestBypassableResistance,
};
