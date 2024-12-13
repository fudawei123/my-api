const { MeiliSearch } = require("meilisearch");

const client = new MeiliSearch({
  host: "http://127.0.0.1:7700",
  apiKey: "masterKey",
});

const coursesIndex = client.index("courses");

const addDocuments = async (documents) => {
  documents = documents.map((document) => {
    return {
      id: document.id,
      name: document.name,
      content: document.content,
    };
  });
  return await coursesIndex.addDocuments(documents);
};

const deleteDocuments = (documentIds) => {
  return coursesIndex.deleteDocuments(documentIds);
};

const search = async (query) => {
  // client.index('movies').search('winter feast', {
  //   attributesToHighlight: ['overview'],
  //   highlightPreTag: '<span class="highlight">',
  //   highlightPostTag: '</span>'
  // })
  const search = await coursesIndex.search(query);
  return search.hits.map((hit) => hit.id);
};

module.exports = { addDocuments, deleteDocuments, search };
