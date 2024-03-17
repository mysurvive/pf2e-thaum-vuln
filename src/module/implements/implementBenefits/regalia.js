import { createEffectOnImplement } from "../helpers";

const regaliaIndicator = "Effect: Regalia Aura";
const regaliaRules = [
  {
    key: "FlatModifier",
    selector: ["deception", "diplomacy", "intimidation"],
    value: 1,
    type: "circumstance",
    label: "Regalia Implement Initiate",
    predicate: [],
    hideIfDisabled: true,
  },
  {
    key: "Aura",
    radius: 500,
    effects: [
      { affects: "allies", events: ["enter"], uuid: "Item.7lf9PJMMidflGW3F" },
    ],
    traits: ["visual"],
    label: "Regalia Follow The Expert Bonus",
    predicate: ["action:follow-the-expert"],
    slug: "regalia-follow-the-expert-bonus",
    appearance: {
      border: null,
      highlight: { alpha: 0, color: "#000000" },
    },
  },
  {
    key: "Aura",
    radius: 15,
    effects: [
      {
        affects: "allies",
        events: ["enter"],
        uuid: "Item.KHgPNbkHnU20zPHG",
      },
    ],
    traits: ["emotion", "mental", "visual"],
    slug: "regalia-aura",
  },
  {
    key: "FlatModifier",
    selector: ["deception", "diplomacy", "intimidation"],
    value: 2,
    type: "circumstance",
    label: "Regalia Implement Adept",
    predicate: ["adept:regalia"],
    hideIfDisabled: true,
  },
];

function regaliaIntensify() {}

Hooks.on("createImplementEffects", (userID, a, impDelta, imps) => {
  console.log(imps);
  if (
    game.user.id === userID &&
    imps.find((i) => i.name === "Regalia")?.uuid &&
    impDelta.find((i) => i.name === "Regalia")?.changed
  ) {
    createEffectOnImplement(imps, a, "Regalia", regaliaIndicator, regaliaRules);
  }
});

export { regaliaIntensify };
