import { createEffectsOnActors } from "../../socket";
import {
  CHALICE_ADEPT_EFFECT_UUID,
  CHALICE_DRAINED_EFFECT_UUID,
  CHALICE_SIP_EFFECT_UUID,
  INTENSIFY_VULNERABILITY_CHALICE_EFFECT_UUID,
} from "../../utils";
import { getEffectOnActor } from "../../utils/helpers";
import { Implement } from "../implement";

class Chalice extends Implement {
  static intensifyEffectUuid = INTENSIFY_VULNERABILITY_CHALICE_EFFECT_UUID;

  constructor(actor, implementItem) {
    const chaliceRules = [];
    super(actor, implementItem, chaliceRules, "chalice");
  }

  get chaliceValues() {
    const baseSip =
      this.adept && this.targetValidAdeptBonus
        ? 2 + this.actor.system.abilities.cha.mod + this.actor.level
        : 2 + Math.floor(this.actor.level / 2);
    const baseDrain =
      this.adept && this.targetValidAdeptBonus
        ? 5 * this.actor.level
        : 3 * this.actor.level;

    const intensifySip = this.intensified
      ? Math.floor(this.actor.level / 2)
      : 0;
    const intensifyDrain = this.intensified ? this.actor.level : 0;

    return {
      sip: baseSip + intensifySip,
      drain: baseDrain + intensifyDrain,
    };
  }

  get targetValidAdeptBonus() {
    return Array.from(game.user.targets)[0].actor.itemTypes.effect.some(
      (i) => i.sourceId === CHALICE_ADEPT_EFFECT_UUID
    );
  }

  drink() {
    const drainedEffect = getEffectOnActor(
      this.actor,
      CHALICE_DRAINED_EFFECT_UUID
    );

    let dgButtons = {
      sip: {
        label: "Sip",
        callback: () => this.sip(),
      },
    };

    let dgContent =
      "Choose to Sip from the Chalice or Drain the Chalice. Target an adjacent ally to administer the liquid to them, or target no tokens to drink the liquid yourself.";

    if (!drainedEffect || drainedEffect?.remainingDuration.expired === true) {
      dgButtons = {
        ...dgButtons,
        drain: {
          label: "Drain",
          callback: () => this.drain(),
        },
      };
    } else {
      dgContent =
        dgContent +
        "<br><br>" +
        "Chalice refill cooldown: " +
        drainedEffect.system.remaining;
    }

    new Dialog({
      title: "Drink from the Chalice",
      content: dgContent,
      buttons: dgButtons,
    }).render(true);
  }

  async sip() {
    // If the drained chalice effect exists, reset the timer to 10 minutes.
    const drainedEffect = getEffectOnActor(
      this.actor,
      CHALICE_DRAINED_EFFECT_UUID
    );
    if (drainedEffect) {
      await drainedEffect.update({
        _id: drainedEffect._id,
        "remainingDuration.remaining": 600,
      });
    }

    createEffectsOnActors(
      this.actor.id,
      Array.from(game.user.targets),
      [CHALICE_SIP_EFFECT_UUID],
      { max: 1, applyOnNoTargets: "self" }
    );
  }

  async drain() {}
}

Hooks.once("init", () => {
  //Check chat for Adept benefit increased healing
  Hooks.on("preCreateChatMessage", async (message) => {
    if (!game.ready || !game.user.isGM || !game.combats.active) return;

    const damageTypes = [];
    message.rolls?.forEach((r) => {
      r.options?.damage?.damage.base.forEach((d) =>
        damageTypes.push(d.damageType)
      );
    });
    if (
      ((!damageTypes.includes("slashing") ||
        !damageTypes.includes("piercing")) &&
        message.flags.pf2e.context?.outcome !== "criticalSuccess") ||
      (!message.rolls[0]?.evaluatePersistent &&
        message.rolls[0]?.instances?.some((i) => i.type === "bleed"))
    )
      return;

    const thaumTokens = game.canvas.tokens.placeables.filter(
      (t) => t.actor.attributes?.implements?.chalice?.adept
    );

    for (const thaum of thaumTokens) {
      const targetTokens = Object.fromEntries(
        message.flags["pf2e-thaum-vuln"].targets.map((t) => {
          const token = game.canvas.tokens.get(t.id);
          return [
            thaum.id,
            {
              token: token.actor?.alliance === "party" ? token : undefined,
              thaum: thaum,
              distance: thaum.distanceTo(token),
            },
          ];
        })
      );

      if (
        targetTokens[thaum.id].token &&
        targetTokens[thaum.id].distance <= 30
      ) {
        createEffectsOnActors(
          thaum.actor.id,
          [targetTokens[thaum.id].token],
          [CHALICE_ADEPT_EFFECT_UUID],
          { max: 1 }
        );
      }
    }
  });

  //Check chat for intensify vulnerability increased healing
  Hooks.on("pf2e.damageRoll", (damageRoll) => {
    if (!game.ready) return;
  });
});

export { Chalice };
