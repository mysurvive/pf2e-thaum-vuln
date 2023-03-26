import {
  MORTAL_WEAKNESS_TARGET_UUID,
  PERSONAL_ANTITHESIS_TARGET_UUID,
  MORTAL_WEAKNESS_EFFECT_SOURCEID,
  PERSONAL_ANTITHESIS_EFFECT_SOURCEID,
  BREACHED_DEFENSES_TARGET_UUID,
  BREACHED_DEFENSES_EFFECT_SOURCEID,
  CURSED_EFFIGY_UUID,
  CURSED_EFFIGY_SOURCEID,
} from "./utils.js";

import { getActorEVEffect, getGreatestIWR, getIWR } from "./utils.js";

let socket;

Hooks.once("socketlib.ready", () => {
  socket = socketlib.registerModule("pf2e-thaum-vuln");
  socket.register("createEffectOnTarget", _socketCreateEffectOnTarget);
  socket.register("updateEVEffect", _socketUpdateEVEffect);
  socket.register("deleteEVEffect", _socketDeleteEVEffect);
  socket.register("applySWEffect", _socketApplySWEffect);
  socket.register("sharedWarding", _socketSharedWarding);
  socket.register("ubiquitousWeakness", _socketUbiquitousWeakness);
});

export function createEffectOnTarget(a, t, effect, evTargets) {
  let aID = a.uuid;
  let tID = t.actor.uuid;
  let eID = effect.uuid;
  return socket.executeAsGM(
    _socketCreateEffectOnTarget,
    aID,
    tID,
    eID,
    evTargets
  );
}

export function ubiquitousWeakness(eff) {
  const a = canvas.tokens.controlled[0];
  const allies = canvas.tokens.placeables.filter(
    (token) => token.actor?.alliance === "party" && a.distanceTo(token) <= 30
  );

  const dgContent = $(
    `<div>${game.i18n.localize(
      "pf2e-thaum-vuln.ubiquitousWeakness.flavor"
    )}</div>`
  );
  const dgInnerContent = $(
    `<div class="flex-container" style="display: flex; flex-wrap: wrap; justify-content: space-around"></div>`
  );

  let selectedAlly = new Array();
  for (let ally of allies) {
    if (ally.actor.uuid != game.user.character?.uuid) {
      const allyWrapper = $(
        `<div class="pf2e-ev" style="padding: 0.5rem;"></div>`
      );
      const allyBtn = $(
        `<button style="background: url(${ally.document.texture.src}); background-size:contain; width:10rem; height:10rem;" class="ally-button" id=${ally.actor.uuid}>`
      );
      const allyName = $(
        `<p style="text-align: center">${ally.actor.name}</p>`
      );

      $(document).ready(function () {
        $(".ally-button")
          .off("click")
          .on("click", function (e) {
            if (!selectedAlly.includes(e.target.attributes.allyuuid.value)) {
              $(e.currentTarget).css("background-color", "red");
              selectedAlly.push(e.target.attributes.allyuuid.value);
            } else {
              $(e.currentTarget).css("background-color", "rgba(0,0,0,0)");
              let index = selectedAlly.indexOf(
                e.target.attributes.allyuuid.value
              );
              selectedAlly.splice(index, 1);
            }
          });
      });

      allyBtn.attr("allyuuid", ally.actor.uuid);
      allyBtn.appendTo(allyWrapper);
      allyName.appendTo(allyWrapper);
      allyWrapper.appendTo(dgInnerContent);
    }
  }
  dgInnerContent.appendTo(dgContent);

  let dg = new Dialog({
    title: game.i18n.localize("pf2e-thaum-vuln.ubiquitousWeakness.name"),
    content: dgContent.html(),
    buttons: {
      confirm: {
        label: game.i18n.localize("pf2e-thaum-vuln.dialog.confirm"),
        callback: async () => {
          await socket.executeAsGM(
            _socketUbiquitousWeakness,
            selectedAlly,
            a.actor.uuid,
            eff
          );
        },
      },
    },
    default: "confirm",
    render: () => {},
    close: () => {},
  });
  dg.render(true);
}

export function sharedWarding(eff) {
  return socket.executeAsGM(_socketSharedWarding, eff);
}

