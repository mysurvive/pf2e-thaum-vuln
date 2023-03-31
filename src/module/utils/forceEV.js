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
      const deleteEffectTargs = preDeleteEffect(canvas.tokens.placeables, sa);
      await deleteEVEffect(deleteEffectTargs.targ, deleteEffectTargs.actorID);
    } else {
      await targ.actor.createEmbeddedDocuments("Item", [eff]);
    }
  }
}

function preDeleteEffect(a, sa = undefined) {
  let targ = new Array();
  if (sa === undefined) {
    for (let tg of a) {
      if (tg.actor) {
        if (getActorEVEffect(tg.actor)) {
          targ.push(tg.actor.uuid);
        }
      } else {
        if (getActorEVEffect(tg)) {
          targ.push(tg.uuid);
        }
      }
    }
    return { targ: targ };
  } else {
    let actorID = sa.uuid;
    let effect;
    for (let tg of a) {
      if (tg?.actor) {
        if (getActorEVEffect(tg.actor)) {
          effect = getActorEVEffect(tg.actor);
          if (
            effect.system?.rules
              .find((rules) => rules.key === "RollOption")
              ?.option?.split(":")[2] === actorID
          ) {
            targ.push(tg.actor.uuid);
          } else if (tg.actor === sa) {
            targ.push(tg.actor.uuid);
          }
        }
      } else {
        if (getActorEVEffect(tg)) {
          if (tg.uuid != actorID) {
            effect = getActorEVEffect(tg);
            if (
              effect.system.rules
                .find((rules) => rules.key === "RollOption")
                .option.split(":")[2] === actorID
            ) {
              targ.push(tg.uuid);
            }
          } else {
            targ.push(actorID);
          }
        }
      }
    }
    return { targ: targ, actorID: actorID };
  }
}

export { forceEVTarget };
