import { implementData } from "..";

async function amuletsAbeyance(a, allies, strikeDamageTypes) {
  const amuletImplementData = a
    .getFlag("pf2e-thaum-vuln", "selectedImplements")
    .find((i) => i.name === "Amulet");
  const adeptResistanceValue = a.level < 15 ? 5 : 10;
  const abeyanceResistanceValue = 2 + a.level;

  const dgContent = {
    allies: allies,
    damageTypes: strikeDamageTypes,
    adeptResistanceValue: adeptResistanceValue,
    abeyanceResistanceValue: abeyanceResistanceValue,
    amuletBenefits: implementData.find((i) => i.name === "Amulet").benefits,
    amuletRank: amuletImplementData,
  };

  new Dialog({
    title: "Amulet's Abeyance",
    content: await renderTemplate(
      "modules/pf2e-thaum-vuln/templates/amuletsAbeyanceDialog.hbs",
      dgContent
    ),
    buttons: {
      confirm: {
        label: game.i18n.localize("pf2e-thaum-vuln.dialog.confirm"),
        callback: async (dgEndContent) => {
          let abeyanceData = {};
          for (const btn of $(dgEndContent).find(".character-button")) {
            if ($(btn).attr("chosen")) {
              const chosenUuid = $(btn).attr("id");
              for (const selector of $(dgEndContent).find("select")) {
                if (selector.id === "damage-type-" + chosenUuid) {
                  const charName = (await fromUuid(chosenUuid)).name;
                  const damageType = $(selector)[0].value;
                  abeyanceData[charName] = {
                    uuid: chosenUuid,
                    damageType: damageType,
                  };
                }
              }
            }
          }
          console.log(abeyanceData);
        },
      },
      cancel: {
        label: game.i18n.localize("pf2e-thaum-vuln.dialog.cancel"),
        callback: () => {},
      },
    },
    default: "confirm",
    render: () => {
      $(document).ready(function () {
        const character = game.user.character;
        if (
          character
            .getFlag("pf2e-thaum-vuln", "selectedImplements")
            .find((i) => i.name === "Amulet").paragon
        ) {
          $(".character-button").css("background-color", "red");
          $(".character-button").attr("chosen", "true");
        }
        $(".character-button").bind("click", function (e) {
          $(e.target).siblings().removeAttr("chosen");
          $(".character-button").css("background-color", "rgba(0,0,0,0)");
          $(e.currentTarget).css("background-color", "red");
          $(e.currentTarget).attr("chosen", "true");
          console.log(
            $(e.target).siblings().attr("chosen"),
            $(e.target).attr("chosen")
          );

          let selectedAlly = e.target.attributes.id.value;
        });
      });
    },
    close: () => {},
  }).render(true, { width: canvas.dimensions.width / 6 });
}

function amuletAdept() {}

function amuletParagon() {}

function amuletIntensify() {}

Hooks.on("renderChatMessage", async (message, html) => {
  checkChatForAmulet(message, html);
});

async function checkChatForAmulet(message, html) {
  const a = canvas.tokens?.controlled[0] ?? undefined;
  if (
    a?.actor?.class?.name === "Thaumaturge" &&
    a?.actor?.items.some((i) => i.name === "Amulet" && i.type === "feat")
  ) {
    const effectRange = 15;
    const targets = message.flags["pf2e-thaum-vuln"].targets;
    const amuletImplementData = a.actor
      .getFlag("pf2e-thaum-vuln", "selectedImplements")
      .find((i) => i.name === "Amulet");
    let targetedAlliesInRange = new Array();
    if (amuletImplementData.paragon) {
      targetedAlliesInRange = canvas.tokens.placeables.filter(
        (token) =>
          token.actor?.alliance === "party" &&
          a.distanceTo(token) <= effectRange
      );
    } else {
      for (const target of targets) {
        const targetToken = await fromUuid(target.tokenUuid);
        if (
          targetToken._object.actor.alliance === "party" &&
          a.distanceTo(targetToken._object) <= effectRange
        ) {
          targetedAlliesInRange.push(targetToken._object);
        }
      }
    }

    if (
      message.isDamageRoll === false ||
      a.actor.getFlag("pf2e-thaum-vuln", "activeEV") !== true ||
      a.actor.getFlag("pf2e-thaum-vuln", "primaryEVTarget") !==
        `Scene.${message.speaker.scene}.Token.${message.speaker.token}.Actor.${message.speaker.actor}` ||
      targetedAlliesInRange.length <= 0
    )
      return;

    let damageRolls;
    const strikeDamageTypes = new Array();
    if (message.item.system?.damageRolls) {
      damageRolls = message.item.system.damageRolls;
      for (const roll in damageRolls) {
        if (damageRolls[roll].damageType) {
          strikeDamageTypes.push(damageRolls[roll].damageType);
        }
      }
      //below needs work
    } else if (message.item.system?.damage) {
      damageRolls = message.item.system.damage;
      strikeDamageTypes.push(damageRolls.damageType);
    }
    //message.item.system.damageRolls.map((d) => d.damageType);

    console.log(strikeDamageTypes);

    const amuletUuid = a.actor
      .getFlag("pf2e-thaum-vuln", "selectedImplements")
      .find((i) => i.name === "Amulet").uuid;

    const amulet = amuletUuid ? await fromUuid(amuletUuid) : undefined;
    const diceTotalArea = html.find(".dice-roll.damage-roll");

    if (amulet?.isHeld) {
      $(diceTotalArea).after(
        $(
          `<button class="pf2e-ev-reaction-btn" style="display: flex; align-content: center; justify-content: space-between;" title="Amulet's Abeyance Reaction"><span>Use Amulet's Abeyance </span><img src="modules/pf2e-thaum-vuln/assets/chosen-implement.webp" style="width: 1.5em;"/></button>`
        ).click({ actor: a.actor }, function () {
          amuletsAbeyance(a.actor, targetedAlliesInRange, strikeDamageTypes);
        })
      );
    }
  }
}
