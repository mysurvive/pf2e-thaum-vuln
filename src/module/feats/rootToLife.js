import { applyRootToLife } from "../socket";

async function rootToLife() {
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
  new foundry.applications.api.DialogV2(
    {
      window: { title: game.i18n.localize("pf2e-thaum-vuln.rootToLife.title") },
      content:
        await foundry.applications.ux.TextEditor.implementation.enrichHTML(
          await foundry.applications.handlebars.renderTemplate(
            "/modules/pf2e-thaum-vuln/templates/dialog.hbs",
            {
              content: `${game.i18n.localize(
                "pf2e-thaum-vuln.rootToLife.selectActionCount"
              )} @UUID[Compendium.pf2e.feats-srd.Item.oQVp2UhXVBcELma5]{Root to Life}`,
            }
          )
        ),
      buttons: [
        {
          label: game.i18n.localize("pf2e-thaum-vuln.dialog.oneAction"),
          action: "oneAction",
          default: true,
          callback: () => {
            applyRootToLife(actor, target, 1);
          },
        },
        {
          label: game.i18n.localize("pf2e-thaum-vuln.dialog.twoAction"),
          action: "twoAction",
          callback: () => {
            applyRootToLife(actor, target, 2);
          },
        },
      ],
      default: "oneAction",
    },
    actor,
    target
  ).render(true);
}

export { rootToLife };
