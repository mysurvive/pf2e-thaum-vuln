import {
  MORTAL_WEAKNESS_TARGET_UUID,
  PERSONAL_ANTITHESIS_TARGET_UUID,
} from ".";
import { getActorEVEffect } from "./helpers";
import { deleteEVEffect } from "../socket";

//macro that allows GMs to apply the same exploit vulnerability on a target
async function forceEVTarget() {
  const m = await fromUuid(MORTAL_WEAKNESS_TARGET_UUID);
  const p = await fromUuid(PERSONAL_ANTITHESIS_TARGET_UUID);
  let eff;

  let a = canvas.tokens.controlled[0];
  let tar = Array.from(game.user.targets);
  if (canvas.tokens.controlled.length != 1 || tar.length === 0) {
    return ui.notifications.warn(
      game.i18n.localize(
        "pf2e-thaum-vuln.notifications.warn.forceEV.invalidTargets"
      )
    );
  }
  let evM = a.actor.getFlag("pf2e-thaum-vuln", "EVMode");
  if (evM === "mortal-weakness") {
    eff = m.toObject();
  } else if (evM === "personal-antithesis") {
    eff = p.toObject();
  } else {
    return ui.notifications.warn(
      game.i18n.localize(
        "pf2e-thaum-vuln.notifications.warn.forceEV.eVNotActivated"
      )
    );
  }
  eff.system.rules[0].value = a.actor.getFlag("pf2e-thaum-vuln", "EVValue");
  eff.system.rules[1].option = `origin:id:${a.actor.uuid}`;
  eff.name += " (" + a.actor.name + ")";
  for (let targ of tar) {
    if (getActorEVEffect(targ.actor)) {
      await deleteEVEffect([targ.actor]);
    } else {
      await targ.actor.createEmbeddedDocuments("Item", [eff]);
    }
  }
}

export { forceEVTarget };
