const implementData = {
  Amulet: {
    name: "PF2E.SpecificRule.Thaumaturge.Implement.Amulet",
    flavor:
      "Amulets are items carried for good luck and protection. Your amulet might be a magical diagram, a religious symbol, a preserved body part such as a rabbit's foot, or a lucky coin. Amulet implements are associated with the harrow suit of shields and the astrological signs of the bridge and the ogre.",
    benefits: {
      initiate:
        "The protective aspects of your amulet can shield you and your allies from harm. You gain the @UUID[Compendium.pf2e.actionspf2e.Or6RLXeoZkN8CLdi]{Amulet's Abeyance} reaction.",
      adept:
        "Your amulet offers continued protection. When you use Amulet's Abeyance, you or your ally chooses one type of damage dealt by the triggering attack and gains resistance 5 against that damage type until the start of your next turn. At 15th level, this lingering resistance increases from 5 to 10.",
      paragon:
        "Your amulet provides sanctuary even against wide-scale attacks. When you use Amulet's Abeyance, you target yourself and all allies within 15 feet. Each target gains both the initial resistance against the triggering damage and the lingering resistance from your amulet's adept benefit; the allies gain the lingering resistance even if they would not have taken Archive any of the initial triggering damage. If the foe's attack deals multiple damage types, each target can separately choose the damage type to gain lingering resistance against.",
    },
    intensify:
      "Your amulet repels the creature's attempts to harm you. You gain a +2 status bonus to AC and saves against the target of your Exploit Vulnerability.",
  },
  Bell: {
    name: "PF2E.SpecificRule.Thaumaturge.Implement.Bell",
    flavor:
      "Bells symbolize the power that sounds and emotions hold over others, soothing with one tone and startling with another. Bells, drums, finger cymbals, and other percussion instruments are most typical, but these implements can be any type of portable musical instrument that is played with one hand. Bell implements are associated with the astrological signs of the daughter and the blossom.",
    benefits: {
      initiate:
        "You can use your bell implement to create three different kinds of music, each of which weakens a foe in a different way. You gain the @UUID[Compendium.pf2e.actionspf2e.ublVm5gmCIm3eRdQ]{Ring Bell} activity.",
      adept:
        "Your bell resonates powerfully, causing the effect to last longer. The conditions from Ring Bell last 3 rounds instead of 1 round.",
      paragon:
        "With your mastery of your bell, you can affect many foes with ease. All the condition values from Ring Bell increase to 2 (or 3 on a critical failure). Ring Bell can trigger off the Strike or spell of any enemy, not just the target of your Exploit Vulnerability; however, in that case, the condition lasts only until the start of your next turn.",
    },
    intensify:
      "Your reinforced bell can reach into the most basal part of the target's mind, priming it to be vulnerable to the bell's effects. When you successfully Strike the target of your Exploit Vulnerability, your bell implement plays a haunting tone and the creature takes a -2 status penalty on saves against your Ring Bell for 1 round, or a -3 status penalty on a critical hit. This effect has the auditory, emotion, and mental traits.",
  },
  Chalice: {
    name: "PF2E.SpecificRule.Thaumaturge.Implement.Chalice",
    flavor:
      "Chalice implements are vessels that fill with liquid, associating them with healing, nourishment, and life. Your chalice might be a traditional cup or goblet, but it could also be a small amphora, a polished gourd, or even a hollowed-out skull. Chalice implements are associated with the astrological signs of the mother and the newlyweds, as well as the sea dragon.",
    benefits: {
      initiate:
        "While holding your chalice, you can drink from it or feed its liquid to an ally to improve their health. You gain the @UUID[Compendium.pf2e.actionspf2e.D91jQs0wleU5ml4K]{Drink from the Chalice} action.",
      adept:
        "The life essence shed from blood empowers your chalice. If you or an ally within 30 feet takes piercing or slashing damage from a foe's critical hit or takes persistent bleed damage, Drinking from the Chalice before the end of your next turn grants that injured creature greater restoration to make up for its lost vitality. On a sip, the temporary Hit Points granted to the creature increase to 2 + your Charisma modifier + your level. When drained, the chalice heals the creature [[/r (5*@actor.level)[Healing]]]{5 Hit Points for each level} you have.",
      paragon:
        "When you or an ally drain the chalice, the overwhelming vitality it's collected helps you overcome many ailments. Reduce the drinker's @UUID[Compendium.pf2e.conditionitems.i3OJZU2nk64Df3xm]{Clumsy}, @UUID[Compendium.pf2e.conditionitems.MIRkyAjyBeXivMa7]{Enfeebled}, @UUID[Compendium.pf2e.conditionitems.TBSHQspnbcqxsmjL]{Frightened}, @UUID[Compendium.pf2e.conditionitems.e1XGnhKNSQIm5IXg]{Stupefied}, and @UUID[Compendium.pf2e.conditionitems.dfCMdR4wnpbYNTix]{Stunned} values by 1. (This reduces the stunned condition only if it has a condition value, not when it has a duration.) The drinker also reduces its @UUID[Compendium.pf2e.conditionitems.4D2KBtexWXa6oUMR]{Drained} value by 1, but it can reduce its drained condition by Drinking from the Chalice only once per day. In addition, the chalice attempts to counteract all poisons, diseases, and curses afflicting the drinker, using half your level rounded up as the counteract level and your class DC - 10 as the counteract modifier. If the chalice fails to counteract a given affliction for a drinker, it can't attempt to counteract that affliction again until midnight.",
    },
    intensify:
      "Your reinforced chalice can collect a creature's life force to become empowered. If you succeed at a Strike against the target of your Exploit Vulnerability, you increase the effect if someone Drinks from the Chalice before the end of that turn. Add an additional half your level to the temporary HP if the drinker sips, or add your level to the HP regained if the drinker drains the chalice. This effect isn't cumulative if you hit with more than one Strike.",
  },
  Lantern: {
    name: "PF2E.SpecificRule.Thaumaturge.Implement.Lantern",
    flavor:
      "Lantern implements shine the light of revelation to part shadows and expose truth. You might use a common glass lantern, torch, paper lantern, or other similar light source. Lantern implements are associated with the harrow suit of stars and the astrological signs of the lantern bearer and the archer.",
    benefits: {
      initiate:
        "While you hold your lantern, its burning light leaves secrets no place to hide. You can light or extinguish your lantern as a free action once each turn with nothing but a thought, which has the concentrate trait. The lantern shines bright light out to 20 feet and dim light out 20 feet further; this has the evocation, light, and magical traits (the counteract level against magical darkness is equal to half your level rounded up). The lantern's magical light attempts to reveal the unseen. You and your allies in the lantern's area of bright light gain a +1 status bonus to visual Perception checks to notice anything that is also within the bright light, and a +1 status bonus to checks to Recall Knowledge against creatures within the bright light, as the light exposes their true natures. During exploration, even if you aren't Searching, the GM rolls a secret check for you to find traps, environmental hazards, haunts, and secrets (such as secret doors). The GM rolls each time a given hazard or secret comes within 20 feet of you and within the lantern's bright light. These effects have the divination, magical, and revelation traits.",
      adept:
        "In addition to the initiate benefits, when you hold your lantern, its light reveals the @UUID[Compendium.pf2e.conditionitems.zJxUflt9np0q4yML]{Invisible} and the ethereal. The bright light increases to 30 feet, with dim light out 30 feet further. While you're holding your lantern, invisible and ethereal creatures within the bright light become visible as rippling distortions, though they're still @UUID[Compendium.pf2e.conditionitems.DmAIPqOBomZ7H95W]{Concealed}. This doesn't give you any special ability to affect a creature on the Ethereal Plane, but it ensures you're aware of the creatures' presence.",
      paragon:
        "In addition to the other benefits, your lantern reveals all things as they truly are. The bright light increases to 40 feet, with dim light out 40 feet further. While you're holding your lantern, the GM rolls a secret counteract check against any illusion or transmutation that comes within the lantern's bright light, but only for the purpose of determining whether you and others can see through it (for instance, if the check succeeds against a polymorph spell, you can see the creature's true form, but you don't end the spell). Use half your level rounded up as the counteract level and your class DC - 10 as the counteract modifier. On a failed counteract check, the lantern can't attempt to counteract that illusion or polymorph effect again until midnight. You can choose to leave any illusion or transmutation you discover intact, instead of counteracting it.",
    },
    intensify:
      "Your lantern's light flares and burns bright, leaving no shadows in which secrets and enemies can hide. Against the target of your Exploit Vulnerability, the status bonuses from the lantern's initiate benefit increase to +2. The creature takes a -2 status penalty to Deception checks and Stealth checks as long as it's within the lantern's light. The creature can't be @UUID[Compendium.pf2e.conditionitems.DmAIPqOBomZ7H95W]{Concealed} while it's in the lantern's light, though it still can potentially become @UUID[Compendium.pf2e.conditionitems.iU0fEDdBp3rXpTMC]{Hidden} or undetected using cover or means other than the concealed condition.",
  },
  Mirror: {
    name: "PF2E.SpecificRule.Thaumaturge.Implement.Mirror",
    flavor:
      "Mirror implements represent misdirection, illusion, and sleight of hand, bending and shifting a perspective and the way you look at things. While larger mirrors hold the same mystic connotations, thaumaturges always choose small, portable, handheld mirrors as implements so they can use them easily while adventuring. Mirror implements are associated with the harrow suit of keys, and the astrological signs of the stranger and the swallow.",
    benefits: {
      initiate:
        "You learn how to use your mirror to project another version of yourself whose realness is a matter of perspective. You gain the @UUID[Compendium.pf2e.actionspf2e.Mh4Vdg6gu8g8RAjh]{Mirror's Reflection} action.",
      adept:
        "Your mirror self shatters into punishing shards when damaged. While Mirror's Reflection is in effect, when an enemy adjacent to one of your spaces damages you, that version of you explodes into mirror shards. This ends Mirror's Reflection (establishing the remaining version of you as the real one) and deals slashing damage to all creatures in a @Template[type:emanation|distance:5] around where your mirror self was. The damage is equal to 2 + half your level or the damage of the triggering attack, whichever is lower. You're immune to this damage.",
      paragon:
        "You've become so skilled at reflecting yourself that you can combine making a reflection with your other movements to act right away. When you use Mirror's Reflection, you can have one of your selves immediately @UUID[Compendium.pf2e.actionspf2e.pvQ5rY2zrtPI614F]{Interact}, @UUID[Compendium.pf2e.actionspf2e.BlAOM2X92SI6HMtJ]{Seek}, or @UUID[Compendium.pf2e.actionspf2e.VjxZFuUXrCU94MWR]{Strike}.",
    },
    intensify:
      "Reinforcing your mirror lets it play tricks on your enemy's senses as it bends light this way or that. You become @UUID[Compendium.pf2e.conditionitems.DmAIPqOBomZ7H95W]{Concealed} to the target of your Exploit Vulnerability as your mirror warps its perceptions. As normal for concealment where your overall location is still obvious, you can't use this concealment to @UUID[Compendium.pf2e.actionspf2e.XMcnh4cSI32tljXa]{Hide} or @UUID[Compendium.pf2e.actionspf2e.VMozDqMMuK5kpoX4]{Sneak}.",
  },
  Regalia: {
    name: "PF2E.SpecificRule.Thaumaturge.Implement.Regalia",
    flavor:
      "Regalia implements represent rulership, leadership, and social connections. While they differ in shape depending on regional customs and markers used to signify authority, common regalia implements are scepters, jeweled orbs, and heraldic banners. Regalia implements are associated with the harrow suit of crowns and the astrological signs of the patriarch and the sovereign dragon.",
    benefits: {
      initiate:
        "While you hold your regalia, you gain an air of authority and bolster the courage of allies who believe in you. Your regalia aids you when you attempt to convince others. You gain a +1 circumstance bonus to Deception, Diplomacy, and Intimidation checks. Allies who can see you can use Follow the Expert to follow you even if you're only trained in a skill and not an expert, due to the competence you clearly exude. When they do, the circumstance bonus they gain from Following the Expert is +1. When you are holding your regalia, you gain an inspiring aura that stokes the courage of you and all allies in a @Template[type:emanation|distance:15] who can see you, granting them a +1 status bonus to saving throws against fear. At the end of your turn, at the same time you would reduce your frightened value by 1, you reduce the frightened value of all allies within your inspiring aura by 1. Your aura has the emotion, mental, and visual traits.",
      adept:
        "Your regalia's power increases, and so do the abilities it grants. The circumstance bonus you gain to Deception, Diplomacy, and Intimidation increases to +2, as long as you have master proficiency in each skill. When others use Follow the Expert to follow you, you grant them a +2 circumstance bonus if you are trained, +3 if you have expert proficiency, or +4 if you have master or legendary proficiency. The courage your aura instills grows stronger. The +1 status bonus now applies to all saving throws against mental effects, rather than only against fear, and you and allies in your aura gain a +2 status bonus to damage rolls. At 11th level, this increases to a +3 status bonus to damage rolls, and at 17th level, this increases to a +4 status bonus to damage rolls.",
      paragon:
        "Your regalia grants you the true gravitas of rulership, tying together the hearts and minds of your allies and making it impossible for you to leave a bad impression. If you roll a critical failure on a check to @UUID[Compendium.pf2e.actionspf2e.tHCqgwjtQtzNqVvd]{Coerce}, Make an Impression, or Request, you get a failure instead. When others use Follow the Expert to follow you, you grant them a +3 circumstance bonus if you are trained or +4 if you are an expert or above.\nAllies in your inspiring aura aren't @UUID[Compendium.pf2e.conditionitems.AJh5ex99aV6VTggg]{Flat-Footed} from being flanked unless you too are flanked. If one of your allies in the aura is clumsy, enfeebled, frightened, sickened, or stupefied, the status penalty your ally takes from the condition is 1 lower than the condition's value as long as the ally remains in the aura, unless you too are affected by the same condition.",
    },
    intensify:
      "Your regalia implement makes you seem more confident and inspiring with each success. Whenever you successfully Strike the target of your Exploit Vulnerability, choose an ally that you can see. That ally gains a +1 circumstance bonus to its attack rolls against the creature until the beginning of your next turn. If the attack roll was a critical hit, the circumstance bonus increases to +2.",
  },
  Tome: {
    name: "PF2E.SpecificRule.Thaumaturge.Implement.Tome",
    flavor:
      "Tome implements embody lost knowledge and otherworldly insights. While a weathered book is most common, tome implements can have as many different form factors as there are ways to store knowledge, from carved clay tablets to bundles of knotted cords. Tome implements are associated with the harrow suit of books and the astrological signs of the stargazer and the underworld dragon.",
    benefits: {
      initiate:
        "While you hold your tome, lines of text appear on the open pages, revealing useful information. While you hold your tome, you gain a +1 circumstance bonus to all skill checks to Recall Knowledge.\nDuring your daily preparations, you can gain the trained proficiency rank in two skills of your choice until you prepare again. You retain the benefit as long as the tome is on your person, even if you aren't holding it. At 3rd level, you're an expert in one of the skills and trained in the other, and at 5th level, you're an expert in both skills. Since these proficiencies are temporary, you can't use them as a prerequisite for a skill increase or a permanent character option like a feat.",
      adept:
        "In addition to the initiate benefits, your tome inscribes insights into creatures that you can use to strike them down. While holding your tome, at the start of your turn each round, attempt a check to Recall Knowledge about a creature of your choice that you're observing. If this check succeeds, you gain a +1 circumstance bonus to your next attack roll against that creature before the start of your next turn.\nWhen you gain temporary skill proficiencies during your daily preparations, one is at expert proficiency and the other at master proficiency. At 9th level, you have master proficiency in both.",
      paragon:
        "In addition to the other benefits, your tome's information alerts you to ambushes and attacks from your foes. While holding your tome, you can always roll a skill check for initiative against creatures or haunts using Esoteric Lore. If you do, you gain a +3 circumstance bonus to your initiative roll.\nThe initiate benefit's circumstance bonus to Recall Archive Knowledge from holding your tome increases from +1 to +2. When you succeed at the Recall Knowledge check granted by the tome's adept benefit, the bonus applies to all attack rolls you make before the start of your next turn, not just your next one. Lastly, when you gain temporary skill proficiencies, both are legendary.",
    },
    intensify:
      "Your tome's power not only reads a creature's present but even records its future actions. When you use Intensify Vulnerability, roll a d20 and set the result aside. At any time until the start of your next turn, you can use the d20 result you set aside for an attack roll to Strike the target of your Exploit Vulnerability, instead of rolling a new d20; this is a fortune effect.",
  },
  Wand: {
    name: "PF2E.SpecificRule.Thaumaturge.Implement.Wand",
    flavor:
      "Wand implements are short, lightweight batons, usually made of wood but often incorporating other materials. Due to their association with spellcasters, wand implements are connected to magic and its practice, as well as the direction and manipulation of energy. Wand implements are associated with the astrological signs of the thrush and the sky dragon.",
    benefits: {
      initiate:
        "Your wand slowly collects ambient magic, which you can project at a foe in a barely controlled display of charged energy. When you gain this implement, choose whether your wand is attuned to cold, electricity, or fire. You gain the @UUID[Compendium.pf2e.actionspf2e.04VQuQih77pxX06q]{Fling Magic} activity.",
      adept:
        "You gain versatility and additional benefits when you fire your wand. The range of Fling Magic increases to 120 feet. Choose a second damage type from the list; whenever you Fling Magic, you can select between either of the two damage types you have chosen. Fling Magic has an additional effect if the target fails its save and takes damage, depending on the type.\n<ul><li>Cold: The target becomes chilled, taking a -10-foot status penalty to its Speeds for 1 round.</li><li>Electricity: The target is shocked, becoming @UUID[Compendium.pf2e.conditionitems.AJh5ex99aV6VTggg]{Flat-Footed} until the end of your next turn.<li>Fire: The target catches flame, taking [[/r 1d10[persistent,fire]]] (or [[/r 2d10[persistent,fire]]] on a critical failure). If you have the wand paragon benefit, this increases to [[/r 2d10[persistent,fire]]] (or [[/r 4d10[persistent,fire]]] on a critical failure).</li></ul>",
      paragon:
        "Your mastery of your wand grants you increased versatility, range, and area. The range of Fling Magic increases to 180 feet. You gain the ability to choose between all three damage types (cold, electricity, and fire) each time you use Fling Magic. When you Fling Magic, you can choose to target a single creature or to affect all creatures in a @Template[type:burst|distance:20].",
    },
    intensify:
      "Your empowered wand surges with ever-more-powerful magic. When you Fling Magic to damage the target of your Exploit Vulnerability, you deal additional damage to the creature equal to 1 + the number of damage dice.",
  },
  Weapon: {
    name: "PF2E.SpecificRule.Thaumaturge.Implement.Weapon",
    flavor:
      "Weapon implements are the most direct and confrontational, representing battle, struggle, and potentially violence. You can choose only a one-handed weapon as an implement, which allows you to channel energies into your weapon as well as hold your other implements once you gain them. Weapon implements are associated with the harrow suit of hammers and the astrological signs of the rider and the swordswoman.",
    benefits: {
      initiate:
        "Your weapon trembles slightly in your hand, seeking out your foe's weakness to it and interrupting their actions. You gain the @UUID[Compendium.pf2e.actionspf2e.dnaPJfA0CDLNrWcW]{Implement's Interruption} reaction.\nAt 5th level, when you gain thaumaturgic weapon expertise, your instinctive knowledge of your weapon implement also grants you the weapon's critical specialization effect.",
      adept:
        "When your implement lashes out at your foe, even a close miss brings the weapon close enough to do harm. When you use Implement's Interruption and fail (but don't critically fail) the Strike, you deal 1 damage of the weapon's normal type, possibly applying any bonus damage due to the target's weakness.",
      paragon:
        "The way your implement connects to your foe makes its interruptions incredibly disruptive. You now disrupt the triggering action on a hit with Implement's Interruption, rather than needing a critical hit.",
    },
    intensify:
      "Your weapon is drawn to your enemy's vital spots, almost of its own accord. You gain a +2 status bonus to attack rolls against the target of your Exploit Vulnerability.",
  },
};

export { implementData };
