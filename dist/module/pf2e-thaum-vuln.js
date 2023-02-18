const EXPLOIT_VULNERABILITY_ACTION_ID =
  "Compendium.pf2e.actionspf2e.fodJ3zuwQsYnBbtk";
const MORTAL_WEAKNESS_EFFECT_SOURCEID = "Item.plf15q5mFglgWG8w";
const MORTAL_WEAKNESS_EFFECT_UUID =
  "Compendium.pf2e-thaum-vuln.Thaumaturge Effects.N0jy0FFGS7ViTvs9";
const PERSONAL_ANTITHESIS_EFFECT_SOURCEID = "Item.Ug14iErZQ2h2y7B2";
const PERSONAL_ANTITHESIS_EFFECT_UUID =
  "Compendium.pf2e-thaum-vuln.Thaumaturge Effects.EGY7Rxcxwv1aEyHL";
const FLAT_FOOTED_EFFECT_UUID =
  "Compendium.pf2e-thaum-vuln.Thaumaturge Effects.Xuwb7a6jCWkFS0lI";
const MORTAL_WEAKNESS_TARGET_SOURCEID = "Item.8z4Q1PuKb13GJMPR";
const MORTAL_WEAKNESS_TARGET_UUID =
  "Compendium.pf2e-thaum-vuln.Thaumaturge Effects.q2TMJ31MwLNJV1jA";
const PERSONAL_ANTITHESIS_TARGET_SOURCEID = "Item.5QgPHAdpsUHJmCkX";
const PERSONAL_ANTITHESIS_TARGET_UUID =
  "Compendium.pf2e-thaum-vuln.Thaumaturge Effects.dNpf1EDKJ6fgNL42";
const BREACHED_DEFENSES_SOURCEID =
  "Compendium.pf2e.feats-srd.5EzJVhiHQvr3v72n";
const BREACHED_DEFENSES_EFFECT_SOURCEID = "Item.9ZJclirw6zHSkk0n";
const BREACHED_DEFENSES_EFFECT_UUID =
  "Compendium.pf2e-thaum-vuln.Thaumaturge Effects.FMw5IpJdA6eOgtv1";
const BREACHED_DEFENSES_TARGET_UUID =
  "Compendium.pf2e-thaum-vuln.Thaumaturge Effects.E38yjK1tdr579dJy";
const BREACHED_DEFENSES_TARGET_SOURCEID = "Item.aasC0M4NDDjR84UI";
const ADJUSTMENT_TYPES = {
  materials: {
    propLabel: "materials",
    data: [
      "abysium",
      "adamantine",
      "cold-iron",
      "darkwood",
      "djezet",
      "dragonhide",
      "grisantian-pelt",
      "inubrix",
      "mithral",
      "noqual",
      "orichalcum",
      "peachwood",
      "siccatite",
      "silver",
      "sisterstone-dusk",
      "sisterstone-scarlet",
      "sovereign-steel",
      "warpglass",
    ],
  },
  traits: {
    propLabel: "traits",
    data: [
      "chaotic",
      "evil",
      "good",
      "lawful",
      "air",
      "earth",
      "fire",
      "metal",
      "water",
      "acid",
      "cold",
      "electricity",
      "fire",
      "force",
      "negative",
      "positive",
      "sonic",
    ],
  },
  "weapon-traits": {
    propLabel: "weapon-traits",
    data: ["magical"],
  },
};

