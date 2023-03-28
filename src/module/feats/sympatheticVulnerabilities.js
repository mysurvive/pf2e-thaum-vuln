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
    for (let token of canvas.tokens.objects.children) {
      if (token.actor?.name === t.actor.name) {
        targs.push(token.actor.uuid);
      }
    }
  }
  return targs;
}

export { getSVTargets };
