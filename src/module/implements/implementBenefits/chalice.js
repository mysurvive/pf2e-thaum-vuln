import { createEffectsOnActors } from "../../socket";
import {
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

  get baseChaliceMods() {
    return {
      sip: this.adept
        ? 2 + this.actor.system.abilities.cha.mod + this.actor.level
        : 2 + Math.floor(this.actor.level / 2),
      drain: this.adept ? 5 * this.actor.level : 3 * this.actor.level,
    };
  }

  get intensifyMods() {
    return {
      sip: this.intensified ? Math.floor(this.actor.level / 2) : 0,
      drain: this.intensified ? this.actor.level : 0,
    };
  }

  get chaliceValues() {
    return {
      sip: this.baseChaliceMods.sip + this.intensifyMods.sip,
      drain: this.baseChaliceMods.drain + this.intensifyMods.drain,
    };
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

      /*dgContent =
        dgContent +
        "<br>" +
        "Chalice refill cooldown: " +
        drainedEffect.system.remaining;*/
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
      { max: 1 }
    );
  }

  async drain() {}
}

export { Chalice };
