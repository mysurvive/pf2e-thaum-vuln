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
  if (effect.name.includes("Exploit Mortal Weakness")) {
    for (let token of canvas.tokens.objects.children) {
      if (
        token.actor?.attributes.weaknesses.some((w) => w.type === gIWR.type)
      ) {
        targs.push(token.actor.uuid);
      }
    }
  } else if (effect.name.includes("Exploit Personal Antithesis")) {
    if (t.actor.traits.has("humanoid")) return [];
    for (let token of canvas.tokens.objects.children) {
      if (token.actor?.name === t.actor.name) {
        targs.push(token.actor.uuid);
      }
    }
  }
  return targs;
}

export { getSVTargets };
