import {MORTAL_WEAKNESS_TARGET_UUID, PERSONAL_ANTITHESIS_TARGET_UUID,
		MORTAL_WEAKNESS_EFFECT_SOURCEID, PERSONAL_ANTITHESIS_EFFECT_SOURCEID} from "./utils.js";

import {getActorEVEffect, getGreatestIWR} from "./utils.js";

let socket;

Hooks.once("socketlib.ready", () => {
	socket = socketlib.registerModule("pf2e-thaum-vuln");
	socket.register("createEffectOnTarget", _socketCreateEffectOnTarget);
	socket.register("updateEVEffect", _socketUpdateEVEffect);
	socket.register("deleteEVEffect", _socketDeleteEVEffect);
});

export function createEffectOnTarget(a, t, effect, evTargets) {
	let aID = a.uuid;
	let tID = t.actor.uuid;
	let eID = effect.uuid;
	return socket.executeAsGM(_socketCreateEffectOnTarget, aID, tID, eID, evTargets);
}	

export function updateEVEffect(a) {
	return socket.executeAsGM(_socketUpdateEVEffect, a);
}

export function deleteEVEffect(a, sa = undefined) {
	let targ = new Array;
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
					if (effect.system?.rules[1]?.option?.split(":")[2] === actorID) {
						targ.push(tg.actor.uuid);
					} else if(tg.actor === sa){
						targ.push(tg.actor.uuid)
                    }
				}
			}
			else {
				if (getActorEVEffect(tg)) {
					if (tg.uuid != actorID) {
						effect = getActorEVEffect(tg);
						if (effect.system.rules[1].option.split(":")[2] === actorID) {
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
	a.setFlag("pf2e-thaum-vuln", "EVValue", `${eff.system.rules[0].value}`);
	eff.system.rules[1].option = `origin:id:${a.uuid}`;
	eff.name = eff.name + ` (${a.name})`
	for(let targ of evTargets) {
		const tg = await fromUuid(targ);
		tg.actor.createEmbeddedDocuments('Item', [eff]);
	}
	return;
}

//This is a temporary fix until a later pf2e system update. The function hooks on renderChatMessage attack-rolls
//If the thaumaturge makes an attack-roll, the target's weakness updates with the correct amount
//If it's not the thaumaturge that makes the attack-roll, it changes the weakness to 0
async function _socketUpdateEVEffect(a) {
	let updates;
	let tKey;
	let value;
	let origin;
	let rollOptionData;
	for (let act of canvas.tokens.placeables) {
		if (act.actor.uuid != a.uuid) {
			for (let effect of getActorEVEffect(act.actor, "*")) {
				if (effect?.rules[1]?.option.split(":")[2] != `Actor.${a}` && effect?.rules[1]?.option) {
					value = 0;
				} else if (effect?.rules[1]?.option){
					let acts = effect.rules[1].option.split(":")[2];
					origin = await fromUuid(acts);
					value = origin.getFlag("pf2e-thaum-vuln", "EVValue");
				}
				tKey = effect._id;
				rollOptionData = effect.rules[1]?.option;
				updates = {
					_id: tKey,
					system: {
						rules: [
							{
								key: "Weakness",
								type: "physical",
								value: value,
								predicate: [
									""
								]
							},
							{
								key: "RollOption",
								domain: "damage-roll",
								option: rollOptionData
							}
						]
					}
				};
				await act.actor.updateEmbeddedDocuments('Item', [updates]);
            }
		}
	}
}

//Deletes the effect from the actor passed to the method
async function _socketDeleteEVEffect(targ, actorID = undefined) {
	let eff;
	if (actorID === undefined) {
		for (let act of targ) {
			let a = await fromUuid(act);
			if (a.actor) {
				eff = getActorEVEffect(a.actor);
			} else { eff = getActorEVEffect(a); }
			eff.delete();
		}
	} else {
		for (let act of targ) {
			let a = await fromUuid(act);
			if (a.uuid != actorID) {
				if (a.actor) {
					eff = getActorEVEffect(a.actor, actorID);
				} else { eff = getActorEVEffect(a, actorID); }
			} else {
				eff = getActorEVEffect(a);
			}
			eff.delete();
		}
    }
}