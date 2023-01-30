import {MORTAL_WEAKNESS_TARGET_SOURCEID, MORTAL_WEAKNESS_TARGET_UUID, PERSONAL_ANTITHESIS_TARGET_SOURCEID, PERSONAL_ANTITHESIS_TARGET_UUID,
		MORTAL_WEAKNESS_EFFECT_UUID, PERSONAL_ANTITHESIS_EFFECT_UUID, MORTAL_WEAKNESS_EFFECT_SOURCEID, PERSONAL_ANTITHESIS_EFFECT_SOURCEID} from "./utils.js";

import {getGreatestIWR, getActorEffects} from "./exploit-vulnerability.js";

let socket;

Hooks.once("socketlib.ready", () => {
	socket = socketlib.registerModule("pf2e-thaum-vuln");
	socket.register("createEffectOnTarget", _socketCreateEffectOnTarget);
});

export function createEffectOnTarget(a, t, effect) {
	let aID = a.uuid;
	let tID = t.actor.uuid;
	let eID = effect.uuid;
	return socket.executeAsGM(_socketCreateEffectOnTarget, aID, tID, eID);
}	

async function _socketCreateEffectOnTarget(aID, tID, eID) {
	
	const a = await fromUuid(aID);
	const t = await fromUuid(tID);
	const e = await fromUuid(eID);	

	let existing = t.actor.items.find(item => item.getFlag("core", "sourceId") === MORTAL_WEAKNESS_TARGET_SOURCEID || item.getFlag("core", "sourceId") === PERSONAL_ANTITHESIS_TARGET_SOURCEID);
	
	if(existing){
		console.log(existing);
		await existing.delete();
	}
	

	let eff = e.toObject();
	
	const m = await fromUuid(MORTAL_WEAKNESS_TARGET_UUID);
	const p = await fromUuid(PERSONAL_ANTITHESIS_TARGET_UUID);
	
	if(eff.flags.core.sourceId === MORTAL_WEAKNESS_EFFECT_SOURCEID) {
		eff = m.toObject();
		if(t.system?.attributes?.weaknesses){
			eff.system.rules[0].value = getGreatestIWR(t.actor.system?.attributes?.weaknesses).value;
		} else if (t.actor.system?.attributes?.weaknesses) {
		eff.system.rules[0].value = getGreatestIWR(t.actor.system?.attributes?.weaknesses).value;
		}

	}else if(eff.flags.core.sourceId === PERSONAL_ANTITHESIS_EFFECT_SOURCEID) {
		eff = p.toObject();
		eff.system.rules[0].value = Math.floor(a.level / 2)+2;
	}
	console.log(eff);
	a.setFlag("pf2e-thaum-vuln", "EVValue", `${eff.system.rules[0].value}`);
	await t.actor.createEmbeddedDocuments('Item', [eff]);
	return;
}