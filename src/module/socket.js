import {
  MORTAL_WEAKNESS_TARGET_SOURCEID,
  PERSONAL_ANTITHESIS_TARGET_SOURCEID,
} from "./utils/index.js";
import { parseHTML } from "./utils/helpers.js";

let socket;

Hooks.once("socketlib.ready", () => {
  socket = socketlib.registerModule("pf2e-thaum-vuln");
  socket.register("createEffectOnTarget", _socketCreateEffectOnTarget);
  socket.register("updateEVEffect", _socketUpdateEVEffect);
  socket.register("deleteEVEffect", _socketDeleteEVEffect);
  socket.register("applySWEffect", _socketApplySWEffect);
  socket.register("sharedWarding", _socketSharedWarding);
  socket.register("ubiquitousWeakness", _socketUbiquitousWeakness);
  socket.register("createRKDialog", _createRKDialog);
});

export function createEffectOnTarget(a, effect, evTargets, iwrData) {
  let aID = a.uuid;
  return socket.executeAsGM(
    _socketCreateEffectOnTarget,
    aID,
    effect,
    evTargets,
    iwrData
  );
}

export function ubiquitousWeakness(eff, selectedAlly, a) {
  return socket.executeAsGM(
    _socketUbiquitousWeakness,
    selectedAlly,
    a.actor.uuid,
    eff
  );
}

export function sharedWarding(eff, a) {
  return socket.executeAsGM(_socketSharedWarding, eff, a);
}

export async function applySWEffect(sa, selectedAlly, EVEffect) {
  return socket.executeAsGM(_socketApplySWEffect, sa, selectedAlly, EVEffect);
}

export function updateEVEffect(targ, effect, value, damageType) {
  return socket.executeAsGM(
    _socketUpdateEVEffect,
    targ,
    effect,
    value,
    damageType
  );
}

export function deleteEVEffect(effects) {
  return socket.executeAsGM(_socketDeleteEVEffect, effects);
}

export function createRKDialog(sa, targ, skill) {
  const gmUserId = game.users.find((u) => u.isGM === true).id;
  return socket.executeAsUser(
    _createRKDialog,
    gmUserId,
    sa.uuid,
    targ.actor.token.uuid,
    skill
  );
}

async function _socketCreateEffectOnTarget(aID, effect, evTargets, iwrData) {
  const a = await fromUuid(aID);

  if (effect.flags.core.sourceId === MORTAL_WEAKNESS_TARGET_SOURCEID) {
    effect.system.rules[0].value = iwrData;
    a.setFlag("pf2e-thaum-vuln", "EVValue", `${effect.system.rules[0].value}`);
  } else if (
    effect.flags.core.sourceId === PERSONAL_ANTITHESIS_TARGET_SOURCEID
  ) {
    effect.system.rules[0].value = Math.floor(a.level / 2) + 2;
    a.setFlag("pf2e-thaum-vuln", "EVValue", `${effect.system.rules[0].value}`);
  }

  effect.name = effect.name + ` (${a.name})`;
  for (let targ of evTargets) {
    let tg = await fromUuid(targ);
    if (tg.actor) {
      tg = tg.actor;
    }
    await tg.createEmbeddedDocuments("Item", [effect]);
  }
  return;
}

//This is a temporary fix until a later pf2e system update. The function hooks on renderChatMessage attack-rolls
//If the thaumaturge makes an attack-roll, the target's weakness updates with the correct amount
//If it's not the thaumaturge that makes the attack-roll, it changes the weakness to 0
async function _socketUpdateEVEffect(targ, effect, value, damageType) {
  for (let eff of effect) {
    eff = await fromUuid(eff);
    targ = await fromUuid(targ);
    if (eff.slug !== "breached-defenses-target") {
      const updates = {
        _id: eff._id,
        system: {
          rules: [
            {
              key: "Weakness",
              type: game.pf2e.system.sluggify(damageType),
              value: value,
              predicate: [],
              slug: eff.system.rules[0].slug,
            },
          ],
        },
      };
      await targ.updateEmbeddedDocuments("Item", [updates]);
    }
  }
}

//Deletes the effect from the actor passed to the method
async function _socketDeleteEVEffect(effects) {
  for (let effect of effects) {
    effect = await fromUuid(effect);
    effect.delete();
  }
}

async function _socketApplySWEffect(saUuid, selectedAlly, EVEffect) {
  const ally = await fromUuid(selectedAlly);
  const sa = await fromUuid(saUuid);
  EVEffect = await fromUuid(EVEffect);
  const EVValue = sa.getFlag("pf2e-thaum-vuln", "EVValue");
  await ally.createEmbeddedDocuments("Item", [EVEffect]);
  await ally.setFlag("pf2e-thaum-vuln", "effectSource", saUuid);
  await ally.setFlag("pf2e-thaum-vuln", "EVValue", EVValue);
  return;
}

async function _socketUbiquitousWeakness(allies, saUuid, EVEffect) {
  const sa = await fromUuid(saUuid);
  const EVValue = sa.getFlag("pf2e-thaum-vuln", "EVValue");
  for (let ally of allies) {
    ally = await fromUuid(ally);
    await ally.createEmbeddedDocuments("Item", [EVEffect]);
    await ally.setFlag("pf2e-thaum-vuln", "effectSource", saUuid);
    await ally.setFlag("pf2e-thaum-vuln", "EVValue", EVValue);
  }
}

