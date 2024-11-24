const getImageMetaData = require("./getImageMetadata");
const {Attachment} = require("../models");
const recordAttachment = async (file) => {
    const metadata = await getImageMetaData(file.url);
    const attachment = await Attachment.create({
        ...file,
        metadata: metadata
    });
    return attachment
}

module.exports = recordAttachment