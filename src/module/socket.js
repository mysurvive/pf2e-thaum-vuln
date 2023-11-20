import {
  AMULETS_ABEYANCE_EFFECT_UUID,
  AMULETS_ABEYANCE_LINGERING_EFFECT_UUID,
  MORTAL_WEAKNESS_TARGET_SOURCEID,
  PERSONAL_ANTITHESIS_TARGET_SOURCEID,
  PRIMARY_TARGET_EFFECT_UUID,
} from "./utils/index.js";
import { parseHTML } from "./utils/utils.js";

let socket;

Hooks.once("socketlib.ready", () => {
  socket = socketlib.registerModule("pf2e-thaum-vuln");
  socket.register("createEffectOnTarget", _socketCreateEffectOnTarget);
  socket.register("deleteEVEffect", _socketDeleteEVEffect);
  socket.register("applySWEffect", _socketApplySWEffect);
  socket.register("sharedWarding", _socketSharedWarding);
  socket.register("ubiquitousWeakness", _socketUbiquitousWeakness);
  socket.register("createRKDialog", _createRKDialog);
  socket.register("applyAbeyanceEffects", _socketApplyAbeyanceEffects);
  socket.register("applyRootToLife", _socketApplyRootToLife);
  socket.register("updateTargetWeaknessType", _socketUpdateTargetWeaknessType);
});

export function updateTargetWeaknessType(evEffect, damageType) {
  return socket.executeAsGM(
    _socketUpdateTargetWeaknessType,
    evEffect,
    damageType
  );
}

export function applyRootToLife(actor, target, actionCount) {
  return socket.executeAsGM(_socketApplyRootToLife, actor, target, actionCount);
}

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

export function deleteEVEffect(effects) {
  return socket.executeAsGM(_socketDeleteEVEffect, effects);
}

export function createRKDialog(sa, targ, skill) {
  const gmUserId = game.users.find((u) => u.isGM === true).id;
  return socket.executeAsUser(
    _createRKDialog,
    gmUserId,
    sa.uuid,
    targ?.actor?.token?.uuid,
    skill
  );
}

export function applyAbeyanceEffects(a, abeyanceData) {
  return socket.executeAsGM(_socketApplyAbeyanceEffects, a, abeyanceData);
}

