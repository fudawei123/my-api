const {MeiliSearch} = require("meilisearch");

const client = new MeiliSearch({
    host: "http://127.0.0.1:7700",
    apiKey: "masterKey",
});

const coursesIndex = client.index("courses")
coursesIndex.updateSearchableAttributes([
        'name',
    ]
)


const addDocuments = async (documents) => {
    return await coursesIndex.addDocuments(documents);
};

const deleteDocuments = (documentIds) => {
    return coursesIndex.deleteDocuments(documentIds);
};

const search = async (query) => {
    const search = await coursesIndex.search(query, {
        attributesToHighlight: ['name'],
        highlightPreTag: '<span style="color: red">',
        highlightPostTag: '</span>'
    });
    return search
};

module.exports = {addDocuments, deleteDocuments, search};
