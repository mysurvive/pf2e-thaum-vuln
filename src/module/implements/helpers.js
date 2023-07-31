async function createImpEffect(imps) {
  for (const imp of imps) {
    if (imp.uuid) {
      const targImp = await fromUuid(imp.uuid);
      const updates = {
        _id: targImp._id,
        "system.rules": [
          {
            key: "RollOption",
            domain: "all",
            option: `implement:${imp.counter.toLowerCase()}:held`,
            slug: `implement-held`,
          },
        ],
      };
      await targImp.update(updates);
    }
  }
}

async function deleteImpEffect(imps) {
  for (const imp of imps) {
    if (imp?.uuid) {
      const impl = await fromUuid(imp.uuid);
      let implObj = impl.toObject();
      for (const i of implObj.system.rules.keys()) {
        if (implObj.system.rules[i].slug.includes("implement")) {
          implObj.system.rules.splice(i, 1);
        }
      }
      await impl.update({
        _id: impl._id,
        "system.rules": implObj.system.rules,
      });
    }
  }
}

async function checkImplements(a) {
  const selectedImplements = a.getFlag("pf2e-thaum-vuln", "selectedImplements");
  let newImplements = selectedImplements;
  let updateFlag = false;
  for (const imp in selectedImplements) {
    if (!a.items.some((i) => i?.uuid === selectedImplements[imp]?.uuid)) {
      newImplements[imp] = null;
      updateFlag = true;
    }
  }
  if (updateFlag) {
    a.setFlag("pf2e-thaum-vuln", "selectedImplements", newImplements);
  }
}

function checkFeatValidity(a) {
  const firstImplementFeat = a.items.find(
    (i) => i.slug === "first-implement-and-esoterica"
  );
  if (!firstImplementFeat) {
    console.error(
      "[PF2E Exploit Vulnerability] No first implement feat found. Downlevel to 0 and back up to your expected level, allowing the system to handle the feat automation."
    );
    return false;
  }
  if (firstImplementFeat?.rules != undefined) {
    if (!firstImplementFeat.rules[1]?.grantedId) {
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

export { createImpEffect, deleteImpEffect, checkImplements, checkFeatValidity };
