import {
  MORTAL_WEAKNESS_TARGET_UUID,
  PERSONAL_ANTITHESIS_TARGET_UUID,
} from ".";
import { getActorEVEffect } from "./helpers";
import { deleteEVEffect } from "../socket";
import { preDeleteEffect } from "../feats/exploit-vulnerability/exploitVulnerability";

//macro that allows GMs to apply the same exploit vulnerability on a target
async function forceEVTarget() {
  const m = await fromUuid(MORTAL_WEAKNESS_TARGET_UUID);
  const p = await fromUuid(PERSONAL_ANTITHESIS_TARGET_UUID);
  let eff;

  let a = canvas.tokens.controlled[0];
  const sa = a.actor;
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
  eff.flags["pf2e-thaum-vuln"] = { EffectOrigin: sa.uuid };
  eff.system.rules[0].value = a.actor.getFlag("pf2e-thaum-vuln", "EVValue");
  eff.name += " (" + a.actor.name + ")";
  for (let targ of tar) {
    console.log(getActorEVEffect(targ.actor, sa.uuid));
    if (getActorEVEffect(targ.actor, sa.uuid).length != 0) {
      const deleteEffectTargs = preDeleteEffect([targ], sa);
      await deleteEVEffect(deleteEffectTargs.flat());
    } else {
      await targ.actor.createEmbeddedDocuments("Item", [eff]);
    }
  }
}

export { forceEVTarget };
