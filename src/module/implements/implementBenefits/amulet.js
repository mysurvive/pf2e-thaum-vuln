async function amuletInitiate(a) {
  const resistanceAmount = 2 + a.level;
}

function amuletAdept() {}

function amuletParagon() {}

function amuletIntensify() {}

Hooks.on("renderChatMessage", async (message, html) => {
  const a = canvas.tokens?.controlled[0].actor ?? undefined;
  const effectRange = 15;
  const targetAlliesInRange = message.flags["pf2e-thaum-vuln"].targets.map(
    async (target, a) => {
      target = await fromUuid(target.tokenUuid);
      console.log(target);
      if (
        target.alliance === "party" &&
        target.distanceTo(a.token) <= effectRange
      )
        return target;
    }
  );

  if (
    a?.class?.name !== "Thaumaturge" ||
    a === undefined ||
    message.isDamageRoll === false ||
    a.getFlag("pf2e-thaum-vuln", "activeEV") !== true ||
    a.getFlag("pf2e-thaum-vuln", "primaryEVTarget") !==
      `Scene.${message.speaker.scene}.Token.${message.speaker.token}.Actor.${message.speaker.actor}` ||
    targetAlliesInRange.length <= 0 ||
    !a.items.some((i) => i.name === "Amulet" && i.type === "feat")
  )
    return;

  const amuletUuid = a
    .getFlag("pf2e-thaum-vuln", "selectedImplements")
    .find((i) => i.name === "Amulet").uuid;

  const amulet = amuletUuid ? await fromUuid(amuletUuid) : undefined;
  const diceTotalArea = html.find(".dice-total");

  if (amulet?.isHeld) {
    diceTotalArea
      .append(
        `<button class="pf2e-ev-reaction-btn" style="display: flex; align-content: center; justify-content: space-between;" title="Amulet's Abeyance Reaction"><span>Use Amulet's Abeyance </span><img src="modules/pf2e-thaum-vuln/assets/chosen-implement.webp" style="width: 1.5em;"/></button>`
      )
      .on({ click: amuletInitiate(a) });
  }
});
