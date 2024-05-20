import { getEffectOnActor } from "../../utils/helpers";
import { Implement } from "../implement";

class Chalice extends Implement {
  constructor(actor, implementItem) {
    const chaliceRules = [];
    super(actor, implementItem, chaliceRules, "chalice");
  }

  get intensifySipMod() {
    return this.intensified ? this.actor.level / 2 : 0;
  }

  drink() {
    const drainedEffect = getEffectOnActor(this.actor, cooldownSourceID);

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

      dgContent =
        dgContent +
        "<br>" +
        "Chalice refill cooldown: " +
        drainedEffect.system.remaining;
    }

    new Dialog({
      title: "Drink from the Chalice",
      content: dgContent,
      buttons: dgButtons,
    }).render(true);
  }

  static async sip() {
    // If the drained chalice effect exists, reset the timer to 10 minutes.
    const drainedEffect = getEffectOnActor(this.actor, cooldownSourceID);
    if (drainedEffect) {
      await drainedEffect.update({
        _id: drainedEffect._id,
        "remainingDuration.remaining": 600,
      });
    }
  }

  static async drain() {}
}

export { Chalice };
