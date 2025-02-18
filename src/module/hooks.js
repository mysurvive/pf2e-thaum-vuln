import {
  MORTAL_WEAKNESS_EFFECT_UUID,
  PERSONAL_ANTITHESIS_EFFECT_UUID,
  BREACHED_DEFENSES_EFFECT_UUID,
  ESOTERIC_WARDEN_EFFECT_UUID,
  PRIMARY_TARGET_EFFECT_UUID,
  GLIMPSE_WEAKNESS_EFFECT_UUID,
} from "./utils/index.js";
import {
  hasFeat,
  isThaumaturge,
  targetEVPrimaryTarget,
  getEffectOnActor,
  hasExploitVulnerabilityEffect,
  getExploitVulnerabilityEffect,
} from "./utils/helpers.js";
import { removeEWOption } from "./feats/esotericWarden.js";
import { createChatCardButton } from "./utils/chatCard.js";
import { manageImplements, clearImplements } from "./implements/implements.js";

//This is a temporary fix until a later pf2e system update. The function hooks on renderChatMessage attack-rolls
//If the thaumaturge makes an attack-roll, the target's weakness updates with the correct amount
//If it's not the thaumaturge that makes the attack-roll, it changes the weakness to 0
Hooks.on(
  "renderChatMessage",
  async (message, html) => {
    createChatCardButton(message, html);
  },
  { once: false }
);

Hooks.once("ready", () => {
  Hooks.on("createChatMessage", (message) => {
    updateWeaknessType(message); // Run by thaum's targets
    handleEsotericWardenAttack(message); // Run by thaum when it's a target
  });
  Hooks.on("preCreateChatMessage", handleEsotericWardenSave); // Run by thaum when rolling a save
});

// We want the owner of the *target* of this message, if it's an attack, to run this and
// update the target's EV effect for the damage type.
async function updateWeaknessType(message) {
  if (
    message.flags.pf2e?.context?.action !== "strike" ||
    message.flags.pf2e?.origin?.type !== "weapon" ||
    !hasExploitVulnerabilityEffect(message.actor)
  )
    return;

  const strikeTarget = message.target?.actor;
  if (!strikeTarget || strikeTarget.primaryUpdater !== game.user) return;

  const evOrigin = game.actors.get(
    getExploitVulnerabilityEffect(message.actor).flags[
      "pf2e-thaum-vuln"
    ].EffectOrigin.split(".")[1]
  );
  const actorSlug = game.pf2e.system.sluggify(evOrigin.name);
  const evEffect = strikeTarget.itemTypes.effect.find(
    (e) =>
      e.slug === `personal-antithesis-target-${actorSlug}` ||
      e.slug === `mortal-weakness-target-${actorSlug}`
  );
  if (!evEffect) return;
  const strike = message._strike?.item.system;
  let damageType = "physical";
  if (strike.damage) {
    // Special handling for versatile vials because their base damage is always acid
    if (strike.slug === "versatile-vial") {
      damageType = strike.traits.value.find((t) =>
        ["acid", "cold", "fire", "electricity"].includes(t)
      );
    } else if (strike.traits.toggles.versatile.selected) {
      damageType = strike.traits.toggles.versatile.selected;
    } else if (strike.traits.toggles.modular.selected) {
      damageType = strike.traits.toggles.modular.selected;
    } else {
      damageType = strike.damage.damageType;
    }
  } else if (message.item.system.damageRolls.length != 0) {
    damageType =
      message.item.system.damageRolls[
        Object.keys(message.item.system.damageRolls)[0]
      ].damageType;
  }

  if (
    evEffect.system.rules.length === 0 ||
    damageType === evEffect.system.rules[0].type
  )
    return;

  evEffect.update({
    _id: evEffect._id,
    "system.rules": [{ ...evEffect.system.rules[0], type: damageType }],
  });
}

// The owner of the thaumaturge should, if the message is an attack on the thaum, end
// the AC part of an EW effect.
function handleEsotericWardenAttack(message) {
  // Check if message is attack and attacker is a primary EV target of at least one thaum
  if (
    !["attack-roll", "spell-attack-roll"].includes(
      message.flags?.pf2e?.context?.type
    ) ||
    !message.actor ||
    !getEffectOnActor(message.actor, PRIMARY_TARGET_EFFECT_UUID)
  )
    return;

  // We look for primary EV target effects on the attacker first, rather than the
  // targets of the attack, because there are far fewer of the former.
  const targetUuids = message
    .getFlag("pf2e-thaum-vuln", "targets")
    ?.map((t) => t.actorUuid);
  for (const thaum of message.actor.itemTypes.effect
    .filter((e) => e.sourceId === PRIMARY_TARGET_EFFECT_UUID)
    .map((e) => e.origin)) {
    if (
      thaum.primaryUpdater === game.user &&
      targetUuids.includes(thaum.uuid)
    ) {
      const EWEffect = getEffectOnActor(thaum, ESOTERIC_WARDEN_EFFECT_UUID);
      if (EWEffect) removeEWOption(EWEffect, thaum, "ac");
    }
  }
}

