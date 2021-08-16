const fs = require('fs');
const readline = require('readline');
async function processLineByLine(fn) {
    var games = [];
    const fileStream = fs.createReadStream('games.txt');
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    for await (const line of rl) {
    games.push(line);
    }
  fn(games);
}
module.exports = processLineByLine;