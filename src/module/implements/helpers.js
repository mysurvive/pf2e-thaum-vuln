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

export { createImpEffect, deleteImpEffect };
