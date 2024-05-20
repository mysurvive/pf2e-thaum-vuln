import { hasFeat } from "../utils/helpers";

async function intensifyImplement(actor) {
  actor ??= game.user.character;
  const imps = actor.attributes.implements;

  if (!hasFeat(actor, "intensify-vulnerability"))
    return ui.notifications.warn(
      game.i18n.localize(
        "pf2e-thaum-vuln.notifications.warn.intensifyImplement.noIntensify"
      )
    );

  if (!imps)
    return ui.notifications.warn(
      game.i18n.localize(
        "pf2e-thaum-vuln.notifications.warn.exploitVulnerability.noImplements"
      )
    );

  const dialogButtons = Object.fromEntries(
    Object.values(imps).map((imp) => [
      imp.slug,
      {
        label: imp.name,
        callback: () => imp.intensifyImplement(),
      },
    ])
  );

  new Dialog({
    title: game.i18n.localize(
      "pf2e-thaum-vuln.dialog.intensifyImplement.title"
    ),
    content: await renderTemplate(
      "modules/pf2e-thaum-vuln/templates/intensifyImplement.hbs"
    ),
    buttons: dialogButtons,
  }).render(true);
}

export { intensifyImplement };
