import {
  MORTAL_WEAKNESS_EFFECT_UUID,
  PERSONAL_ANTITHESIS_EFFECT_UUID,
} from "../utils";

/**
 * Gets the targets for Sympathetic Vulnerabilities.
 *
 * @param t       the targeted token document
 * @param effect  either the Exploit Mortal Weakness or Exploit Personal Antithesis effect
 * @param gIWR    the greatest weakness found on the enemy
 *
 * @returns       Array of tokens on the current scene that are valid Sympathetic Vulnerability targets
 */

function getSVTargets(t, effect, gIWR) {
  let targs = new Array();
  if (effect._stats.compendiumSource === MORTAL_WEAKNESS_EFFECT_UUID) {
    for (let token of canvas.tokens.objects.children) {
      if (
        token.actor?.attributes.weaknesses.some((w) => w.type === gIWR.type)
      ) {
        targs.push(token.actor.uuid);
      }
    }
  } else if (
    effect._stats.compendiumSource === PERSONAL_ANTITHESIS_EFFECT_UUID
  ) {
    if (t.actor.traits.has("humanoid") || !t.actor.sourceId) return [];
    for (let token of canvas.tokens.objects.children) {
      if (token.actor?.sourceId === t.actor.sourceId) {
        targs.push(token.actor.uuid);
      }
    }
  }
  return targs;
}

export { getSVTargets };
