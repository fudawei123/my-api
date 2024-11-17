const axios = require('axios');

const getImageMetadata = (url) => {
    return new Promise( async (resolve) => {
        const response = await axios({
            method: 'get',
            url: `${url}?x-oss-process=image/info`,
            responseType: 'stream'
        })
        let buffer = '';
        response.data.on('data', (chunk) => {
            buffer += chunk
        });

        response.data.on('end', () => {
            resolve(JSON.parse(buffer))
        });
    })
}

module.exports = getImageMetadata