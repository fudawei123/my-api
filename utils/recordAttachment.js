const {Attachment} = require("../models");
const recordAttachment = async (files) => {
    files = Array.isArray(files) ? files : [files];
    const attachments = await Attachment.bulkCreate(files)
    return attachments
}

module.exports = recordAttachment