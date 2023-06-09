async function createImpEffect(imps, a) {
  for (const imp of imps) {
    console.log(imp.name);
    //const targImp = await fromUuid(imp.uuid);
    //targImp.createEmbeddedDocuments();
  }
}

export { createImpEffect };
