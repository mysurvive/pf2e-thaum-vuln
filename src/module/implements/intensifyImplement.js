export async function intensifyImplement() {
  const imps =
    game.user.character?.getFlag("pf2e-thaum-vuln", "selectedImplements") ??
    _token.actor?.getFlag("pf2e-thaum-vuln", "selectedImplements");

  const dialogButtons = {};

  for (const key of Object.keys(imps)) {
    dialogButtons = {
      ...dialogButtons,
      [key]: {
        label: imps[key].name,
        callback: () => {
          imps[key].implementClass.intensifyImplement();
        },
      },
    };
  }

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
