import { INTENSIFY_VULNERABILITY_LANTERN_EFFECT_UUID } from "../../utils";
import { Implement } from "../implement";
import { getImplement } from "../helpers";

class Lantern extends Implement {
  constructor(actor, implementItem) {
    const lanternRules = [
      {
        key: "TokenLight",
        label: "Lantern Implement Light",
        predicate: ["lantern-implement-lit", { nor: ["adept:lantern"] }],
        value: {
          alpha: 0.45,
          animation: {
            intensity: 1,
            speed: 2,
            type: "flame",
          },
          attenuation: 0.4,
          bright: 20,
          color: "#ffae3d",
          dim: 40,
          shadows: 0.2,
        },
      },
      {
        key: "Aura",
        label: "Bright Light Indicator",
        radius: 20,
        predicate: ["lantern-implement-lit", { nor: ["adept:lantern"] }],
      },
      {
        key: "TokenLight",
        label: "Lantern Implement Light",
        predicate: [
          "lantern-implement-lit",
          "adept:lantern",
          { nor: ["paragon:lantern"] },
        ],
        value: {
          alpha: 0.45,
          animation: {
            intensity: 1,
            speed: 2,
            type: "flame",
          },
          attenuation: 0.4,
          bright: 30,
          color: "#ffae3d",
          dim: 60,
          shadows: 0.2,
        },
      },
      {
        key: "Aura",
        label: "Bright Light Indicator",
        radius: 30,
        predicate: [
          "lantern-implement-lit",
          "adept:lantern",
          { nor: ["paragon:lantern"] },
        ],
      },
      {
        key: "TokenLight",
        label: "Lantern Implement Light",
        predicate: ["lantern-implement-lit", "paragon:lantern"],
        value: {
          alpha: 0.45,
          animation: {
            intensity: 1,
            speed: 2,
            type: "flame",
          },
          attenuation: 0.4,
          bright: 40,
          color: "#ffae3d",
          dim: 80,
          shadows: 0.2,
        },
      },
      {
        key: "Aura",
        label: "Bright Light Indicator",
        radius: 40,
        predicate: ["lantern-implement-lit", "paragon:lantern"],
      },
      {
        domain: "all",
        key: "RollOption",
        label: "Lantern Implement Lit",
        option: "lantern-implement-lit",
        toggleable: true,
      },
      {
        domain: "all",
        key: "RollOption",
        label: "Target Within Lantern Bright Light",
        option: "target-in-lantern-bright-light",
        toggleable: true,
        predicate: ["lantern-implement-lit"],
        hideIfDisabled: true,
      },
      {
        key: "FlatModifier",
        selector: "perception",
        label: "Lantern Bright Light Perception",
        type: "status",
        value: 1,
        predicate: [
          "lantern-implement-lit",
          "target-in-lantern-bright-light",
          { not: "check:type:initiative" },
        ],
        slug: "lantern-per",
        hideIfDisabled: true,
      },
      {
        key: "FlatModifier",
        selector: "all",
        label: "Lantern Bright Light Recall Knowledge",
        type: "status",
        value: 1,
        predicate: [
          "lantern-implement-lit",
          "target-in-lantern-bright-light",
          "action:recall-knowledge",
          { nor: ["adept:lantern"] },
        ],
        slug: "lantern-rk",
        hideIfDisabled: true,
      },
      {
        key: "FlatModifier",
        selector: "perception",
        label: "Lantern Bright Light Perception (Intensify)",
        type: "status",
        value: 2,
        predicate: [
          "lantern-implement-lit",
          "target-in-lantern-bright-light",
          "self:effect:lantern-intensify-vulnerability",
          { not: "check:type:initiative" },
        ],
        slug: "lantern-per-intensify",
        hideIfDisabled: true,
      },
      {
        key: "FlatModifier",
        selector: "all",
        label: "Lantern Bright Light Recall Knowledge (Intensify)",
        type: "status",
        value: 2,
        predicate: [
          "lantern-implement-lit",
          "target-in-lantern-bright-light",
          "self:effect:lantern-intensify-vulnerability",
          "action:recall-knowledge",
        ],
        slug: "lantern-rk-intensify",
        hideIfDisabled: true,
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
    const lanternIntensifyEffect = (
      await fromUuid(INTENSIFY_VULNERABILITY_LANTERN_EFFECT_UUID)
    ).toObject();

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
    const _lantern = a.attributes.implements["lantern"];
    _lantern.createEffectsOnItem(imps["lantern".uuid]);
  }
});

Hooks.on("deleteImplementEffects", (a) => {
  if (getImplement(a, "lantern")?.uuid) {
    const _lantern = a.attributes.implements["lantern"];
    _lantern.deleteEffectsOnItem();
  }
});

export { Lantern };
