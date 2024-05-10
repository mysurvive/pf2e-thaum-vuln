const EXPLOIT_VULNERABILITY_ACTION_ID =
  "Compendium.pf2e.actionspf2e.Item.fodJ3zuwQsYnBbtk";
const MORTAL_WEAKNESS_EFFECT_UUID =
  "Compendium.pf2e-thaum-vuln.thaumaturge-effects.Item.N0jy0FFGS7ViTvs9";
const PERSONAL_ANTITHESIS_EFFECT_UUID =
  "Compendium.pf2e-thaum-vuln.thaumaturge-effects.Item.EGY7Rxcxwv1aEyHL";
const OFF_GUARD_EFFECT_UUID =
  "Compendium.pf2e-thaum-vuln.thaumaturge-effects.Item.Xuwb7a6jCWkFS0lI";
const MORTAL_WEAKNESS_TARGET_UUID =
  "Compendium.pf2e-thaum-vuln.thaumaturge-effects.Item.q2TMJ31MwLNJV1jA";
const PERSONAL_ANTITHESIS_TARGET_UUID =
  "Compendium.pf2e-thaum-vuln.thaumaturge-effects.Item.dNpf1EDKJ6fgNL42";
const BREACHED_DEFENSES_SOURCEID =
  "Compendium.pf2e.feats-srd.Item.5EzJVhiHQvr3v72n";
const BREACHED_DEFENSES_EFFECT_UUID =
  "Compendium.pf2e-thaum-vuln.thaumaturge-effects.Item.FMw5IpJdA6eOgtv1";
const BREACHED_DEFENSES_TARGET_UUID =
  "Compendium.pf2e-thaum-vuln.thaumaturge-effects.Item.E38yjK1tdr579dJy";
const DIVERSE_LORE_SOURCEID = "Compendium.pf2e.feats-srd.Item.KlqKpeq5OmTRxVHb";
const ESOTERIC_WARDEN_EFFECT_UUID =
  "Compendium.pf2e-thaum-vuln.thaumaturge-effects.Item.fufcXy1CEMvxmgWt";
const CURSED_EFFIGY_UUID =
  "Compendium.pf2e-thaum-vuln.thaumaturge-effects.Item.s0NI9gKZygLUunOg";
const PRIMARY_TARGET_EFFECT_UUID =
  "Compendium.pf2e-thaum-vuln.thaumaturge-effects.Item.E0X9AYLqXSaiO9A3";
const AMULETS_ABEYANCE_EFFECT_UUID =
  "Compendium.pf2e-thaum-vuln.thaumaturge-effects.Item.FWdzwEJBJjq18Zep";
const AMULETS_ABEYANCE_LINGERING_EFFECT_UUID =
  "Compendium.pf2e-thaum-vuln.thaumaturge-effects.Item.zo2vRmRcEWLNwPIN";
const INTENSIFY_VULNERABILITY_AMULET_EFFECT_UUID =
  "Compendium.pf2e-thaum-vuln.thaumaturge-effects.Item.icPIf1hOBOVmWtL1";
const TOME_IMPLEMENT_BENEFIT_EFFECT_UUID =
  "Compendium.pf2e-thaum-vuln.thaumaturge-effects.Item.lDKArhqx0hBtwVRQ";
const INTENSIFY_VULNERABILITY_TOME_EFFECT_UUID =
  "Compendium.pf2e-thaum-vuln.thaumaturge-effects.Item.d0gHXzfsHj6OpV54";
const INTENSIFY_VULNERABILITY_LANTERN_EFFECT_UUID =
  "Compendium.pf2e-thaum-vuln.thaumaturge-effects.Item.atECc1SuDgUqNakg";
const TOME_ADEPT_RK_EFFECT_UUID =
  "Compendium.pf2e-thaum-vuln.thaumaturge-effects.Item.kg1CwmxZfKx7xWF3";
const AMULET_FEAT_SOURCEID =
  "Compendium.pf2e.classfeatures.Item.PoclGJ7BCEyIuqJe";
const INTENSIFY_VULNERABILITY_REGALIA_EFFECT_UUID =
  "Compendium.pf2e-thaum-vuln.thaumaturge-effects.Item.qHe8lT8ROOKwFNkg";
const REGALIA_AURA_INITIATE_EFFECT_UUID =
  "Compendium.pf2e-thaum-vuln.thaumaturge-effects.Item.W0hOUNf7dJHmJ63j";
const REGALIA_AURA_ADEPT_EFFECT_UUID =
  "Compendium.pf2e-thaum-vuln.thaumaturge-effects.Item.lr1UVbxaToPGdSvw";
const REGALIA_AURA_PARAGON_EFFECT_UUID =
  "Compendium.pf2e-thaum-vuln.thaumaturge-effects.Item.rrxQvikt1U3qe4Jx";
const INTENSIFY_VULNERABILITY_WEAPON_EFFECT_UUID =
  "Compendium.pf2e-thaum-vuln.thaumaturge-effects.Item.9tc7D61ZL6yzXYZ2";

const SupportedActions = [
  "exploit-vulnerability",
  "share-weakness",
  "cursed-effigy",
  "twin-weakness",
];

const TargetEffectSourceIDs = new Array(
  MORTAL_WEAKNESS_TARGET_UUID,
  PERSONAL_ANTITHESIS_TARGET_UUID,
  BREACHED_DEFENSES_TARGET_UUID,
  CURSED_EFFIGY_UUID
);

export {
  SupportedActions,
  EXPLOIT_VULNERABILITY_ACTION_ID,
  MORTAL_WEAKNESS_EFFECT_UUID,
  PERSONAL_ANTITHESIS_EFFECT_UUID,
  OFF_GUARD_EFFECT_UUID,
  MORTAL_WEAKNESS_TARGET_UUID,
  PERSONAL_ANTITHESIS_TARGET_UUID,
  BREACHED_DEFENSES_EFFECT_UUID,
  BREACHED_DEFENSES_SOURCEID,
  BREACHED_DEFENSES_TARGET_UUID,
  DIVERSE_LORE_SOURCEID,
  ESOTERIC_WARDEN_EFFECT_UUID,
  CURSED_EFFIGY_UUID,
  TargetEffectSourceIDs,
  PRIMARY_TARGET_EFFECT_UUID,
  AMULETS_ABEYANCE_EFFECT_UUID,
  AMULETS_ABEYANCE_LINGERING_EFFECT_UUID,
  INTENSIFY_VULNERABILITY_AMULET_EFFECT_UUID,
  TOME_IMPLEMENT_BENEFIT_EFFECT_UUID,
  INTENSIFY_VULNERABILITY_TOME_EFFECT_UUID,
  INTENSIFY_VULNERABILITY_LANTERN_EFFECT_UUID,
  TOME_ADEPT_RK_EFFECT_UUID,
  AMULET_FEAT_SOURCEID,
  INTENSIFY_VULNERABILITY_REGALIA_EFFECT_UUID,
  REGALIA_AURA_INITIATE_EFFECT_UUID,
  REGALIA_AURA_ADEPT_EFFECT_UUID,
  REGALIA_AURA_PARAGON_EFFECT_UUID,
  INTENSIFY_VULNERABILITY_WEAPON_EFFECT_UUID,
};
