function parseHTML(string) {
  const regex = /@UUID\[[\w.-]+\]\{[\w'\s]+\}/g;
  var m;
  let newHTML = string;
  while ((m = regex.exec(string)) != null) {
    const uuid = m[0].split("[")[1].split("]")[0];
    const text = m[0].split("{")[1].split("}")[0];
    const parsedUuid = foundry.utils.parseUuid(uuid);
    const subst = `<a class="content-link" draggable="true" data-uuid="${uuid}" data-id="${parsedUuid.documentId}" data-type="${parsedUuid.collection.metadata.type}" data-pack="${parsedUuid.collection.metadata.id}">${text}</a>`;
    newHTML = newHTML.replace(m, subst);
  }
  return newHTML;
}

export { parseHTML };
