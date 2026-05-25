import {
  MORTAL_WEAKNESS_TARGET_UUID,
  PERSONAL_ANTITHESIS_TARGET_UUID,
} from ".";
import { EVEffectsSourceIDs } from "./index";
import { deleteEVEffect } from "../socket";
import { createEffectData } from "./helpers";

//macro that allows GMs to apply the same exploit vulnerability on a target
async function forceEVTarget() {
  if (canvas.tokens.controlled.length != 1 || game.user.targets.length === 0) {
    return ui.notifications.warn(
      game.i18n.localize(
        "pf2e-thaum-vuln.notifications.warn.forceEV.invalidTargets"
      )
    );
  }

  const controlledToken = canvas.tokens.controlled[0];
  const controlledActor = controlledToken.actor;
  let targets = Array.from(game.user.targets);

  const effectUuids = {
    "mortal-weakness": MORTAL_WEAKNESS_TARGET_UUID,
    "personal-antithesis": PERSONAL_ANTITHESIS_TARGET_UUID,
  };

  const uuid =
    effectUuids[controlledActor.getFlag("pf2e-thaum-vuln", "EVMode")];
  if (!uuid) {
    return ui.notifications.warn(
      game.i18n.localize(
        "pf2e-thaum-vuln.notifications.warn.forceEV.eVNotActivated"
      )
    );
  }

  const eff = await createEffectData(uuid, {
    actor: controlledActor.uuid,
    token: controlledToken.uuid,
  });

  eff.system.rules[0].value = controlledToken.actor.getFlag(
    "pf2e-thaum-vuln",
    "EVValue"
  );

  eff.name += " (" + controlledToken.actor.name + ")";

  for (let target of targets) {
    const effects =
      target.actor?.itemTypes.effect.filter(
        (e) =>
          e.origin === controlledActor && EVEffectsSourceIDs.has(e.sourceId)
      ) ?? [];
    if (effects.length != 0) {
      deleteEVEffect(effects.map((e) => e.uuid));
    } else {
      await target.actor.createEmbeddedDocuments("Item", [eff]);
    }
  }
}

export { forceEVTarget };
