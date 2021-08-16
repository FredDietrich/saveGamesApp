const axios = require('axios');
const cheerio = require('cheerio');
startScraping = async (url, fn) => {
    axios(url).then(response => {
        console.log(url)
        const page = response.data;
        const $ = cheerio.load(page);
        //console.log($('.image')['0'].children[0].attribs.src);
        //console.log(response.data)
        fn($('.image')['0'].children[0].attribs.src);
    }).catch(() => {
        fn(null);
    })
};
module.exports = startScraping;