//Gets the effects of Personal Antithesis or Mortal Weakness from the character
function getActorEVEffect(a, targetID) {
  if (targetID === undefined) {
    return a.items.find(
      (item) =>
        item.getFlag("core", "sourceId") ===
          PERSONAL_ANTITHESIS_EFFECT_SOURCEID ||
        item.getFlag("core", "sourceId") === MORTAL_WEAKNESS_EFFECT_SOURCEID ||
        item.getFlag("core", "sourceId") ===
          PERSONAL_ANTITHESIS_TARGET_SOURCEID ||
        item.getFlag("core", "sourceId") === MORTAL_WEAKNESS_TARGET_SOURCEID ||
        item.getFlag("core", "sourceId") ===
          BREACHED_DEFENSES_EFFECT_SOURCEID ||
        item.getFlag("core", "sourceId") === BREACHED_DEFENSES_TARGET_SOURCEID
    );
  } else if (targetID === "*") {
    let effects = new Array();
    for (let item of a.items) {
      if (
        item?.sourceId === PERSONAL_ANTITHESIS_TARGET_SOURCEID ||
        item?.sourceId === MORTAL_WEAKNESS_TARGET_SOURCEID ||
        item?.sourceId === BREACHED_DEFENSES_TARGET_SOURCEID
      ) {
        effects.push(item);
      }
    }
    return effects;
  } else {
    return a.items.find(
      (item) =>
        (item.getFlag("core", "sourceId") ===
          PERSONAL_ANTITHESIS_TARGET_SOURCEID &&
          item?.rules[1]?.option ===
            "origin:id:" + targetID.split(".").join("")) ||
        (item.getFlag("core", "sourceId") === MORTAL_WEAKNESS_TARGET_SOURCEID &&
          item?.rules[1]?.option ===
            "origin:id:" + targetID.split(".").join("")) ||
        (item.getFlag("core", "sourceId") ===
          BREACHED_DEFENSES_TARGET_SOURCEID &&
          item?.rules.find(
            (rules) =>
              rules.key === "RollOption" &&
              rules.option === "origin:id:" + targetID.split(".").join("")
          ))
    );
  }
}

//Gets and returns the highest IWR value from an array that is passed in
function getGreatestIWR(iwr) {
  if (iwr) {
    let gIWR = iwr[0];
    for (const n of iwr) {
      if (n.value >= gIWR.value) {
        gIWR = n;
      }
    }
    return gIWR;
  }
}

//gets and returns the greatest bypassable resistance
function BDGreatestBypassableResistance(t) {
  const r = getIWR(t).resistances;
  if (r) {
    let bypassResists = new Array();
    for (let resist of r) {
      if (resist.exceptions.length != 0) {
        bypassResists.push(resist);
      }
    }
    if (bypassResists.length != 0) {
      let gBD = bypassResists[0];
      for (let resist of bypassResists) {
        if (resist.value >= gBD.value) {
          gBD = resist;
        }
      }
      return gBD;
    }
  }
}

//gets and returns the IWR information from from the selected token or actor
function getIWR(a) {
  if (a.actor) {
    a = a.actor;
  }
  const iwr = (() => {
    return {
      resistances: a.attributes?.resistances,
      weaknesses: a.attributes?.weaknesses,
      immunities: a.attributes?.immunities,
    };
  })();
  return iwr;
}

//Creates the dialog box when a success or crit success on Esoteric Lore is rolled
async function createEVDialog(
  sa,
  t,
  paEffectSource,
  mwEffectSource,
  rollDOS
) {
  const paDmg = 2 + Math.floor(sa.level / 2);
  const iwrContent = createIWRContent(rollDOS, t);
  let dgContent =
    "<p>Choose the vulnerability to exploit.</p><br>" +
    iwrContent +
    `<p>Personal Antithesis Bonus Damage: ${paDmg}</p>`;
  let dgBtns = {
    pa: {
      label: "Personal Antithesis",
      callback: () => {
        createEffectOnActor(sa, t, paEffectSource);
      },
    },
    mw: {
      label: "Mortal Weakness",
      callback: () => {
        createEffectOnActor(sa, t, mwEffectSource);
      },
    },
  };
  if (
    sa.items.find(
      (item) => item.getFlag("core", "sourceId") === BREACHED_DEFENSES_SOURCEID
    ) &&
    (rollDOS === 2 || rollDOS === 3)
  ) {
    let bdEffectSource = await fromUuid(BREACHED_DEFENSES_EFFECT_UUID);
    const tRes = getIWR(t).resistances;
    let gBD;
    if (tRes.length != 0) {
      gBD =
        BDGreatestBypassableResistance(t)?.type +
        ", bypassed by " +
        BDGreatestBypassableResistance(t)?.exceptions;
    } else {
      gBD = "none";
    }

    dgContent = dgContent + "<p>Highest Bypassable Resistance: " + gBD + "<p>";
    dgBtns = {
      ...dgBtns,
      bd: {
        label: "Breached Defenses",
        callback: () => {
          createEffectOnActor(sa, t, bdEffectSource);
        },
      },
    };
  }
  let dg = new Dialog({
    title: "Exploit Vulnerability",
    content: () => dgContent,
    buttons: dgBtns,
    default: "pa",
    render: () => {},
    close: () => {},
  });

  return dg;
}

