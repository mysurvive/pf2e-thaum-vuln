import { sharedWarding } from "../socket";

function sharedWardingDialog(EWEffect) {
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
          sharedWarding(EWEffect);
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
