import { parseHTML } from "../utils/utils";
import { applyRootToLife } from "../socket";

function rootToLife() {
  const actor = game.user.character ?? canvas.tokens.controlled[0]?.actor;
  if (!actor) {
    return ui.notifications.warn(
      game.i18n.localize("pf2e-thaum-vuln.notifications.warn.noToken")
    );
  }
  const targets = Array.from(game.user.targets);
  if (!actor.items.some((i) => i.slug === "root-to-life")) {
    return ui.notifications.warn(
      game.i18n.localize(
        "pf2e-thaum-vuln.notifications.warn.rootToLife.noAbility"
      )
    );
  }
  if (targets.length != 1) {
    return ui.notifications.warn(
      game.i18n.localize(
        "pf2e-thaum-vuln.notifications.warn.rootToLife.selectOne"
      )
    );
  }
  const target = targets[0];
  if (!target.actor.items.some((i) => i.slug === "dying")) {
    return ui.notifications.warn(
      game.i18n.localize(
        "pf2e-thaum-vuln.notifications.warn.rootToLife.notDying"
      )
    );
  }
  new Dialog(
    {
      title: game.i18n.localize("pf2e-thaum-vuln.rootToLife.title"),
      content: parseHTML(
        `${game.i18n.localize(
          "pf2e-thaum-vuln.rootToLife.selectActionCount"
        )} @UUID[Compendium.pf2e.feats-srd.Item.oQVp2UhXVBcELma5]{Root to Life}`
      ),
      buttons: {
        oneAction: {
          label: game.i18n.localize("pf2e-thaum-vuln.dialog.oneAction"),
          callback: () => {
            applyRootToLife(actor, target, 1);
          },
        },
        twoAction: {
          label: game.i18n.localize("pf2e-thaum-vuln.dialog.twoAction"),
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