//Creates the IWR content box content
function createIWRContent(rollDOS, a) {
  let iwrContent;
  const iwrData = getIWR(a);
  if (rollDOS === 2) {
    let weakness =
      iwrData.weaknesses.length == 0
        ? "None"
        : `${getGreatestIWR(iwrData.weaknesses)?.type} - ${
            getGreatestIWR(iwrData.weaknesses)?.value
          }`;
    iwrContent = `<p>Highest Weakness: ${weakness}</p>`;
  }
  if (rollDOS === 3) {
    let weakness =
      iwrData.weaknesses.length == 0 ? "None" : stitchIWR(iwrData.weaknesses);
    let resist =
      iwrData.resistances.length == 0 ? "None" : stitchIWR(iwrData.resistances);
    let immune =
      iwrData.immunities.length == 0 ? "None" : stitchIWR(iwrData.immunities);
    iwrContent = `<div class="grid-container"><div class="grid-item"><p>Weaknesses: <ul>${weakness}</ul></p></div><div class="grid-item"><p>Resistances: <ul>${resist}</ul></p></div><div class="grid-item"><p>Immunities: <ul>${immune}</ul></p></div></div>`;
  }
  return iwrContent;
}

//stitches together the IWR information to help create the content for the dialog box
function stitchIWR(p) {
  let s = "";
  for (const n of p) {
    if (n.value) {
      s = s + `<li>${n.type} - ${n.value}</li>`;
      if (n.exceptions.length != 0) {
        s = s + "Except: ";
        for (const e of n.exceptions) {
          if (e === n.exceptions[n.exceptions.length - 1]) {
            s = s + `${e}`;
          } else {
            s = s + `${e}, `;
          }
        }
        s = s + "<br>";
      }
      if (n.doubleVs == "") {
        n.doubleVs = false;
      }
      if (n.doubleVs) {
        s = s + "Double vs.: ";
        for (const d of n.doubleVs) {
          if (d === n.doubleVs[n.doubleVs.length - 1]) {
            s = s + `${d}`;
          } else {
            s = s + `${d}, `;
          }
        }
      }
    } else {
      s = s + `<li>${n.type}</li>`;
      if (n.exceptions.length != 0) {
        s = s + "Except: ";
        for (const e of n.exceptions) {
          if (e === n.exceptions[n.exceptions.length - 1]) {
            s = s + `${e}`;
          } else {
            s = s + `${e}, `;
          }
        }
      }
    }
  }
  return s;
}

let socket;

Hooks.once("socketlib.ready", () => {
  socket = socketlib.registerModule("pf2e-thaum-vuln");
  socket.register("createEffectOnTarget", _socketCreateEffectOnTarget);
  socket.register("updateEVEffect", _socketUpdateEVEffect);
  socket.register("deleteEVEffect", _socketDeleteEVEffect);
  socket.register("createSecretMessage", _socketCreateSecretMessage);
});

function createEffectOnTarget(a, t, effect, evTargets) {
  let aID = a.uuid;
  let tID = t.actor.uuid;
  let eID = effect.uuid;
  return socket.executeAsGM(
    _socketCreateEffectOnTarget,
    aID,
    tID,
    eID,
    evTargets
  );
}

function updateEVEffect(a) {
  return socket.executeAsGM(_socketUpdateEVEffect, a);
}

function deleteEVEffect(a, sa = undefined) {
  let targ = new Array();
  if (sa === undefined) {
    for (let tg of a) {
      if (tg.actor) {
        if (getActorEVEffect(tg.actor)) {
          targ.push(tg.actor.uuid);
        }
      } else {
        if (getActorEVEffect(tg)) {
          targ.push(tg.uuid);
        }
      }
    }
    return socket.executeAsGM(_socketDeleteEVEffect, targ);
  } else {
    let actorID = sa.uuid;
    let effect;
    for (let tg of a) {
      if (tg?.actor) {
        if (getActorEVEffect(tg.actor)) {
          effect = getActorEVEffect(tg.actor);
          if (
            effect.system?.rules
              .find((rules) => rules.key === "RollOption")
              ?.option?.split(":")[2] === actorID
          ) {
            targ.push(tg.actor.uuid);
          } else if (tg.actor === sa) {
            targ.push(tg.actor.uuid);
          }
        }
      } else {
        if (getActorEVEffect(tg)) {
          if (tg.uuid != actorID) {
            effect = getActorEVEffect(tg);
            if (
              effect.system.rules
                .find((rules) => rules.key === "RollOption")
                .option.split(":")[2] === actorID
            ) {
              targ.push(tg.uuid);
            }
          } else {
            targ.push(actorID);
          }
        }
      }
    }
    return socket.executeAsGM(_socketDeleteEVEffect, targ, actorID);
  }
}