async function _socketCreateEffectOnTarget(aID, effect, evTargets, iwrData) {
  const a = await fromUuid(aID);

  if (effect.flags.core.sourceId === MORTAL_WEAKNESS_TARGET_SOURCEID) {
    effect.system.rules[0].value = iwrData;
    effect.system.rules[1].value = iwrData;
    a.setFlag("pf2e-thaum-vuln", "EVValue", `${effect.system.rules[0].value}`);
  } else if (
    effect.flags.core.sourceId === PERSONAL_ANTITHESIS_TARGET_SOURCEID
  ) {
    effect.system.rules[0].value = Math.floor(a.level / 2) + 2;
    effect.system.rules[1].value = Math.floor(a.level / 2) + 2;
    a.setFlag("pf2e-thaum-vuln", "EVValue", `${effect.system.rules[0].value}`);
  }

  effect.name = effect.name + ` (${a.name})`;
  for (let targ of evTargets) {
    let tg = await fromUuid(targ);
    if (tg.actor) {
      tg = tg.actor;
    }
    if (
      (effect.flags.core.sourceId === MORTAL_WEAKNESS_TARGET_SOURCEID ||
        effect.flags.core.sourceId === PERSONAL_ANTITHESIS_TARGET_SOURCEID) &&
      a.getFlag("pf2e-thaum-vuln", "primaryEVTarget") === targ
    ) {
      const primaryEVTargetEffect = (
        await fromUuid(PRIMARY_TARGET_EFFECT_UUID)
      ).toObject();
      primaryEVTargetEffect.system.slug +=
        "-" + game.pf2e.system.sluggify(a.name);
      primaryEVTargetEffect.name += ": " + a.name;
      primaryEVTargetEffect.flags["pf2e-thaum-vuln"] = { EffectOrigin: aID };

      let primaryEffect = Object.assign({}, effect);
      if (effect.flags.core.sourceId === MORTAL_WEAKNESS_TARGET_SOURCEID) {
        primaryEffect.img =
          "modules/pf2e-thaum-vuln/assets/mortal-weakness-primary.webp";
      } else {
        primaryEffect.img =
          "modules/pf2e-thaum-vuln/assets/personal-antithesis-primary.webp";
      }

      await tg.createEmbeddedDocuments("Item", [
        primaryEffect,
        primaryEVTargetEffect,
      ]);
    } else {
      await tg.createEmbeddedDocuments("Item", [effect]);
    }
  }
  return;
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

        const outcomes = {
          criticalSuccess:
            "The character recalls the knowledge accurately and gains additional information or context.",
          success:
            "The character recalls the knowledge accurately or gain a useful clue about their current situation.",
          failure: "",
          criticalFailure:
            "The character recalls incorrect information or gains an erroneous or misleading clue.",
        };

        const notes = Object.entries(outcomes).map(([outcome, text]) => ({
          title: game.i18n.localize(
            "PF2E.Check.Result.Degree.Check." + outcome
          ),
          text,
          outcome: [outcome],
        }));

        notes.push({
          title: "Dubious Knowledge",
          text: "When the character fails (but doesn't critically fail) a Recall Knowledge check using any skill, they learn a bit of true knowledge and a bit of erroneous knowledge, but they don't have any way to differentiate which is which.",
          outcome: ["failure"],
        });

        if (hasDiverseLore) {
          traits.push("thaumaturge");
          notes.push({
            title: game.i18n.localize("pf2e-thaum-vuln.diverseLore.name"),
            text: "The character's wandering studies mean they've heard rumors or theories about almost every topic... though admittedly, their sources aren't always the most reliable. They can take a –2 penalty to your check to Recall Knowledge with Esoteric Lore to Recall Knowledge about any topic, not just the usual topics available for Esoteric Lore.",
          });
        }

        const flavor = `Recall Esoteric Knowledge: ${skill.label}`;
        const checkModifier = new game.pf2e.CheckModifier(
          flavor,
          skill,
          diverseLoreModifier
        );
        let rollData = {
          actor: sa,
          type: "skill-check",
          options: [...rollOptions, "action:recall-knowledge"],
          domains: ["all", "check", "skill-check"],
          notes,
          dc: { value: parseInt(rollDC) + parseInt(rollELModifier) },
          traits: traits,
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
  ui.notifications.info("Recall Knowledge request sent to GM.");
}

async function _socketApplyAbeyanceEffects(a, abeyanceData) {
  a = await fromUuid(a);
  const amuletImplementData = a.flags[
    "pf2e-thaum-vuln"
  ].selectedImplements.find((i) => i.name === "Amulet");

  for (const character in abeyanceData) {
    const amuletsAbeyanceEffect = (
      await fromUuid(AMULETS_ABEYANCE_EFFECT_UUID)
    ).toObject();

    const charToken = await fromUuid(abeyanceData[character].uuid);
    amuletsAbeyanceEffect.name += " " + character;
    amuletsAbeyanceEffect.slug += "-" + game.pf2e.system.sluggify(character);
    amuletsAbeyanceEffect.system.rules.push({
      key: "Resistance",
      type: "all-damage",
      value: 2 + a.level,
    });
    await charToken.actor.createEmbeddedDocuments("Item", [
      amuletsAbeyanceEffect,
    ]);
    if (
      amuletImplementData.adept === true &&
      abeyanceData[character].lingeringDamageType
    ) {
      const lingeringResistanceValue = a.level < 15 ? 5 : 10;
      const lingeringResistanceType =
        abeyanceData[character].lingeringDamageType;
      const abeyanceLingeringEffect = (
        await fromUuid(AMULETS_ABEYANCE_LINGERING_EFFECT_UUID)
      ).toObject();
      abeyanceLingeringEffect.system.rules.push({
        key: "Resistance",
        type: lingeringResistanceType,
        value: lingeringResistanceValue,
      });
      abeyanceLingeringEffect.flags["pf2e-thaum-vuln"] = {
        effectSource: a.uuid,
      };
      await charToken.actor.createEmbeddedDocuments("Item", [
        abeyanceLingeringEffect,
      ]);
    }
  }
}

async function _socketApplyRootToLife(actor, target, actionCount) {
  const traits = [
    "esoterica",
    "manipulate",
    "necromancy",
    "primal",
    "thaumaturge",
  ];
  actionCount === 2 ? traits.push("auditory") : null;
  let chatMessage =
    "<strong>Root to Life:</strong> The creature is no longer dying and is instead @UUID[Compendium.pf2e.conditionitems.Item.fBnFDH2MTzgFijKf]{Unconscious} at 0 Hit Points.";
  actionCount === 2
    ? (chatMessage +=
        " You may attempt flat checks to remove each source of damage affecting the target.")
    : null;
  ChatMessage.create({ user: game.user.id, flavor: chatMessage });
  target.actor.items.find((i) => i.slug === "dying").delete();
  target.actor.createEmbeddedDocuments("Item", [
    (
      await fromUuid("Compendium.pf2e.conditionitems.Item.fBnFDH2MTzgFijKf")
    ).toObject(),
  ]);
  if (actionCount === 2) {
    updateDamageSources(target).then(revertDamageSources(target));
  }
}

async function updateDamageSources(target) {
  const persistentDamageSources = await target.actor.items.filter(
    (i) => i.system.slug === "persistent-damage"
  );

  for (const damage of persistentDamageSources) {
    damage.setFlag(
      "pf2e-thaum-vuln",
      "recoveryDC",
      damage.system.persistent.dc
    );
    await damage.update({ _id: damage._id, "system.persistent.dc": 10 });
    await damage.rollRecovery();
  }
  return Promise.resolve();
}

async function revertDamageSources(target) {
  const refreshTarget = await fromUuid(target.document.uuid);
  const newPersistentSources = await refreshTarget.actor.items.filter(
    (i) => i.system.slug === "persistent-damage"
  );
  for (const damage of newPersistentSources) {
    try {
      const value = damage.getFlag("pf2e-thaum-vuln", "recoveryDC");
      await damage.update({
        _id: damage._id,
        "system.persistent.dc": value,
      });
      damage.unsetFlag("pf2e-thaum-vuln", "recoveryDC");
    } catch (error) {
      continue;
    }
  }
}

async function _socketUpdateTargetWeaknessType(evEffect, damageType) {
  evEffect.update({
    _id: evEffect._id,
    "system.rules": [
      { ...evEffect.system.rules[0], type: damageType },
      { ...evEffect.system.rules[1] },
    ],
  });
}