// Only called by the creater of the message, i.e. the roller of the save.
// If it's a save by a thaum, check if their save EW effect should be used up.
function handleEsotericWardenSave(message) {
  if (message.flags?.pf2e?.context?.type !== "saving-throw") return;

  const modifier = message
    .getFlag("pf2e", "modifiers")
    ?.find((m) => m.slug === "esoteric-warden-save");
  if (modifier?.enabled) {
    const EWEffect = getEffectOnActor(
      message.actor,
      ESOTERIC_WARDEN_EFFECT_UUID
    );
    if (EWEffect) removeEWOption(EWEffect, message.actor, "save");
  }
}

//adds a target flag to the chat message. Borrowed from pf2e-target-damage https://github.com/MrVauxs/PF2e-Target-Damage
Hooks.on("preCreateChatMessage", (message) => {
  if (message.rolls[0]?.options.evaluatePersistent) {
    message.updateSource({
      "flags.pf2e-thaum-vuln.targets": [message.token.object].map((target) => {
        return {
          id: target.id,
          tokenUuid: target.document.uuid,
          actorUuid: target.actor.uuid,
        };
      }),
    });
  } else {
    message.updateSource({
      "flags.pf2e-thaum-vuln.targets": Array.from(game.user.targets).map(
        (target) => {
          return {
            id: target.id,
            tokenUuid: target.document.uuid,
            actorUuid: target.actor.uuid,
          };
        }
      ),
    });
  }
});

//resets the Esoteric Warden immune targets when resting for the night
Hooks.on("pf2e.restForTheNight", (actor) => {
  actor.unsetFlag("pf2e-thaum-vuln", "EWImmuneTargs");
});

//sets pertinent flags when one of the Exploit Vulnerability effects are deleted
Hooks.on("deleteItem", async (item) => {
  const sa = item.parent;
  if (
    (item.sourceId === MORTAL_WEAKNESS_EFFECT_UUID ||
      item.sourceId === PERSONAL_ANTITHESIS_EFFECT_UUID ||
      item.sourceId === BREACHED_DEFENSES_EFFECT_UUID ||
      item.sourceId === GLIMPSE_WEAKNESS_EFFECT_UUID) &&
    game.user === sa.primaryUpdater
  ) {
    await sa.setFlag("pf2e-thaum-vuln", "activeEV", false);
    await sa.unsetFlag("pf2e-thaum-vuln", "EVTargetID");
    await sa.unsetFlag("pf2e-thaum-vuln", "EVMode");
    await sa.unsetFlag("pf2e-thaum-vuln", "EVValue");
    await sa.unsetFlag("pf2e-thaum-vuln", "primaryEVTarget");
    await sa.unsetFlag("pf2e-thaum-vuln", "effectSource");
  }
});

async function unsetFlags(item) {}