async function _socketCreateEffectOnTarget(aID, tID, eID, evTargets) {
  const a = await fromUuid(aID);
  const t = await fromUuid(tID);
  const e = await fromUuid(eID);

  let eff = e.toObject();

  const m = await fromUuid(MORTAL_WEAKNESS_TARGET_UUID);
  const p = await fromUuid(PERSONAL_ANTITHESIS_TARGET_UUID);
  const b = await fromUuid(BREACHED_DEFENSES_TARGET_UUID);

  const iwrData = getIWR(t);

  if (eff.flags.core.sourceId === MORTAL_WEAKNESS_EFFECT_SOURCEID) {
    eff = m.toObject();
    if (iwrData.weaknesses.length != 0) {
      eff.system.rules[0].value = getGreatestIWR(iwrData.weaknesses)?.value;
    }
    a.setFlag("pf2e-thaum-vuln", "EVValue", `${eff.system.rules[0].value}`);
  } else if (eff.flags.core.sourceId === PERSONAL_ANTITHESIS_EFFECT_SOURCEID) {
    eff = p.toObject();
    eff.system.rules[0].value = Math.floor(a.level / 2) + 2;
    a.setFlag("pf2e-thaum-vuln", "EVValue", `${eff.system.rules[0].value}`);
  } else if (eff.flags.core.sourceId === BREACHED_DEFENSES_EFFECT_SOURCEID) {
    eff = b.toObject();
    a.setFlag(
      "pf2e-thaum-vuln",
      "EVValue",
      `${
        e.system.rules.find(
          (rules) => rules.slug === "breached-defenses-bypass"
        ).value
      }`
    );
  }
  if (eff.system?.rules[0]?.value) {
    a.setFlag("pf2e-thaum-vuln", "EVValue", `${eff.system.rules[0].value}`);
  }
  eff.system.rules.find(
    (rules) => rules.key === "RollOption"
  ).option = `origin:id:${a.uuid}`;

  eff.name = eff.name + ` (${a.name})`;
  for (let targ of evTargets) {
    const tg = await fromUuid(targ);
    tg.actor.createEmbeddedDocuments("Item", [eff]);
  }
  return;
}

//This is a temporary fix until a later pf2e system update. The function hooks on renderChatMessage attack-rolls
//If the thaumaturge makes an attack-roll, the target's weakness updates with the correct amount
//If it's not the thaumaturge that makes the attack-roll, it changes the weakness to 0
async function _socketUpdateEVEffect(a) {
  let sa = await fromUuid(`Actor.${a}`);
  let updates;
  let tKey;
  let value;
  let origin;
  let rollOptionData;
  if (!(sa.getFlag("pf2e-thaum-vuln", "EVMode") === "breached-defenses")) {
    for (let act of canvas.tokens.placeables) {
      if (act.actor.uuid != a.uuid) {
        for (let effect of getActorEVEffect(act.actor, "*")) {
          if (
            effect?.rules[1]?.option.split(":")[2] != `Actor${a}` &&
            effect?.rules[1]?.option
          ) {
            value = 0;
          } else if (effect?.rules[1]?.option) {
            let acts = effect.rules[1].option.split(":")[2];
            acts = acts.replace("Actor", "Actor.");
            origin = await fromUuid(acts);
            value = origin.getFlag("pf2e-thaum-vuln", "EVValue");
          }
          tKey = effect._id;
          rollOptionData = effect.rules[1]?.option.replace("Actor", "Actor.");
          updates = {
            _id: tKey,
            system: {
              rules: [
                {
                  key: "Weakness",
                  type: "physical",
                  value: value,
                  predicate: [""],
                },
                {
                  key: "RollOption",
                  domain: "damage-roll",
                  option: rollOptionData,
                },
              ],
            },
          };
          await act.actor.updateEmbeddedDocuments("Item", [updates]);
        }
      }
    }
  }
}

