export const EXPLOIT_VULNERABILITY_ACTION_ID = "Compendium.pf2e.actionspf2e.fodJ3zuwQsYnBbtk";
export const MORTAL_WEAKNESS_EFFECT_SOURCEID = "Item.plf15q5mFglgWG8w"
export const MORTAL_WEAKNESS_EFFECT_UUID = "Compendium.pf2e-thaum-vuln.Thaumaturge Effects.N0jy0FFGS7ViTvs9";
export const PERSONAL_ANTITHESIS_EFFECT_SOURCEID = "Item.Ug14iErZQ2h2y7B2"
export const PERSONAL_ANTITHESIS_EFFECT_UUID = "Compendium.pf2e-thaum-vuln.Thaumaturge Effects.EGY7Rxcxwv1aEyHL";
export const FLAT_FOOTED_EFFECT_UUID = "Compendium.pf2e-thaum-vuln.Thaumaturge Effects.Xuwb7a6jCWkFS0lI";
export const MORTAL_WEAKNESS_TARGET_SOURCEID = "Item.8z4Q1PuKb13GJMPR";
export const MORTAL_WEAKNESS_TARGET_UUID = "Compendium.pf2e-thaum-vuln.Thaumaturge Effects.q2TMJ31MwLNJV1jA";
export const PERSONAL_ANTITHESIS_TARGET_SOURCEID = "Item.5QgPHAdpsUHJmCkX";
export const PERSONAL_ANTITHESIS_TARGET_UUID = "Compendium.pf2e-thaum-vuln.Thaumaturge Effects.dNpf1EDKJ6fgNL42";
export const BREACHED_DEFENSES_SOURCEID = "Compendium.pf2e.feats-srd.5EzJVhiHQvr3v72n";
export const BREACHED_DEFENSES_EFFECT_SOURCEID = "Item.9ZJclirw6zHSkk0n";
export const BREACHED_DEFENSES_EFFECT_UUID = "Compendium.pf2e-thaum-vuln.Thaumaturge Effects.FMw5IpJdA6eOgtv1";
export const BREACHED_DEFENSES_TARGET_UUID = "Compendium.pf2e-thaum-vuln.Thaumaturge Effects.E38yjK1tdr579dJy";
export const BREACHED_DEFENSES_TARGET_SOURCEID = "Item.aasC0M4NDDjR84UI";
export const DIVERSE_LORE_SOURCEID = "Compendium.pf2e.feats-srd.KlqKpeq5OmTRxVHb";
export const ADJUSTMENT_TYPES = {
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
			"warpglass"
		]
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
			"sonic"
		]
	},
	"weapon-traits": {
		propLabel: "weapon-traits",
		data: [
			"magical"
		]
	}
}

import {createEffectOnActor} from "./exploit-vulnerability.js";

//Gets the effects of Personal Antithesis or Mortal Weakness from the character
export function getActorEVEffect(a, targetID) {
	if (targetID === undefined) {
		return a.items.find(item => item.getFlag("core", "sourceId") === PERSONAL_ANTITHESIS_EFFECT_SOURCEID || item.getFlag("core", "sourceId") === MORTAL_WEAKNESS_EFFECT_SOURCEID ||
			item.getFlag("core", "sourceId") === PERSONAL_ANTITHESIS_TARGET_SOURCEID || item.getFlag("core", "sourceId") === MORTAL_WEAKNESS_TARGET_SOURCEID ||
			item.getFlag("core", "sourceId") === BREACHED_DEFENSES_EFFECT_SOURCEID || item.getFlag("core", "sourceId") === BREACHED_DEFENSES_TARGET_SOURCEID);
	} else if (targetID === "*") {
		let effects = new Array;
		for (let item of a.items) {

			if (item?.sourceId === PERSONAL_ANTITHESIS_TARGET_SOURCEID ||
				item?.sourceId === MORTAL_WEAKNESS_TARGET_SOURCEID ||
				item?.sourceId === BREACHED_DEFENSES_TARGET_SOURCEID) {
				effects.push(item);
            }
		}
		return effects
	} else {
		return a.items.find(item => (item.getFlag("core", "sourceId") === PERSONAL_ANTITHESIS_TARGET_SOURCEID && item?.rules[1]?.option === "origin:id:" + targetID.split('.').join("")) ||
			(item.getFlag("core", "sourceId") === MORTAL_WEAKNESS_TARGET_SOURCEID && item?.rules[1]?.option === "origin:id:" + targetID.split('.').join("")) ||
			(item.getFlag("core", "sourceId") === BREACHED_DEFENSES_TARGET_SOURCEID && item?.rules.find(rules => rules.key === "RollOption" && rules.option === ("origin:id:" + targetID.split('.').join("")))));
    }
	}

//Gets and returns the highest IWR value from an array that is passed in
export function getGreatestIWR(iwr) {
	if (iwr) {
		let gIWR = iwr[0];
		for(const n of iwr) {
			if(n.value >= gIWR.value) {
				gIWR = n;
			}
		}
		return gIWR;
	} 
}

