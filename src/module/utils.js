import {
  createEffectOnActor,
  getGreatestIWR,
  getIWR,
} from "./utils/helpers.js";
import {
  MORTAL_WEAKNESS_EFFECT_SOURCEID,
  PERSONAL_ANTITHESIS_EFFECT_SOURCEID,
  PERSONAL_ANTITHESIS_EFFECT_UUID,
  MORTAL_WEAKNESS_EFFECT_UUID,
  BREACHED_DEFENSES_EFFECT_SOURCEID,
  PERSONAL_ANTITHESIS_TARGET_SOURCEID,
  MORTAL_WEAKNESS_TARGET_SOURCEID,
  BREACHED_DEFENSES_TARGET_SOURCEID,
  CURSED_EFFIGY_SOURCEID,
  BREACHED_DEFENSES_SOURCEID,
  BREACHED_DEFENSES_EFFECT_UUID,
} from "./utils/index.js";

const HelpfulEffectSourceIDs = new Array(
  MORTAL_WEAKNESS_EFFECT_SOURCEID,
  PERSONAL_ANTITHESIS_EFFECT_SOURCEID,
  BREACHED_DEFENSES_EFFECT_SOURCEID
);

const TargetEffectSourceIDs = new Array(
  PERSONAL_ANTITHESIS_TARGET_SOURCEID,
  MORTAL_WEAKNESS_TARGET_SOURCEID,
  BREACHED_DEFENSES_TARGET_SOURCEID,
  CURSED_EFFIGY_SOURCEID
);

//gets and returns the greatest bypassable resistance
export function BDGreatestBypassableResistance(t) {
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