//Deletes the effect from the actor passed to the method
async function _socketDeleteEVEffect(targ, actorID) {
  let eff;
  if (actorID === undefined) {
    for (let act of targ) {
      let a = await fromUuid(act);
      if (a.actor) {
        eff = getActorEVEffect(a.actor);
      } else {
        eff = getActorEVEffect(a);
      }
      eff.delete();
    }
  } else {
    for (let act of targ) {
      let a = await fromUuid(act);
      if (a.uuid != actorID) {
        if (a.actor) {
          eff = getActorEVEffect(a.actor, actorID);
        } else {
          eff = getActorEVEffect(a, actorID);
        }
      } else {
        eff = getActorEVEffect(a, undefined);
      }
      eff.delete();
    }
  }
}

async function _socketCreateSecretMessage(message) {
  await ChatMessage.create(message);
}

Hooks.on("init", () => {
  game.pf2eThaumVuln = {
    exploitVuln,
    forceEVTarget,
  };
});

//Creates the passed effect document on the actor
async function createEffectOnActor(sa, t, effect) {
  let eff = effect.toObject();
  let creatureType;
  let evMode;
  let effSlug;
  let effPredicate;
  let evTargets = new Array();
  if (eff.flags.core.sourceId === MORTAL_WEAKNESS_EFFECT_SOURCEID) {
    if (getIWR(t).weaknesses.length === 0) {
      return ui.notifications.warn(
        "There are no weaknesses on this creature to exploit a Mortal Weakness against."
      );
    }
    if (t.actor.system.details.creatureType == "") {
      creatureType = "exploit-vulnerability";
    } else {
      creatureType = t.actor.system.details.creatureType;
    }
    effPredicate = `target:effect:Mortal Weakness Target ${sa.name}`.slugify();
    effSlug = "mortal-weakness-effect-magical";
    evMode = "mortal-weakness";
  } else if (eff.flags.core.sourceId === PERSONAL_ANTITHESIS_EFFECT_SOURCEID) {
    effPredicate =
      `target:effect:Personal Antithesis Target ${sa.name}`.slugify();
    effSlug = "personal-antithesis-effect-magical";
    evMode = "personal-antithesis";

    //breached defenses logic. It mostly works.... there are a few weird cases where it doesn't work such as when the highest
    //resistance that can be bypassed is a combination of two traits (see adamantine golem's resistance bypass from vorpal-adamantine)
    //or if the trait that bypasses it is not in the system/on my list
  } else if (eff.flags.core.sourceId === BREACHED_DEFENSES_EFFECT_SOURCEID) {
    evMode = "breached-defenses";
    effPredicate =
      `target:effect:Breached Defenses Target ${sa.name}`.slugify();
    effSlug = "breached-defenses-bypass";
    const bypassable = BDGreatestBypassableResistance(t);
    const exception = (() => {
      let property;
      for (const prop in ADJUSTMENT_TYPES) {
        for (const excp of ADJUSTMENT_TYPES[prop].data) {
          if (excp === bypassable.exceptions[0]) {
            property = ADJUSTMENT_TYPES[prop].propLabel;
          }
        }
      }
      return {
        property: property,
        exception: bypassable.exceptions[0],
      };
    })();
    eff.system.rules.find(
      (rules) => rules.slug === "breached-defenses-bypass"
    ).value = exception.exception;
    eff.system.rules.find(
      (rules) => rules.slug === "breached-defenses-bypass"
    ).property = exception.property;
    eff.system.rules.find(
      (rules) => rules.slug === "breached-defenses-bypass"
    ).predicate = `target:effect:Breached Defenses Target ${sa.name}`.slugify();
  }
  eff.system.rules.find((rules) => rules.slug === effSlug).predicate =
    effPredicate;

  evTargets.push(t.actor.uuid);

  createEffectOnTarget(sa, t, effect, evTargets);
  await sa.setFlag("pf2e-thaum-vuln", "activeEV", true);
  await sa.setFlag("pf2e-thaum-vuln", "EVTargetID", evTargets);
  await sa.setFlag("pf2e-thaum-vuln", "EVTargetType", `${creatureType}`);
  await sa.setFlag("pf2e-thaum-vuln", "EVMode", `${evMode}`);
  await sa.createEmbeddedDocuments("Item", [eff]);
}

