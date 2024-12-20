const { MeiliSearch } = require("meilisearch");

const client = new MeiliSearch({
  host: "http://127.0.0.1:7700",
  apiKey: "235095ae-f542-4dda-9b9a-5294cbcd1027",
});

const coursesIndex = client.index("courses");
(async () => {
  await coursesIndex.updateSearchableAttributes(["name"]);
})();

const addDocuments = (documents) => {
  return coursesIndex.addDocuments(documents);
};

const deleteDocuments = (documentIds) => {
  return coursesIndex.deleteDocuments(documentIds);
};

const search = async (query) => {
  const search = await coursesIndex.search(query, {
    attributesToHighlight: ["name"],
    highlightPreTag: '<span style="color: red">',
    highlightPostTag: "</span>",
  });
  return search.hits;
};

module.exports = { addDocuments, deleteDocuments, search };
