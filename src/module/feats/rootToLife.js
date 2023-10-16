import { parseHTML } from "../utils/utils";
import { applyRootToLife } from "../socket";

function rootToLife() {
  const actor = game.user.character ?? canvas.tokens.controlled[0]?.actor;
  if (!actor) {
    return ui.notifications.error("No token selected.");
  }
  const targets = Array.from(game.user.targets);
  if (!actor.items.some((i) => i.slug === "root-to-life")) {
    return ui.notifications.warn("Selected actor does not have Root to Life");
  }
  if (targets.length != 1) {
    return ui.notifications.warn("Select only one target for Root to Life");
  }
  const target = targets[0];
  if (!target.actor.items.some((i) => i.slug === "dying")) {
    return ui.notifications.warn("Target is not dying");
  }
  new Dialog(
    {
      title: "Root To Life",
      content: parseHTML(
        `Select whether to use one or two action variant of @UUID[Compendium.pf2e.feats-srd.Item.oQVp2UhXVBcELma5]{Root to Life}`
      ),
      buttons: {
        oneAction: {
          label: "One Action",
          callback: () => {
            applyRootToLife(actor, target, 1);
          },
        },
        twoAction: {
          label: "Two Action",
          callback: () => {
            applyRootToLife(actor, target, 2);
          },
        },
      },
      default: "oneAction",
      render: () => {},
      close: () => {},
    },
    actor,
    target
  ).render(true);
}

export { rootToLife };
