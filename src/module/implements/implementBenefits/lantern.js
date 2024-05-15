import {
  INTENSIFY_VULNERABILITY_LANTERN_EFFECT_UUID,
  IN_LANTERN_LIGHT_ALLY_EFFECT_UUID,
  IN_LANTERN_LIGHT_ENEMY_EFFECT_UUID,
} from "../../utils";
import { Implement } from "../implement";
import { getImplement } from "../helpers";
import { createEffectData } from "../../utils/helpers";

class Lantern extends Implement {
  constructor(actor, implementItem) {
    const lanternRules = [
      {
        key: "ActiveEffectLike",
        mode: "upgrade",
        path: "flags.pf2e-thaum-vuln.lantern.radius",
        value: "@actor.attributes.implements.lantern.rank*10+10",
        phase: "afterDerived",
      },
      {
        key: "TokenLight",
        label: "Lantern Implement Light",
        predicate: ["lantern-implement-lit"],
        value: {
          alpha: 0.45,
          animation: {
            intensity: 1,
            speed: 2,
            type: "flame",
          },
          attenuation: 0.4,
          bright: "@actor.flags.pf2e-thaum-vuln.lantern.radius",
          color: "#ffae3d",
          dim: "@actor.flags.pf2e-thaum-vuln.lantern.radius*2",
          shadows: 0.2,
        },
      },
      {
        key: "Aura",
        label: "Bright Light Indicator",
        radius: "@actor.flags.pf2e-thaum-vuln.lantern.radius",
        predicate: ["lantern-implement-lit"],
        effects: [
          {
            uuid: IN_LANTERN_LIGHT_ALLY_EFFECT_UUID,
            affects: "allies",
            includesSelf: false,
          },
          {
            uuid: IN_LANTERN_LIGHT_ENEMY_EFFECT_UUID,
            affects: "enemies",
          },
        ],
      },
      {
        domain: "all",
        key: "RollOption",
        label: "Lantern Implement Lit",
        option: "lantern-implement-lit",
        toggleable: true,
      },
      {
        key: "FlatModifier",
        selector: "perception",
        label: "In Lantern Light",
        type: "status",
        value: 1,
        predicate: [
          "lantern-implement-lit",
          "target:effect:in-lantern-light-enemy",
          { not: "check:type:initiative" },
        ],
        slug: "lantern-perception",
      },
      {
        key: "FlatModifier",
        selector: "skill-check",
        label: "In Lantern Light",
        value: 1,
        predicate: [
          "lantern-implement-lit",
          "target:effect:in-lantern-light-enemy",
          "action:recall-knowledge",
          { not: "check:statistic:perception" },
        ],
        hideIfDisabled: true,
        slug: "lantern-rk",
      },
    ];
    super(actor, implementItem, lanternRules, "lantern");
  }

  async intensifyImplement() {
    const a = game.user?.character ?? canvas.tokens.controlled[0].actor;
    if (
      !a.itemTypes.feat.some((i) => i.slug === "intensify-vulnerability") ||
      !getImplement(a, "lantern")
    )
      return ui.notifications.warn(
        game.i18n.localize(
          "pf2e-thaum-vuln.notifications.warn.intensifyImplement.noIntensify"
        )
      );
    const lanternIntensifyEffect = await createEffectData(
      INTENSIFY_VULNERABILITY_LANTERN_EFFECT_UUID,
      { actor: this.actor.uuid }
    );

    await this.actor.createEmbeddedDocuments("Item", [lanternIntensifyEffect]);
  }
}

Hooks.on("createImplementEffects", (userID, a, impDelta, imps) => {
  if (
    game.user.id === userID &&
    imps["lantern"]?.uuid &&
    impDelta.find(
      (i) =>
        i.name ===
        game.i18n.localize("PF2E.SpecificRule.Thaumaturge.Implement.Lantern")
    )?.changed
  ) {
    const lantern = getImplement(a, "lantern");
    lantern.createEffectsOnItem(imps["lantern"].uuid);
  }
});

Hooks.on("deleteImplementEffects", (a) => {
  const lantern = getImplement(a, "lantern");
  if (lantern?.item) {
    lantern.deleteEffectsOnItem();
  }
});

export { Lantern };
