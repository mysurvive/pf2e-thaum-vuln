import {
  MORTAL_WEAKNESS_EFFECT_SOURCEID,
  PERSONAL_ANTITHESIS_EFFECT_SOURCEID,
  BREACHED_DEFENSES_EFFECT_SOURCEID,
} from "./utils/index.js";

import { updateEVEffect } from "./socket.js";

import { getActorEVEffect } from "./utils/helpers.js";

import { removeEWOption } from "./feats/esotericWarden.js";

import { createChatCardButton } from "./utils/chatCard.js";

//This is a temporary fix until a later pf2e system update. The function hooks on renderChatMessage attack-rolls
//If the thaumaturge makes an attack-roll, the target's weakness updates with the correct amount
//If it's not the thaumaturge that makes the attack-roll, it changes the weakness to 0
Hooks.on(
  "renderChatMessage",
  async (message, html) => {
    if (canvas.initialized) {
      const speaker = await fromUuid(`Actor.${message.speaker.actor}`);
      if (
        (message.flags?.pf2e?.context?.type === "attack-roll" ||
          message.flags?.pf2e?.context?.type === "spell-attack-roll" ||
          message.flags?.pf2e?.context?.type === "saving-throw" ||
          message.isDamageRoll) &&
        speaker.isOwner
      ) {
        if (speaker?.type === "character") {
          const targs = message.getFlag("pf2e-thaum-vuln", "targets");
          let weapon;
          message.flags.pf2e.origin?.uuid
            ? (weapon = await fromUuid(message.flags.pf2e.origin.uuid))
            : (weapon = undefined);
          let damageType = weapon?.system.damage?.damageType ?? undefined;
          if (damageType === "untyped" || damageType === undefined) {
            damageType = "physical";
          }
          for (let targ of targs) {
            targ = await fromUuid(targ.actorUuid);
            const effectOrigin = speaker.getFlag(
              "pf2e-thaum-vuln",
              "effectSource"
            )
              ? await fromUuid(
                  speaker.getFlag("pf2e-thaum-vuln", "effectSource")
                )
              : await fromUuid(
                  targ.actor.items
                    .find((i) => i.getFlag("pf2e-thaum-vuln", "EffectOrigin"))
                    .getFlag("pf2e-thaum-vuln", "EffectOrigin")
                );
            const targEffect = getActorEVEffect(
              targ.actor ?? targ,
              effectOrigin?.uuid ?? speaker.uuid
            ).map((i) => (i = i.uuid));
            const effValue = speaker.getFlag("pf2e-thaum-vuln", "EVValue") ?? 0;
            await updateEVEffect(targ.uuid, targEffect, effValue, damageType);
          }
        }
        handleEsotericWarden(message);
      }
    }

    createChatCardButton(message, html);
  },
  { once: false }
);

async function handleEsotericWarden(message) {
  const speakerToken = await fromUuid(
    `Scene.${message.speaker.scene}.Token.${message.speaker.token}`
  );

  for (let target of message.getFlag("pf2e-thaum-vuln", "targets")) {
    target = await fromUuid(target.actorUuid);
    let EWEffect = target?.items?.find(
      (item) => item.slug === "esoteric-warden-effect"
    );

    if (
      EWEffect &&
      target
        .getFlag("pf2e-thaum-vuln", "EVTargetID")
        .includes(speakerToken.uuid) &&
      (message.flags?.pf2e?.context?.type === "attack-roll" ||
        message.flags?.pf2e?.context?.type === "spell-attack-roll")
    ) {
      removeEWOption(EWEffect, target, "ac");
    }
  }
  if (
    message.flags?.pf2e?.context?.type === "saving-throw" &&
    message
      .getFlag("pf2e", "modifiers")
      .some((i) => i.slug === "esoteric-warden-save")
  ) {
    let EWEffect = speakerToken?.actor?.items?.find(
      (item) => item.slug === "esoteric-warden-effect"
    );
    if (EWEffect) {
      removeEWOption(EWEffect, speakerToken.actor, "save");
    }
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
    (item.sourceId === MORTAL_WEAKNESS_EFFECT_SOURCEID ||
      item.sourceId === PERSONAL_ANTITHESIS_EFFECT_SOURCEID ||
      item.sourceId === BREACHED_DEFENSES_EFFECT_SOURCEID) &&
    item.parent === game.user.character
  ) {
    await sa.setFlag("pf2e-thaum-vuln", "activeEV", false);
    await sa.unsetFlag("pf2e-thaum-vuln", "EVTargetID");
    await sa.unsetFlag("pf2e-thaum-vuln", "EVMode");
    await sa.unsetFlag("pf2e-thaum-vuln", "EVValue");
  }
});