export async function applySWEffect(sa, selectedAlly, EVEffect) {
  return socket.executeAsGM(_socketApplySWEffect, sa, selectedAlly, EVEffect);
}

export function updateEVEffect(a, damageType) {
  return socket.executeAsGM(_socketUpdateEVEffect, a, damageType);
}

export function deleteEVEffect(a, sa = undefined) {
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
    return socket.executeAsGM(_socketDeleteEVEffect, targ);
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
    return socket.executeAsGM(_socketDeleteEVEffect, targ, actorID);
  }
}

async function _socketCreateEffectOnTarget(aID, tID, eID, evTargets) {
  const a = await fromUuid(aID);
  const t = await fromUuid(tID);
  const e = await fromUuid(eID);

  let eff = e.toObject();

  const m = await fromUuid(MORTAL_WEAKNESS_TARGET_UUID);
  const p = await fromUuid(PERSONAL_ANTITHESIS_TARGET_UUID);
  const b = await fromUuid(BREACHED_DEFENSES_TARGET_UUID);
  const ce = await fromUuid(CURSED_EFFIGY_UUID);

  const iwrData = getIWR(t);

  if (eff.flags.core.sourceId === MORTAL_WEAKNESS_EFFECT_SOURCEID) {
    eff = m.toObject();
    if (iwrData.weaknesses.length != 0) {
      eff.system.rules[0].value = getGreatestIWR(iwrData.weaknesses)?.value;
    }
    a.setFlag("pf2e-thaum-vuln", "EVValue", `${eff.system.rules[0].value}`);
  } else if (eff.flags.core.sourceId === PERSONAL_ANTITHESIS_EFFECT_SOURCEID) {
    eff = p.toObject();
    eff.system.rules[0].value = Math.floor(a.level / 2) + 2;
    a.setFlag("pf2e-thaum-vuln", "EVValue", `${eff.system.rules[0].value}`);
  } else if (eff.flags.core.sourceId === BREACHED_DEFENSES_EFFECT_SOURCEID) {
    eff = b.toObject();
  } else if (eff.flags.core.sourceId === CURSED_EFFIGY_SOURCEID) {
    eff = ce.toObject();
  }
  eff.system.rules.find(
    (rules) => rules.key === "RollOption"
  ).option = `origin:id:${a.uuid}`;

  eff.name = eff.name + ` (${a.name})`;
  for (let targ of evTargets) {
    let tg = await fromUuid(targ);
    if (tg.actor) {
      tg = tg.actor;
    }
    tg.createEmbeddedDocuments("Item", [eff]);
  }
  return;
}

//This is a temporary fix until a later pf2e system update. The function hooks on renderChatMessage attack-rolls
//If the thaumaturge makes an attack-roll, the target's weakness updates with the correct amount
//If it's not the thaumaturge that makes the attack-roll, it changes the weakness to 0
async function _socketUpdateEVEffect(a, damageType) {
  let updates;
  let tKey;
  let value;
  let origin;
  let rollOptionData;
  if (a === undefined) {
    for (let act of canvas.tokens.placeables) {
      if (act.actor) {
        for (let effect of getActorEVEffect(act.actor, "*")) {
          if (effect?.rules.find((r) => r.key === "Weakness")) {
            if (
              effect?.rules[1]?.option.split(":")[2] != `Actor${a}` &&
              effect?.rules[1]?.option
            ) {
              value = 0;
            } else if (effect?.rules[1]?.option) {
              let acts = effect.rules[1].option.split(":")[2];
              acts = acts.replace("Actor", "Actor.");
              origin = await fromUuid(acts);
              value = origin.getFlag("pf2e-thaum-vuln", "EVValue");
            }
            tKey = effect._id;
            rollOptionData = effect.rules[1]?.option.replace("Actor", "Actor.");
            updates = {
              _id: tKey,
              system: {
                rules: [
                  {
                    key: "Weakness",
                    type: "physical",
                    value: 0,
                    predicate: [],
                    slug: effect.rules[0].slug,
                  },
                  {
                    key: "RollOption",
                    domain: "damage-roll",
                    option: rollOptionData,
                  },
                ],
              },
            };

            await act.actor.updateEmbeddedDocuments("Item", [updates]);
          }
        }
      }
    }
    return;
  }
  let sa = await fromUuid(`Actor.${a}`);

  if (!sa) {
    return;
  }

  if (!(sa.getFlag("pf2e-thaum-vuln", "EVMode") === "breached-defenses")) {
    for (let act of canvas.tokens.placeables) {
      if (act.actor?.uuid != a.uuid) {
        for (let effect of getActorEVEffect(act.actor, "*")) {
          if (effect?.rules.find((r) => r.key === "Weakness")) {
            if (
              (effect?.rules[1]?.option.split(":")[2] === `Actor${a}` ||
                sa.getFlag("pf2e-thaum-vuln", "effectSource") ===
                  effect?.rules[1]?.option
                    .split(":")[2]
                    .replace("Actor", "Actor.")) &&
              effect?.rules[1]?.option
            ) {
              let acts = effect.rules[1].option.split(":")[2];
              acts = acts.replace("Actor", "Actor.");
              origin = await fromUuid(acts);
              value = origin.getFlag("pf2e-thaum-vuln", "EVValue");
            } else if (effect?.rules[1]?.option) {
              value = 0;
            }
            tKey = effect._id;

            rollOptionData = effect.rules[1]?.option.replace("Actor", "Actor.");
            updates = {
              _id: tKey,
              system: {
                rules: [
                  {
                    key: "Weakness",
                    type: `${damageType}`.slugify(),
                    value: value,
                    predicate: [],
                    slug: effect.rules[0].slug,
                  },
                  {
                    key: "RollOption",
                    domain: "damage-roll",
                    option: rollOptionData,
                  },
                ],
              },
            };
            await act.actor.updateEmbeddedDocuments("Item", [updates]);
          }
        }
      }
    }
  }
}

