const axios = require('axios');
const cheerio = require('cheerio');
startScraping = async (url, fn) => {
    axios(url).then(response => {
        const page = response.data;
        const $ = cheerio.load(page);
        fn($('.image')['0'].children[0].attribs.src);
    }).catch(() => {
        fn(null);
    })
};
module.exports = startScraping;
