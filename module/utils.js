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

import {createEffectOnActor} from "./exploit-vulnerability.js";


//Gets the effects of Personal Antithesis or Mortal Weakness from the character
export function getActorEVEffect(a){
	return a.items.find(item => item.getFlag("core", "sourceId") === PERSONAL_ANTITHESIS_EFFECT_SOURCEID || item.getFlag("core", "sourceId") === MORTAL_WEAKNESS_EFFECT_SOURCEID ||
						item.getFlag("core", "sourceId") === PERSONAL_ANTITHESIS_TARGET_SOURCEID || item.getFlag("core", "sourceId") === MORTAL_WEAKNESS_TARGET_SOURCEID) ;
}

//Gets the highest IWR value from an array that is passed in
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

//Creates the dialog box when a success or crit success on Esoteric Lore is rolled
export function createEVDialog(sa, t, paEffectSource, mwEffectSource, iwrContent) {
	const aLevel = sa.level;
	const paDmg = 2 + Math.floor(aLevel / 2);
	return new Dialog({
		title: "Exploit Vulnerability",
		content: html => "<p>Choose whether to exploit a Personal Antithesis or Mortal Weakness</p><br>" + iwrContent + `<p>Personal Antithesis Bonus Damage: ${paDmg}</p>`,
		buttons: {
			pa: {
				label: "Personal Antithesis",
				callback: () => {createEffectOnActor(sa, t, paEffectSource);}
			},
			mw: {
				label: "Mortal Weakness",
				callback: () => {createEffectOnActor(sa, t, mwEffectSource);}
			}
		},
		default: "pa",
		render: html => console.log("Register interactivity in the rendered dialog"),
		close: html => console.log("This always is logged no matter which option is chosen")
	});
}

//Creates the IWR content box content
export function createIWRContent(rollDOS, w, r, i) {
	let iwrContent;
	if(w == ''){w = false;}
	if(r == ''){r = false;}
	if(i == ''){i = false;}
	if(rollDOS === 2) {
		let weakness = !w ? "None" : `${getGreatestIWR(w).type} - ${getGreatestIWR(w).value}`;
		iwrContent = `<p>Highest Weakness: ${weakness}</p>`;
	}
	if(rollDOS === 3) {
		let weakness = !w ? "None" : stitchIWR(w);
		let resist = !r ? "None" : stitchIWR(r);
		let immune = !i ? "None" : stitchIWR(i);
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