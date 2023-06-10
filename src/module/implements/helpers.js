async function createImpEffect(imps, a) {
  for (const imp of imps) {
    console.log(imp.name);
    //const targImp = await fromUuid(imp.uuid);
    //targImp.createEmbeddedDocuments();
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

export { createImpEffect, parseHTML };
