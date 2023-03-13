import {
  MORTAL_WEAKNESS_EFFECT_SOURCEID,
  PERSONAL_ANTITHESIS_EFFECT_SOURCEID,
  BREACHED_DEFENSES_EFFECT_SOURCEID,
} from "./utils";

import { updateEVEffect } from "./socket.js";

import {
  removeEWOption,
  createChatCardButton,
} from "./exploit-vulnerability.js";

//This is a temporary fix until a later pf2e system update. The function hooks on renderChatMessage attack-rolls
//If the thaumaturge makes an attack-roll, the target's weakness updates with the correct amount
//If it's not the thaumaturge that makes the attack-roll, it changes the weakness to 0
Hooks.on(
  "renderChatMessage",
  async (message, html) => {
    if (canvas.initialized) {
      const a = canvas.tokens.placeables.find(
        (act) => act.id === message.speaker.token
      )?.actor
        ? canvas.tokens.placeables.find(
            (act) => act.id === message.speaker.token
          ).actor
        : undefined;
      if (a === undefined) {
        updateEVEffect(undefined);
        return;
      }

      if (
        message.flags?.pf2e?.context?.type === "attack-roll" ||
        message.flags?.pf2e?.context?.type === "spell-attack-roll" ||
        message.flags?.pf2e?.context?.type === "saving-throw" ||
        message.isDamageRoll
      ) {
        if (a.type === "character") {
          updateEVEffect(message.speaker?.actor);
        }

        for (let target of message.getFlag("pf2e-thaum-vuln", "targets")) {
          target = await fromUuid(target.actorUuid);
          let EWEffect = target?.items?.find(
            (item) => item.name === "Esoteric Warden Effect"
          );
          if (
            EWEffect &&
            target.getFlag("pf2e-thaum-vuln", "EVTargetID").includes(a.uuid) &&
            (message.flags?.pf2e?.context?.type === "attack-roll" ||
              message.flags?.pf2e?.context?.type === "spell-attack-roll")
          ) {
            removeEWOption(EWEffect, target, "ac");
          }

          if (
            message.flags?.pf2e?.context?.type === "saving-throw" &&
            message
              .getFlag("pf2e", "modifiers")
              .some((i) => i.label === "Esoteric Warden Effect")
          ) {
            target = a.getFlag("pf2e-thaum-vuln", "EVTarget");
            EWEffect = a.items?.find(
              (item) => item.name === "Esoteric Warden Effect"
            );
            if (EWEffect) {
              removeEWOption(EWEffect, a, "save");
            }
          }
        }
      }
    }

    createChatCardButton(message, html);
  },
  { once: false }
);

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
    (item.sourceId === MORTAL_WEAKNESS_EFFECT_SOURCEID ||
      item.sourceId === PERSONAL_ANTITHESIS_EFFECT_SOURCEID ||
      item.sourceId === BREACHED_DEFENSES_EFFECT_SOURCEID) &&
    item.parent === game.user.character
  ) {
    await sa.setFlag("pf2e-thaum-vuln", "activeEV", false);
    await sa.unsetFlag("pf2e-thaum-vuln", "EVTargetID");
    await sa.unsetFlag("pf2e-thaum-vuln", "EVMode");
  }
});

//Sets the rules for Twin Weakness when the canvas is loaded (sets the rules in case the feat was added prior to installing the module)
Hooks.on(
  "canvasReady",
  async () => {
    game.users.forEach(async (user) => {
      if (user.character?.items.find((i) => i.slug === "twin-weakness")) {
        await user.character?.items
          .find((i) => i.slug === "twin-weakness")
          .update({
            system: {
              rules: [
                {
                  key: "RollOption",
                  domain: "damage",
                  option: "twin-weakness",
                  toggleable: true,
                  value: false,
                },
                {
                  key: "FlatModifier",
                  selector: "damage",
                  value: "{actor|flags.pf2e-thaum-vuln.EVValue}",
                  predicate: ["twin-weakness"],
                  slug: "twin-weakness-damage",
                },
              ],
            },
          });
      }
    });
  },
  { once: true }
);

//Sets the rules for Twin Weakness when it is created on the sheet.
Hooks.on("createItem", async (item) => {
  if (item.sourceId === "Compendium.pf2e.feats-srd.85xm82Z005CUNBMB") {
    await item.update({
      system: {
        rules: [
          {
            key: "RollOption",
            domain: "damage",
            option: "twin-weakness",
            toggleable: true,
            value: false,
          },
          {
            key: "FlatModifier",
            selector: "damage",
            value: "{actor|flags.pf2e-thaum-vuln.EVValue}",
            predicate: ["twin-weakness"],
            slug: "twin-weakness-damage",
          },
        ],
      },
    });
  }
});