async function exploitVuln() {
  //grab the selected token and the targeted token
  const a = canvas.tokens.controlled;
  let ts = Array.from(game.user.targets);

  //make sure we're only targeting one target and have the thaum selected
  if (a.length != 1 || ts.length != 1) {
    return ui.notifications.warn(
      "Select one Thaumaturge token and target one creature."
    );
  }

  //set the first index in the array as the target and the first controlled token actor as selected actor
  const t = Array.from(ts)[0];
  const sa = a[0].actor;

  //check for exploit vulnerability on the actor
  const exploitVulnAction = sa.items.find(
    (item) =>
      item.getFlag("core", "sourceId") === EXPLOIT_VULNERABILITY_ACTION_ID
  );
  if (!exploitVulnAction) {
    return ui.notifications.warn(
      `${a[0].actor.name} does not have the ability to Exploit Vulnerability`
    );
  }

  //deletes Exploit Vulnerability effect if it already exists on the actor
  await deleteEVEffect(canvas.tokens.placeables, sa);

  // From https://gist.github.com/stwlam/01c2506e93c298b01ad83c182b245144 by somebody, Supe, and stwlam
  const skill = sa.system.skills["esoteric-lore"];
  if (!skill) {
    return ui.notifications.warn(
      `${sa.name} does not have the Esoteric Lore skill`
    );
  }
  const dc = {
    "-1": 13,
    ...Object.fromEntries(
      Object.entries([
        14, 15, 16, 18, 19, 20, 22, 23, 24, 26, 27, 28, 30, 31, 32, 34, 35, 36,
        38, 39, 40, 42, 44, 46, 48, 50,
      ])
    ),
  }[t.actor.level];
  if (!dc) {
    return ui.notifications.warn("No matching DC for target");
  }

  const rollOptions = sa.getRollOptions(["skill-check", skill.slug]);

  const outcomes = {
    criticalSuccess:
      "You remember the creature's weaknesses, and as you empower your esoterica, you have a flash of insight that grants even more knowledge about the creature. You learn all of the creature's resistances, weaknesses, and immunities, including the amounts of the resistances and weaknesses and any unusual weaknesses or vulnerabilities, such as what spells will pass through a golem's antimagic. You can exploit either the creature's mortal weakness or personal antithesis (see below). Your unarmed and weapon Strikes against the creature also become magical if they weren't already.",
    success:
      "You recall an important fact about the creature, learning its highest weakness (or one of its highest weaknesses, if it has multiple with the same value) but not its other weaknesses, resistances, or immunities. You can exploit either the creature's mortal weakness or personal antithesis. Your unarmed and weapon Strikes against the creature also become magical if they weren't already.",
    failure:
      "Failing to recall a salient weakness about the creature, you instead attempt to exploit a more personal vulnerability. You can exploit only the creature's personal antithesis. Your unarmed and weapon Strikes against the creature also become magical if they weren't already.",
    criticalFailure:
      "You couldn't remember the right object to use and become distracted while you rummage through your esoterica. You become flat-footed until the beginning of your next turn.",
  };

  const notes = Object.entries(outcomes).map(([outcome, text]) => ({
    title: game.i18n.localize("PF2E.Check.Result.Degree.Check." + outcome),
    text,
    outcome: [outcome],
  }));

  const hasDiverseLore = sa.items.some((i) => i.slug === "diverse-lore");
  if (hasDiverseLore) {
    // todo: put npc identify data in the document and then show secret text for it.
    const dc = t.actor.system.details.identification?.skill.dc;
    const diverseLoreDC = dc
      ? `<br/><span data-visibility="gm">Recall Knowledge DC ${dc}</span>`
      : "";
    notes.push({
      title: "Diverse Lore",
      text: `When you succeed at your check to Exploit a Vulnerability, compare the result of your Esoteric Lore check to the DC to Recall Knowledge for that creature; if that number would be a success or a critical success, you gain information as if you had succeeded at the Recall Knowledge check. ${diverseLoreDC}`,
      outcome: ["success", "criticalSuccess"],
    });
  }

  const flavor = `Exploit Vulnerability: ${skill.label}`;
  const checkModifier = new game.pf2e.CheckModifier(flavor, skill);
  const traits = ["esoterica", "manipulate", "thaumaturge"];
  const evRoll = await game.pf2e.Check.roll(
    checkModifier,
    {
      actor: sa,
      target: {
        actor: t.actor,
        token: t.document,
      },
      type: "skill-check",
      options: rollOptions,
      notes,
      dc: { value: dc },
      traits: traits.map((t) => ({
        name: t,
        label: CONFIG.PF2E.actionTraits[t] ?? t,
        description: CONFIG.PF2E.traitsDescriptions[t],
      })),
      flavor: `
    <strong>Frequency</strong> once per round<br/>
    <strong>Requirements</strong> You are holding your implement<br/>
    <hr/>
    <p>You scour your experiences and learning to identify something that might repel your foe. You retrieve an object from your esoterica with the appropriate supernatural qualities, then use your implement to stoke the remnants of its power into a blaze. Select a creature you can see and attempt an Esoteric Lore check against a standard DC for its level, as you retrieve the right object from your esoterica and use your implement to empower it. You gain the following effects until you Exploit Vulnerabilities again.</p>
  `,
    },
    event
  );

  const paEffectSource = await fromUuid(PERSONAL_ANTITHESIS_EFFECT_UUID);
  const mwEffectSource = await fromUuid(MORTAL_WEAKNESS_EFFECT_UUID);
  const flatFootedEffect = await fromUuid(FLAT_FOOTED_EFFECT_UUID);

  let evDialog;

  //Apply effect based on Degrees of success
  switch (evRoll.degreeOfSuccess) {
    case 0:
      //critical failure. Apply flatfooted condition for one round.
      await sa.createEmbeddedDocuments("Item", [flatFootedEffect.toObject()]);
      break;
    case 1:
      //normal failure. Can only apply personal antithesis.
      await createEffectOnActor(sa, t, paEffectSource);
      break;
    case 2:
      //normal success. Learns highest weakness. Can apply Mortal Weakness or Personal Antithesis
      evDialog = await createEVDialog(sa, t, paEffectSource, mwEffectSource, 2);
      evDialog.render(true);
      break;
    case 3:
      //Critical success. Learns all weaknesses, resistances, and immunities including the amounts and any unusual weaknesses or vulnerabilities
      //Can apply Mortal Weakness or Personal Antithesis.
      evDialog = await createEVDialog(sa, t, paEffectSource, mwEffectSource, 3);
      evDialog.render(true);
      break;
    default:
      return;
  }
}