//gets and returns the greatest bypassable resistance
export function BDGreatestBypassableResistance(t) {
	const r = getIWR(t).resistances;
	console.log(["value of r:", r]);
	if (r) {
		let bypassResists = new Array;
		for (let resist of r) {
			if (resist.exceptions.length != 0) {
				console.log(["value of resist", r[resist]]);
				bypassResists.push(resist);
            }
		}
		console.log(["value of bypassResists", bypassResists]);
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
export function getIWR(a) {
	if (a.actor) {
		a = a.actor;
	}
	const iwr = (() => {
		return {
			resistances: a.attributes?.resistances,
			weaknesses: a.attributes?.weaknesses,
			immunities: a.attributes?.immunities
		}
	})()
	return iwr;
}

//Creates the dialog box when a success or crit success on Esoteric Lore is rolled
export async function createEVDialog(sa, t, paEffectSource, mwEffectSource, rollDOS) {
	const paDmg = 2 + Math.floor(sa.level / 2);
	const iwrContent = createIWRContent(rollDOS, t)
	let dgContent = "<p>Choose the vulnerability to exploit.</p><br>" + iwrContent + `<p>Personal Antithesis Bonus Damage: ${paDmg}</p>`;
	let dgBtns = {
		pa: {
			label: "Personal Antithesis",
			callback: () => { createEffectOnActor(sa, t, paEffectSource); }
		},
		mw: {
			label: "Mortal Weakness",
			callback: () => { createEffectOnActor(sa, t, mwEffectSource); }
		}
	}
	if (sa.items.find(item => item.getFlag("core", "sourceId") === BREACHED_DEFENSES_SOURCEID) && (rollDOS === 2 || rollDOS === 3)) {
		let bdEffectSource = await fromUuid(BREACHED_DEFENSES_EFFECT_UUID);
		const tRes = getIWR(t).resistances;
		let gBD;
		if (tRes.length != 0) {
			gBD = BDGreatestBypassableResistance(t)?.type + ", bypassed by " + BDGreatestBypassableResistance(t)?.exceptions;
		} else {
			gBD = "none";
        }
		 
		dgContent = dgContent + "<p>Highest Bypassable Resistance: " + gBD + "<p>";
		dgBtns = {
			...dgBtns,
			bd: {
				label: "Breached Defenses",
				callback: () => { createEffectOnActor(sa, t, bdEffectSource); }
			}
		};
	}
	let dg = new Dialog({
		title: "Exploit Vulnerability",
		content: html => dgContent,
		buttons: dgBtns,
		default: "pa",
		render: html => console.log("Register interactivity in the rendered dialog"),
		close: html => console.log("This always is logged no matter which option is chosen")
	});
	
	return dg;
}

//Creates the IWR content box content
export function createIWRContent(rollDOS, a) {
	let iwrContent;
	const iwrData = getIWR(a);
	if(rollDOS === 2) {
		let weakness = !iwrData.weaknesses ? "None" : `${getGreatestIWR(iwrData.weaknesses)?.type} - ${getGreatestIWR(iwrData.weaknesses)?.value}`;
		iwrContent = `<p>Highest Weakness: ${weakness}</p>`;
	}
	if(rollDOS === 3) {
		let weakness = iwrData.weaknesses.length === 0 ? "None" : stitchIWR(iwrData.weaknesses);
		let resist = iwrData.resistances.length === 0 ? "None" : stitchIWR(iwrData.resistances);
		let immune = iwrData.immunities.length === 0 ? "None" : stitchIWR(iwrData.immunities);
		iwrContent = `<div class="grid-container"><div class="grid-item"><p>Weaknesses: <ul>${weakness}</ul></p></div><div class="grid-item"><p>Resistances: <ul>${resist}</ul></p></div><div class="grid-item"><p>Immunities: <ul>${immune}</ul></p></div></div>`;
	}
	return iwrContent;
}

//stitches together the IWR information to help create the content for the dialog box
export function stitchIWR(p) {
	let s = "";
	for(const n of p){
		if(n.value){
			s = s + `<li>${n.type} - ${n.value}</li>`;
			if(n.exceptions.length != 0) {
				s = s + "Except: ";
				for(const e of n.exceptions) {
					if(e === n.exceptions[n.exceptions.length - 1]) {
						s = s + `${e}`;
					} else {s = s + `${e}, `;}
				}
				s = s + "<br>";
			}
			if(n.doubleVs == ''){n.doubleVs = false;}
			if(n.doubleVs) {
				s = s + "Double vs.: "
				for(const d of n.doubleVs) {
					if(d === n.doubleVs[n.doubleVs.length - 1]) {
						s = s + `${d}`;
					} else {s = s + `${d}, `;}
				}
			}
		} else {
			s = s + `<li>${n.type}</li>`;
			if(n.exceptions.length != 0) {
				s = s + "Except: ";
				for(const e of n.exceptions) {
					if(e === n.exceptions[n.exceptions.length - 1]) {
						s = s + `${e}`;
					} else {s = s + `${e}, `;}
				}
			}
		}
	}
	return s;
}