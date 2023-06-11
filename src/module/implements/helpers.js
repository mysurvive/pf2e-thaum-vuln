async function createImpEffect(imps, key) {
  const targImp = await fromUuid(imps[key].uuid);
  const updates = {
    _id: targImp._id,
    "system.rules": [
      {
        key: "RollOption",
        domain: "all",
        option: "implement",
        slug: "implement",
      },
    ],
  };
  targImp.update(updates);
}

async function deleteImpEffect(imps) {
  for (const imp of imps) {
    if (imp?.uuid) {
      const impl = await fromUuid(imp.uuid);
      let implObj = impl.toObject();
      for (const i of implObj.system.rules.keys()) {
        if (implObj.system.rules[i].slug.includes("implement") && i > -1) {
          implObj.system.rules.splice(i, 1);
        }
      }
      impl.update({ _id: impl._id, "system.rules": implObj.system.rules });
    }
  }
}

function parseHTML(string) {
  const regex = /@UUID\[[\w.]+\]\{[\w' ]+\}/g;
  var m;
  let newHTML = string;
  while ((m = regex.exec(string)) != null) {
    const uuid = m[0].split("[")[1].split("]")[0];
    const text = m[0].split("{")[1].split("}")[0];
    const parsedUuid = _parseUuid(uuid);
    const subst = `<a class="content-link" draggable="true" data-uuid="${uuid}" data-id="${parsedUuid.documentId}" data-type="${parsedUuid.collection.metadata.type}" data-pack="${parsedUuid.collection.metadata.id}" data-tooltip="Action Item" data-args=""><i class="fa-solid fa-person-running"></i>${text}</a>`;
    newHTML = newHTML.replace(m, subst);
  }
  return newHTML;
}

export { createImpEffect, parseHTML, deleteImpEffect };
