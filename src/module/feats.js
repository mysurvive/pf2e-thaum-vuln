const DamageRoll = CONFIG.Dice.rolls.find((r) => r.name === "DamageRoll");

//Twin Weakness macro. Borrowed heavily from Symon's Flurry of Blows macro https://gitlab.com/symonsch/my-foundryvtt-macros/-/blob/main/PF2e/Retired%20V10/Flurry%20of%20Blows.js
export async function twinWeakness() {
  //Sets the actor and token variables
  const a = canvas.tokens.controlled[0].actor;
  const evMode = a.getFlag("pf2e-thaum-vuln", "EVMode");
  const t = Array.from(game.user.targets);

  //Makes sure the actor has a mortal weakness or personal antithesis target
  if (!(evMode === "mortal-weakness" || evMode === "personal-antithesis")) {
    return ui.notifications.warn(
      game.i18n.localize(
        "pf2e-thaum-vuln.notifications.warn.twinWeakness.noValidEV"
      )
    );
  }

  //Makes sure there's a target
  if (t.length != 1) {
    return ui.notifications.warn(
      game.i18n.localize(
        "pf2e-thaum-vuln.notifications.warn.twinWeakness.invalidTargetCount"
      )
    );
  }

  //Makes sure the target is the target of Exploit Vulnerability
  if (!a.getFlag("pf2e-thaum-vuln", "EVTargetID").includes(t[0].actor.uuid)) {
    return ui.notifications.warn(
      game.i18n.localize(
        "pf2e-thaum-vuln.notifications.warn.twinWeakness.invalidTarget"
      )
    );
  }

  //Sets the variables
  const extraDamage = a.getFlag("pf2e-thaum-vuln", "EVValue");

  let weapons = a.system.actions.filter((w) => w.visible && w.item?.isMelee);
  let weaponHTML = "";

  //Creates the dialog box to choose the weapon to attack with
  for (const w of weapons) {
    weaponHTML += `<option value=${w.item.id}>${w.item.name}</option>`;
  }

  const { cWeapon, map } = await Dialog.wait(
    {
      title: game.i18n.localize("pf2e-thaum-vuln.twinWeakness.name"),
      content: `<select id="wc" autofocus> 
    ${weaponHTML} 
    </select><br>
    <hr>
    <select id="map">
    <option value=0>MAP 0</option>
    <option value=1>MAP 1</option>
    </select>
    <hr>`,
      buttons: {
        ok: {
          label: game.i18n.localize("pf2e-thaum-vuln.dialog.confirm"),
          callback: (html) => {
            return {
              cWeapon: html[0].querySelector("#wc").value,
              map: parseInt(html[0].querySelector("#map").value),
            };
          },
        },
        cancel: {
          label: game.i18n.localize("pf2e-thaum-vuln.dialog.cancel"),
        },
      },
      default: "ok",
    },
    { width: "auto" }
  );

  const chosenWeapon = weapons.find((w) => w.item.id === cWeapon);

  Hooks.on("preCreateChatMessage", PD);

  await chosenWeapon.variants[map].roll();

  async function PD(message) {
    if (
      message.user.id === game.userId &&
      message.flags.pf2e.context.type === "attack-roll"
    ) {
      const dos = message.rolls[0].options.degreeOfSuccess;
      let options = message.flags.pf2e.context.options;
      Hooks.off("preCreateChatMessage", PD);
      if (dos != 0) {
        await new DamageRoll(`{(${extraDamage})[untyped]}`).toMessage({
          flags: { pf2e: { context: { options } } },
          flavor: `<strong>${game.i18n.localize(
            "pf2e-thaum-vuln.twinWeakness.chatCardHeader"
          )}</strong>
          <div class="tags">
          <span class="tag" data-trait="esoterica" data-description="PF2E.TraitDescriptionEsoterica">Esoterica</span>
          <span class="tag" data-trait="thaumaturge" data-description="PF2E.TraitDescriptionThaumaturge">Thaumaturge</span>
          </div>`,
        });
      }
    }
  }
}
