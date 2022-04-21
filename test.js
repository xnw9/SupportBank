
// testing for reading csv......


/*
Instead of (1) following .end or (3) wrapping as mentioned in Slack
1. try to parse it yourself
2. try csv-parse
*/

/*
// 11111111111111111
// missing documents part...

function readCsv(csvFile) {
    var csvLines = csvFile.split(/\r\n|\n/)
    var headers = csvFile[0].split(",")
    var output = []

    for (let i=1; i<csvLines.length; i++) {
        var lines = csvLines[i].split(",")

        var data = []
        for (let j=0; j<headers.length; j++) {
            data.push(headers[j]+":"+lines[j])
        }
        output.push(data)
    }
    console.log("Finished")
    return output

*/
/*
// 22222222222222222222222222222
var fs = require("fs")
// var parse = require("csv-parse")     // this one is not working?!
const { parse } = require('csv-parse')
var parser = parse({columns: true}, function (err, records) {
    console.log(records[0])
    let output = []
    for (let i=1; i<records.length; i++) {
        var line = records[i]
        console.log(line["Date"])
        output.push(line)
    }
})
fs.createReadStream("Transactions2014.csv").pipe(parser)
*/

/*

// 3333333333333333333333333333
// sync API
var fs = require("fs").promises
const { parse } = require("csv-parse/sync");     // the ; !!!
(async function() {
    const fileContent = await fs.readFile("Transactions2014.csv");
    const records = parse(fileContent, {columns: true});
    console.log(records)     // still not working?!?
}) ()

records
*/

// 4444444444444444444444444444444444
const csv = require('csv-parser');
var fs = require("fs")

function readAndParseFile() {
    let result = []
    return new Promise((resolve,reject)=> {
        let transactions = [];
        fs.createReadStream('Transactions2014.csv')
            .pipe(csv())
            // .on('data') handling transactions.push(...)

            .on('data', (row) => {
                let trans = {
                    date: row.Date,
                    from: row.From,
                    to: row.To,
                    narrative: row.Narrative,
                    amount: row.Amount
                }
                result.push(trans)
            })
            .on('end', () => {
                if (result) {
                    resolve(result)
                } else {
                    reject(Error("No data was found in the .csv"))
                }
            })
    })}

const runProgram = async () => {
    const transactions = await readAndParseFile();
    // use the transactions
    // console.log(transactions)
    transs = []
    // create trans objects and save into lists so no need to read again eaaaaaaaa
}

runProgram();



// b = a.then(function(result) {
//     console.log(result[0])
// })
//
// console.log(b)
