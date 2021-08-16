/*const axios = require('axios');
const cheerio = require('cheerio');

startScraping = async (url) => {
    axios(url).then(response => {
        const page = response.data;
        const $ = cheerio.load(page);
        //console.log();
        //.children[2].children[0].children[0].children[0].text
        fs.appendFile('tt.html', $('.mw-category-group'), function (err) {
            if (err) throw err;
            console.log('Saved!');
          }); 
    }).catch(e => {console.log(e)})
};
startScraping('https://www.pcgamingwiki.com/w/index.php?title=Category:Games&pagefrom=The+IOTA+Project#mw-pages')
*/
const fs = require('fs');

const readline = require('readline');
var games = [];
async function processLineByLine() {
  const fileStream = fs.createReadStream('games.txt');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });
  // Note: we use the crlfDelay option to recognize all instances of CR LF
  // ('\r\n') in input.txt as a single line break.

  for await (const line of rl) {
    // Each line in input.txt will be successively available here as `line`.
    games.push(line);
  }
  console.log(games.length)
}

processLineByLine();

