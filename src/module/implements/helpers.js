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

export { checkImplements, checkFeatValidity };
