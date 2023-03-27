import { getGreatestIWR } from "../utils";
function getSVTargets(t, effect) {
  let targs = new Array();
  if (effect.name.includes("Exploit Mortal Weakness")) {
    for (let token of canvas.tokens.objects.children) {
      if (
        token.actor?.attributes.weaknesses.some(
          (w) => w.type === getGreatestIWR(t.actor.attributes.weaknesses).type
        )
      ) {
        targs.push(token.actor.uuid);
      }
    }
  } else if (effect.name.includes("Exploit Personal Antithesis")) {
    for (let token of canvas.tokens.objects.children) {
      if (token.actor?.name === t.actor.name) {
        targs.push(token.actor.uuid);
      }
    }
  }
  return targs;
}

export { getSVTargets };
