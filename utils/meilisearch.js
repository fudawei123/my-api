const {MeiliSearch} = require("meilisearch");

const client = new MeiliSearch({
    host: "http://127.0.0.1:7700",
    apiKey: "a0wjQECD6E2FBv_FJ0oBeYhKSfpzlb7rmLfb7SBvW_k",
});

const coursesIndex = client.index("courses");
(async () => {
    await coursesIndex.updateSearchableAttributes(["name"]);
})();

const addDocuments = (documents) => {
    documents = documents.map((item) => {
        return {
            id: item.id,
            name: item.name,
        };
    });
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

module.exports = {addDocuments, deleteDocuments, search};