//Deletes the effect from the actor passed to the method
async function _socketDeleteEVEffect(targ, actorID) {
  let eff;
  let a;
  if (actorID === undefined) {
    for (let act of targ) {
      a = await fromUuid(act);
      if (a.actor) {
        a = a.actor;
      }
      eff = getActorEVEffect(a);
      eff.delete();
    }
  } else {
    for (let token of canvas.scene.tokens) {
      if (token.actor?.getFlag("pf2e-thaum-vuln", "effectSource") === actorID) {
        eff = getActorEVEffect(token.actor);
        token.actor.unsetFlag("pf2e-thaum-vuln", "effectSource");
        eff.delete();
      }
    }
    for (let act of targ) {
      a = await fromUuid(act);
      if (a.uuid != actorID) {
        if (a.actor) {
          a = a.actor;
        }
        eff = getActorEVEffect(a, actorID);
        for (let e of eff) {
          await e.delete();
        }
      } else {
        eff = getActorEVEffect(a, undefined);
        eff.delete();
      }
    }
  }
}

async function _socketApplySWEffect(saUuid, selectedAlly, EVEffect) {
  const ally = await fromUuid(selectedAlly);
  const sa = await fromUuid(saUuid);
  const EVValue = sa.getFlag("pf2e-thaum-vuln", "EVValue");
  ally.createEmbeddedDocuments("Item", [EVEffect]);
  ally.setFlag("pf2e-thaum-vuln", "effectSource", saUuid);
  ally.setFlag("pf2e-thaum-vuln", "EVValue", EVValue);
  return;
}

async function _socketUbiquitousWeakness(allies, saUuid, EVEffect) {
  const sa = await fromUuid(saUuid);
  const EVValue = sa.getFlag("pf2e-thaum-vuln", "EVValue");
  for (let ally of allies) {
    ally = await fromUuid(ally);
    ally.createEmbeddedDocuments("Item", [EVEffect]);
    ally.setFlag("pf2e-thaum-vuln", "effectSource", saUuid);
    ally.setFlag("pf2e-thaum-vuln", "EVValue", EVValue);
  }
}

async function _socketSharedWarding(eff) {
  const a = canvas.tokens.controlled[0];
  const allTokens = canvas.tokens.placeables;

  const affectedTokens = allTokens.filter(
    (token) => a.distanceTo(token) <= 30 && token.actor.alliance === "party"
  );
  for (let token of affectedTokens) {
    if (token != a) {
      await token.actor.createEmbeddedDocuments("Item", [eff]);
      token.actor.setFlag("pf2e-thaum-vuln", "EWSourceActor", a.actor.uuid);
    }
  }
}
