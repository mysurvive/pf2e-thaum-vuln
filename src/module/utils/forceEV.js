import {
  MORTAL_WEAKNESS_TARGET_UUID,
  PERSONAL_ANTITHESIS_TARGET_UUID,
} from ".";
import { EVEffectsSourceIDs } from "./index";
import { deleteEVEffect } from "../socket";
import { createEffectData } from "./helpers";

//macro that allows GMs to apply the same exploit vulnerability on a target
async function forceEVTarget() {
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

  const effectUuids = {
    "mortal-weakness": MORTAL_WEAKNESS_TARGET_UUID,
    "personal-antithesis": PERSONAL_ANTITHESIS_TARGET_UUID,
  };
  const uuid = effectUuids[sa.getFlag("pf2e-thaum-vuln", "EVMode")];
  if (!uuid) {
    return ui.notifications.warn(
      game.i18n.localize(
        "pf2e-thaum-vuln.notifications.warn.forceEV.eVNotActivated"
      )
    );
  }
  const eff = await createEffectData(uuid, {
    actor: sa,
    token: a,
  });
  eff.system.rules[0].value = a.actor.getFlag("pf2e-thaum-vuln", "EVValue");
  eff.name += " (" + a.actor.name + ")";
  for (let targ of tar) {
    const effects =
      targ.actor?.itemTypes.effect.filter(
        (e) => e.origin === sa && EVEffectsSourceIDs.has(e.sourceId)
      ) ?? [];
    if (effects.length != 0) {
      deleteEVEffect(effects.map((e) => e.id));
    } else {
      await targ.actor.createEmbeddedDocuments("Item", [eff]);
    }
  }
}

export { forceEVTarget };
