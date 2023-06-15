import { sharedWarding } from "../socket";

function sharedWardingDialog(EWEffect) {
  const a = canvas.tokens.controlled[0];
  new Dialog({
    title: game.i18n.localize("pf2e-thaum-vuln.sharedWarding.name"),
    content: () =>
      `<p>${game.i18n.localize(
        "pf2e-thaum-vuln.sharedWarding.flavor"
      )} <br><br>${game.i18n.localize(
        "pf2e-thaum-vuln.sharedWarding.prompt"
      )} </p>`,
    buttons: {
      yes: {
        label: game.i18n.localize("pf2e-thaum-vuln.dialog.yes"),
        callback: () => {
          sharedWarding(EWEffect, a.document.uuid);
        },
      },
      no: {
        label: game.i18n.localize("pf2e-thaum-vuln.dialog.no"),
        callback: () => {
          return;
        },
      },
    },
    default: "yes",
    render: () => {},
    close: () => {},
  }).render(true);
}

export { sharedWardingDialog };
