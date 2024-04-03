import { constructChildImplement } from "./impDict.js";

async function intensifyImplement() {
  const actor = game.user.character ?? _token.actor;
  const imps = actor.getFlag("pf2e-thaum-vuln", "selectedImplements");

  let dialogButtons = {};

  for (const key of Object.keys(imps)) {
    dialogButtons = {
      ...dialogButtons,
      [key]: {
        label: imps[key].name,
        callback: () => {
          const targetImp = constructChildImplement(
            imps[key].name,
            actor,
            imps[key].uuid
          );
          targetImp.intensifyImplement();
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

export { intensifyImplement };
