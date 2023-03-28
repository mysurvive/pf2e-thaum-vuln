import { ubiquitousWeakness } from "../socket";

async function createUWDialog(eff) {
  new Dialog({
    title: game.i18n.localize("pf2e-thaum-vuln.ubiquitousWeakness.name"),
    content: () =>
      `<p>${game.i18n.localize(
        "pf2e-thaum-vuln.ubiquitousWeakness.flavor"
      )} <br><br>${game.i18n.localize(
        "pf2e-thaum-vuln.ubiquitousWeakness.prompt"
      )} </p>`,
    buttons: {
      yes: {
        label: game.i18n.localize("pf2e-thaum-vuln.dialog.yes"),
        callback: () => {
          uWChoices(eff);
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

function uWChoices(eff) {
  const a = canvas.tokens.controlled[0];
  const allies = canvas.tokens.placeables.filter(
    (token) => token.actor?.alliance === "party" && a.distanceTo(token) <= 30
  );

  const dgContent = $(
    `<div>${game.i18n.localize(
      "pf2e-thaum-vuln.ubiquitousWeakness.flavor"
    )}</div>`
  );
  const dgInnerContent = $(
    `<div class="flex-container" style="display: flex; flex-wrap: wrap; justify-content: space-around"></div>`
  );

  let selectedAlly = new Array();
  for (let ally of allies) {
    if (ally.actor.uuid != game.user.character?.uuid) {
      const allyWrapper = $(
        `<div class="pf2e-ev" style="padding: 0.5rem;"></div>`
      );
      const allyBtn = $(
        `<button style="background: url(${ally.document.texture.src}); background-size:contain; width:10rem; height:10rem;" class="ally-button" id=${ally.actor.uuid}>`
      );
      const allyName = $(
        `<p style="text-align: center">${ally.actor.name}</p>`
      );

      $(document).ready(function () {
        $(".ally-button")
          .off("click")
          .on("click", function (e) {
            if (!selectedAlly.includes(e.target.attributes.allyuuid.value)) {
              $(e.currentTarget).css("background-color", "red");
              selectedAlly.push(e.target.attributes.allyuuid.value);
            } else {
              $(e.currentTarget).css("background-color", "rgba(0,0,0,0)");
              let index = selectedAlly.indexOf(
                e.target.attributes.allyuuid.value
              );
              selectedAlly.splice(index, 1);
            }
          });
      });

      allyBtn.attr("allyuuid", ally.actor.uuid);
      allyBtn.appendTo(allyWrapper);
      allyName.appendTo(allyWrapper);
      allyWrapper.appendTo(dgInnerContent);
    }
  }
  dgInnerContent.appendTo(dgContent);

  new Dialog({
    title: game.i18n.localize("pf2e-thaum-vuln.ubiquitousWeakness.name"),
    content: dgContent.html(),
    buttons: {
      confirm: {
        label: game.i18n.localize("pf2e-thaum-vuln.dialog.confirm"),
        callback: async () => {
          ubiquitousWeakness(eff, selectedAlly, a);
        },
      },
    },
    default: "confirm",
    render: () => {},
    close: () => {},
  }).render(true);
}

export { createUWDialog };
