import { MORTAL_WEAKNESS_EFFECT_UUID } from "../utils/index.js";
import { getEffectOnActor, hasFeat } from "../utils/helpers.js";
import { applySWEffect } from "../socket.js";
//Share Weakness macro
function shareWeakness() {
  const a = canvas.tokens.controlled;
  if (a.length != 1) {
    return ui.notifications.warn(
      game.i18n.localize(
        "pf2e-thaum-vuln.notifications.warn.shareWeakness.invalidActorCount"
      )
    );
  }
  const sa = a[0].actor;

  if (!hasFeat(sa, "share-weakness")) {
    return ui.notifications.warn(
      game.i18n.localize(
        "pf2e-thaum-vuln.notifications.warn.shareWeakness.noAbility"
      )
    );
  }
  const mortalWeaknessEffect = getEffectOnActor(
    sa,
    MORTAL_WEAKNESS_EFFECT_UUID
  );
  if (!mortalWeaknessEffect) {
    return ui.notifications.warn(
      game.i18n.localize(
        "pf2e-thaum-vuln.notifications.warn.shareWeakness.noActiveMW"
      )
    );
  }

  const allies = canvas.scene.tokens.filter(
    (token) => token.actor?.alliance === sa.alliance
  );

  const dgContent = $(
    `<div>${game.i18n.localize(
      "pf2e-thaum-vuln.shareWeakness.flavor"
    )}<br><br>${game.i18n.localize(
      "pf2e-thaum-vuln.shareWeakness.prompt"
    )}</div>`
  );
  const dgInnerContent = $(
    `<div class="flex-container" style="display: flex; flex-wrap: wrap; justify-content: space-around"></div>`
  );

  let selectedAlly;
  for (let ally of allies) {
    if (ally.actor.uuid != game.user.character?.uuid) {
      const allyWrapper = $(
        `<div class="pf2e-ev" style="padding: 0.5rem;"></div>`
      );
      const allyBtn = $(
        `<button style="background: url(${ally.texture.src}); background-size:contain; width:10rem; height:10rem;" class="ally-button" id=${ally.actor.uuid}>`
      );
      const allyName = $(
        `<p style="text-align: center">${ally.actor.name}</p>`
      );

      $(document).ready(function () {
        $(".ally-button").bind("click", function (e) {
          $(".ally-button").css("background-color", "rgba(0,0,0,0)");
          $(e.currentTarget).css("background-color", "red");
          selectedAlly = e.target.attributes.allyuuid.value;
        });
      });

      allyBtn.attr("allyuuid", ally.actor.uuid);
      allyBtn.appendTo(allyWrapper);
      allyName.appendTo(allyWrapper);
      allyWrapper.appendTo(dgInnerContent);
    }
  }
  dgInnerContent.appendTo(dgContent);

  let dgBtns = {
    confirm: {
      label: game.i18n.localize("pf2e-thaum-vuln.dialog.confirm"),
      callback: () => {
        applySWEffect(sa.uuid, selectedAlly, mortalWeaknessEffect.uuid);
      },
    },
  };

  dgContent.append(dgInnerContent);
  let dg = new Dialog({
    title: game.i18n.localize("pf2e-thaum-vuln.shareWeakness.name"),
    content: dgContent.html(),
    buttons: dgBtns,
    default: game.i18n.localize("pf2e-thaum-vuln.dialog.confirm"),
    render: () => {},
    close: () => {},
  });

  dg.render(true, {
    width: canvas.dimensions.width / 4,
  });
}

export { shareWeakness };
