import { getImplement } from "../helpers";
import { Implement } from "../implement";

class Shield extends Implement {
  static slug = "shield";

  constructor(actor, implementItem) {
    const shieldRules = [];

    super(actor, implementItem, shieldRules, "shield");
  }
}

Hooks.on(
  "createImplementEffects",
  Shield.createImplementEffectsHook.bind(Shield)
);

Hooks.on("deleteImplementEffects", (a) => {
  const shield = getImplement(a, "shield");
  if (shield?.item) {
    shield.deleteEffectsOnItem();
  }
});

export { Shield };