Hooks.on("renderCharacterSheetPF2e", (_sheet, html, character) => {
  const a = _sheet.actor;
  if (
    character.owner &&
    (isThaumaturge(a) || hasFeat(a, "thaumaturge-dedication"))
  ) {
    //implement management buttons
    if (!a.getFlag("pf2e-thaum-vuln", "selectedImplements"))
      a.setFlag("pf2e-thaum-vuln", "selectedImplements", {});
    if (
      hasFeat(a, "first-implement-and-esoterica") ||
      hasFeat(a, "thaumaturge-dedication")
    ) {
      const inventoryList = html.find(
        ".sheet-body .inventory-list.directory-list.inventory-pane"
      );
      const implementButtonRegion = $(
        `<div class="implement-button-region actor.sheet" style="display:flex; margin-bottom:1em;"></div>`
      );
      const manageImplementButton = $(
        `<button type="button" class="manage-implements-button">${game.i18n.localize(
          "pf2e-thaum-vuln.manageImplements.manageImplementsButton"
        )}</button>`
      );
      const clearImplementButton = $(
        `<button type="button" class="clear-implements-button">${game.i18n.localize(
          "pf2e-thaum-vuln.manageImplements.clearImplementsButton"
        )}</button>`
      );
      inventoryList.append(
        `<header>
    <h3 class="item-name">${game.i18n.localize(
      "pf2e-thaum-vuln.manageImplements.implementHeader"
    )}</h3></header>
    
    `
      );

      showImplementsOnSheet(inventoryList, a);

      implementButtonRegion.append(manageImplementButton);
      implementButtonRegion.append(clearImplementButton);
      inventoryList.append(implementButtonRegion);
      $(manageImplementButton).click({ actor: a }, function (event) {
        manageImplements(event);
      });
      $(clearImplementButton).click({ actor: a }, function (event) {
        clearImplements(event);
      });
    }

    //EV Target Management

    const strikesList = html.find(".sheet-body .option-toggles");
    const EVTargetSection = $(
      `<fieldset class="actor.sheet" style="display:flex;flex-direction:column;border:1px solid;border-radius:5px;padding:5px;"><legend>${game.i18n.localize(
        "pf2e-thaum-vuln.exploitVulnerability.name"
      )}</legend></fieldset>`
    );
    const EVActive = $(
      `<label for="EVActive">${game.i18n.localize(
        "pf2e-thaum-vuln.targetManagement.evActive"
      )} </label>`
    );
    const EVActiveLabel = $(`<span style="flex-direction:row;"></span>`);
    const EVModeLabel = $(
      `<label for="EVMode">${game.i18n.localize(
        "pf2e-thaum-vuln.targetManagement.evMode"
      )} </label>`
    );
    const EVTargetBtn = $(
      `<button type="button" class="target-primary-btn">${game.i18n.localize(
        "pf2e-thaum-vuln.targetManagement.evPrimaryTargetButton"
      )}</button>`
    );
    if (a.getFlag("pf2e-thaum-vuln", "activeEV") === true) {
      const EVMode = a.getFlag("pf2e-thaum-vuln", "EVMode");
      let words;
      if (EVMode) {
        words = EVMode.split("-");
        for (let i = 0; i < words.length; i++) {
          words[i] = words[i][0].toUpperCase() + words[i].substr(1);
        }
        EVModeLabel.append(words.join(" "));
      }

      $(EVTargetBtn).click({ actor: a }, function () {
        targetEVPrimaryTarget(a);
      });
      EVActiveLabel.append(
        EVActive,
        $(
          `<span name="EVActive" style="color:#00c000;">${game.i18n.localize(
            "pf2e-thaum-vuln.targetManagement.active"
          )}</span>`
        )
      );
      EVTargetSection.append(EVActiveLabel);
      EVTargetSection.append(EVModeLabel);
      if (
        canvas.scene.tokens.filter(
          (token) =>
            token.actor?.uuid ===
            a.getFlag("pf2e-thaum-vuln", "primaryEVTarget")
        ).length != 0
      ) {
        EVTargetSection.append(EVTargetBtn);
      } else {
        EVTargetSection.append(
          $(
            `<span style="text-align:center;color:#ff4040;">${game.i18n.localize(
              "pf2e-thaum-vuln.targetManagement.notOnScene"
            )}</span>`
          )
        );
      }
    } else {
      EVActiveLabel.append(
        EVActive,
        $(
          `<span name="EVActive" style="color:#ff4040;">${game.i18n.localize(
            "pf2e-thaum-vuln.targetManagement.inactive"
          )}</span>`
        )
      );
      EVTargetSection.append(EVActiveLabel);
    }

    EVTargetSection.insertAfter(strikesList);
  }
});

function showImplementsOnSheet(inventoryList, a) {
  const imps = a.getFlag("pf2e-thaum-vuln", "selectedImplements");
  if (imps) {
    for (const key of Object.keys(imps)) {
      const id = `[data-item-id="${imps[key]?.uuid?.split(".")[3]}"]`;
      const inventoryItem = $(inventoryList).find($("li")).filter($(id));

      $(inventoryItem)
        .find("div.item-name")
        .append(
          $(
            `<img class="item-image item-icon" title="${key} implement" style="border-width: 0px; margin-left: 10px;" src="modules/pf2e-thaum-vuln/assets/chosen-implement.webp" />`
          )
        );
    }
  }
}

Hooks.on("canvasReady", () => {
  const classNameArray = game.user.character?.class?.name.split(" ") ?? [];
  if (
    classNameArray.includes("Thaumaturge") &&
    game.user.character?.sheet._state == 2
  ) {
    game.user.character.sheet._render(true);
  }
});
