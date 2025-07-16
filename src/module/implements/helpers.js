// Insure pf2e-thaum-vuln.selectedImplements is valid by removing non-existent
// items and insuring each implement has a object in the flag, with null uuid if
// an item isn't selected yet.  This is where the implements are determined by
// looking at the class features on the actor.
async function checkImplements(actor, { clear = false } = {}) {
  const impsFlag = actor.getFlag("pf2e-thaum-vuln", "selectedImplements");

  // List all implements (item uuids are null here)
  const imps = Object.fromEntries(
    actor.itemTypes.feat
      .filter((f) =>
        f.system.traits.otherTags.includes("thaumaturge-implement")
      )
      .map((imp) => [imp.slug, { uuid: null }])
  );
  // Delete old choices not used, inject existing uuids, clear dangling UUIDs
  for (const [slug, { uuid }] of Object.entries(impsFlag)) {
    if (slug in imps) {
      if (!clear && uuid !== undefined)
        imps[slug].uuid = fromUuidSync(uuid) ? uuid : null;
    } else imps[`-=${slug}`] = null;
  }

  if (!foundry.utils.objectsEqual(imps, impsFlag)) {
    if (clear) {
      await actor.unsetFlag("pf2e-thaum-vuln", "selectedImplements");
    }
    await actor.setFlag("pf2e-thaum-vuln", "selectedImplements", imps);
  }
}

function checkFeatValidity(a) {
  const firstImplementFeat = a.items.find(
    (i) =>
      i.slug === "first-implement-and-esoterica" ||
      i.slug === "thaumaturge-dedication"
  );
  if (!firstImplementFeat) {
    console.error(
      "[PF2E Exploit Vulnerability] No first implement feat found. Downlevel to 0 and back up to your expected level, allowing the system to handle the feat automation."
    );
    return false;
  }
  if (firstImplementFeat?.rules != undefined) {
    if (
      !firstImplementFeat.rules.find(
        (r) => r.key === "GrantItem" && r.grantedId != undefined
      )
    ) {
      console.error(
        "[PF2E Exploit Vulnerability] No grantedId found for implement feat. Downlevel to 0 and back up to your expected level, allowing the system to handle the feat automation."
      );
      return false;
    }
  } else {
    console.error(
      "[PF2E Exploit Vulnerability] No rules found for first implement feat. Downlevel to 0 and back up to your expected level, allowing the system to handle the feat automation."
    );
    return false;
  }
  return true;
}

// Returns implement data for named implement, or undefined if that implement isn't
// present.
function getImplement(actor, implement) {
  return actor.attributes.implements?.[implement];
}

export { checkImplements, checkFeatValidity, getImplement };