//macro that allows GMs to apply the same exploit vulnerability on a target
async function forceEVTarget() {
  const m = await fromUuid(MORTAL_WEAKNESS_TARGET_UUID);
  const p = await fromUuid(PERSONAL_ANTITHESIS_TARGET_UUID);
  let eff;

  let a = canvas.tokens.controlled[0];
  let tar = Array.from(game.user.targets);
  if (canvas.tokens.controlled.length != 1 || tar.length === 0) {
    return ui.notifications.warn(
      "Select one Thaumaturge token and target one or more creatures"
    );
  }
  let evM = a.actor.getFlag("pf2e-thaum-vuln", "EVMode");
  if (evM === "mortal-weakness") {
    eff = m.toObject();
  } else if (evM === "personal-antithesis") {
    eff = p.toObject();
  } else {
    return ui.notifications.warn(
      "Selected token has not activated Exploit Vulnerability"
    );
  }
  eff.system.rules[0].value = a.actor.getFlag("pf2e-thaum-vuln", "EVValue");
  eff.system.rules[1].option = `origin:id:${a.actor.uuid}`;
  eff.name += " (" + a.actor.name + ")";
  for (let targ of tar) {
    if (getActorEVEffect(targ.actor)) {
      await deleteEVEffect([targ.actor]);
    } else {
      await targ.actor.createEmbeddedDocuments("Item", [eff]);
    }
  }
}

//This is a temporary fix until a later pf2e system update. The function hooks on renderChatMessage attack-rolls
//If the thaumaturge makes an attack-roll, the target's weakness updates with the correct amount
//If it's not the thaumaturge that makes the attack-roll, it changes the weakness to 0
Hooks.on(
  "renderChatMessage",
  (message) => {
    if (
      message.speaker.actor &&
      message.flags?.pf2e?.context?.type === "attack-roll" &&
      canvas.initialized
    ) {
      let a = canvas.tokens.placeables.find(
        (act) => act.actor.id === message.speaker.actor
      ).actor;
      if (a.type === "character") {
        updateEVEffect(message.speaker.actor);
      }
    }
  },
  { once: false }
);

export { createEffectOnActor, exploitVuln, forceEVTarget };
//# sourceMappingURL=pf2e-thaum-vuln.js.map