async function _socketSharedWarding(eff, a) {
  a = await fromUuid(a);
  const allTokens = canvas.tokens.placeables;
  eff = await fromUuid(eff);

  const affectedTokens = allTokens.filter(
    (token) =>
      a._object.distanceTo(token) <= 30 && token.actor.alliance === "party"
  );
  for (let token of affectedTokens) {
    if (token != a._object) {
      await token.actor.createEmbeddedDocuments("Item", [eff]);
      token.actor.setFlag(
        "pf2e-thaum-vuln",
        "EVTargetID",
        a.actor.getFlag("pf2e-thaum-vuln", "EVTargetID")
      );
      token.actor.setFlag("pf2e-thaum-vuln", "EWSourceActor", a.actor.uuid);
    }
  }
}

async function _createRKDialog(saUuid, targUuid, skill) {
  const sa = await fromUuid(saUuid);
  const targ = await fromUuid(targUuid);
  const hasDiverseLore = sa.items.some((i) => i.slug === "diverse-lore");
  const esotericLoreModifier = game.settings.get(
    "pf2e-thaum-vuln",
    "esotericLoreModifier"
  );

  let dgContent = {
    name: sa.name,
    esotericLoreModifier: esotericLoreModifier,
    targ: {
      name: targ?.name,
      dc: targ?.actor?.identificationDCs?.standard?.dc,
    },
  };
  if (hasDiverseLore) {
    dgContent = { ...dgContent, hasDiverseLore: true };
  }

  console.log("second targ", targ);
  const dgButtons = {
    roll: {
      label: "Roll",
      callback: async (html) => {
        const rollELModifier = $(html).find(`[id="el-modifier"]`)[0].value ?? 0;
        const rollTarget = $(html).find(`[id="target"]`)[0].value ?? 0;
        const rollDC = $(html).find(`[id="dc"]`)[0].value ?? 0;
        const hasDiverseLore = sa.items.some((i) => i.slug === "diverse-lore");
        let traits = ["concentrate", "secret"];
        const rollOptions = sa.getRollOptions(["skill-check", skill.slug]);
        const diverseLoreModifier = new game.pf2e.Modifier({
          slug: "diverse-lore-penalty",
          label: "Diverse Lore Penalty",
          modifier: parseInt(rollTarget),
          type: "untyped",
          enabled: true,
          ignored: false,
          source: "",
          notes: "",
        });

        if (hasDiverseLore) {
          traits.push("thaumaturge");
        }

        const outcomes = {
          criticalSuccess:
            "You remember the creature's weaknesses, and as you empower your esoterica, you have a flash of insight that grants even more knowledge about the creature. You learn all of the creature's resistances, weaknesses, and immunities, including the amounts of the resistances and weaknesses and any unusual weaknesses or vulnerabilities, such as what spells will pass through a golem's antimagic. You can exploit either the creature's mortal weakness or personal antithesis (see below). Your unarmed and weapon Strikes against the creature also become magical if they weren't already.",
          success:
            "You recall an important fact about the creature, learning its highest weakness (or one of its highest weaknesses, if it has multiple with the same value) but not its other weaknesses, resistances, or immunities. You can exploit either the creature's mortal weakness or personal antithesis. Your unarmed and weapon Strikes against the creature also become magical if they weren't already.",
          failure:
            "Failing to recall a salient weakness about the creature, you instead attempt to exploit a more personal vulnerability. You can exploit only the creature's personal antithesis. Your unarmed and weapon Strikes against the creature also become magical if they weren't already.",
          criticalFailure:
            "You couldn't remember the right object to use and become distracted while you rummage through your esoterica. You become flat-footed until the beginning of your next turn.",
        };

        const notes = Object.entries(outcomes).map(([outcome, text]) => ({
          title: game.i18n.localize(
            "PF2E.Check.Result.Degree.Check." + outcome
          ),
          text,
          outcome: [outcome],
        }));

        const flavor = `Recall Esoteric Knowledge: ${skill.label}`;
        const checkModifier = new game.pf2e.CheckModifier(
          flavor,
          skill,
          diverseLoreModifier
        );
        let rollData = {
          actor: sa,
          type: "skill-check",
          options: rollOptions,
          notes,
          dc: { value: parseInt(rollDC) + parseInt(rollELModifier) },
          traits: traits.map((t) => ({
            name: t,
            label: CONFIG.PF2E.actionTraits[t] ?? t,
            description: CONFIG.PF2E.traitsDescriptions[t],
          })),
          flavor: "stuff",
          skipDialog: "true",
          rollMode: "gmroll",
        };
        if (targ) {
          rollData = {
            ...rollData,
            target: {
              actor: targ.actor,
              token: targ,
            },
          };
        }
        await game.pf2e.Check.roll(checkModifier, rollData);
      },
    },
    cancel: {
      label: "Cancel",
      callback: () => {},
    },
  };
  new Dialog({
    title: `Recall Knowledge (Thaumaturge): ${sa.name}`,
    content: parseHTML(
      await renderTemplate(
        "modules/pf2e-thaum-vuln/templates/rkDialog.hbs",
        dgContent
      )
    ),
    buttons: dgButtons,
    default: "roll",
  }).render(true);
}
