import { INTENSIFY_VULNERABILITY_SHIELD_EFFECT_UUID } from "../../utils";
import { isThaumaturge } from "../../utils/helpers";
import { getImplement } from "../helpers";
import { Implement } from "../implement";

class Shield extends Implement {
  static slug = "shield";
  static intensifyEffectUuid = INTENSIFY_VULNERABILITY_SHIELD_EFFECT_UUID;

  constructor(actor, implementItem) {
    const shieldRules = [
      {
        domain: "all",
        key: "RollOption",
        option: "shield-full-hp",
        value:
          "ternary(eq(@item.system.hp.max - @item.system.hp.value, 0), true, false)",
      },
      {
        key: "ItemAlteration",
        itemType: "shield",
        mode: "override",
        property: "ac-bonus",
        value: "@item._source.system.acBonus - 1",
        predicate: [
          "self:shield:broken",
          "item:id:{actor|flags.pf2e-thaum-vuln.selectedImplements.shield.id}",
        ],
      },
    ];

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

Hooks.once("init", () => {
  Hooks.on("updateItem", (item, change) => {
    if (
      isThaumaturge(item.parent) &&
      change.system?.hp?.value === 0 &&
      item.uuid ===
        item.parent.flags["pf2e-thaum-vuln"].selectedImplements?.shield?.uuid
    ) {
      item.update({ _id: item._id, "system.hp.value": 1 });
    }
  });
});

export { Shield };
