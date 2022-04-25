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
/*const csv = require('csv-parser');
var fs = require("fs")

function readAndParseFile() {
    let result = []
    return new Promise((resolve, reject) => {
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
    })
}

let trans = []

const runProgram = async () => {
    const transactions = await readAndParseFile();
    // use the transactions
    console.log(transactions)
    trans.push(transactions[0])
    // create trans objects and save into lists so no need to read again eaaaaaaaa
}

runProgram();
console.log(trans)*/

// b = a.then(function(result) {
//     console.log(result[0])
// })
//
// console.log(b)

// let a = [1,2,3]
// for (let i in a) {
//     console.log(a[i])
// }

// var fs = require("fs")
// // change to promise version!!
// function json2list(fileName) {
//     return new Promise((resolve) => {
//         let raw = fs.readFileSync(fileName)
//         let data = JSON.parse(raw)
//         resolve(data)
//     })
// }
//
// const runProgram = async () => {
//     let r = await json2list("Transactions2013.json")
//     console.log(r)
// }
// runProgram();

// const { XMLParser, XMLBuilder, XMLValidator} = require("fast-xml-parser");
//
// const parser = new XMLParser();
// let jObj = parser.parse("Transactions2012.xml");
//
// const builder = new XMLBuilder();
// const xmlContent = builder.build(jObj);

fileName = "Transactions2012.xml"

// function readxml(fileName) {
//     return new Promise((resolve, reject) => {
//         let jObj = parser.parse("Transactions2012.xml");
//
//         const builder = new XMLBuilder();
//         const xmlContent = builder.build(jObj);
//
//         resolve(xmlContent)
//     })
// }
//
// const runProgram = async () => {
//     let list = await readxml(fileName);
//     console.log(".")
//     console.log(list)
// }
// runProgram();


const convert = require('xml-js');
const fs = require('fs');
const moment = require("moment");

// read file
const xmlFile = fs.readFileSync(fileName, 'utf8');

// parse xml file as a json object
const jsonData = JSON.parse(convert.xml2json(xmlFile));
console.log(jsonData["elements"][0]["elements"][0])
// narrative
console.log(jsonData["elements"][0]["elements"][0]["elements"][0]["elements"][0]["text"])
// amount
console.log(jsonData["elements"][0]["elements"][0]["elements"][1]["elements"][0]["text"])
// from
console.log(jsonData["elements"][0]["elements"][0]["elements"][2]["elements"][0]["elements"][0]["text"])
// to
console.log(jsonData["elements"][0]["elements"][0]["elements"][2]["elements"][1]["elements"][0]["text"])
// date
console.log(jsonData["elements"][0]["elements"][0]["attributes"]["Date"])

function xml2list(fileName) {
    const xmlFile = fs.readFileSync(fileName, 'utf8');
    const jsonData = JSON.parse(convert.xml2json(xmlFile));
    let jsonDataList = jsonData["elements"][0]["elements"]

    let list = []

    for (let i in jsonDataList) {

        let item = {
            // TODO: date format
            "Date": jsonDataList[i]["attributes"]["Date"],
            "FromAccount": jsonDataList[i]["elements"][2]["elements"][0]["elements"][0]["text"],
            "ToAccount": jsonDataList[i]["elements"][2]["elements"][1]["elements"][0]["text"],
            "Narrative": jsonDataList[i]["elements"][0]["elements"][0]["text"],
            "Amount": Number(jsonDataList[i]["elements"][1]["elements"][0]["text"])
        }

        list.push(item)
    }
    console.log("Turned to list")
    return list
}

function xml2names(fileName) {
    const xmlFile = fs.readFileSync(fileName, 'utf8');
    const jsonData = JSON.parse(convert.xml2json(xmlFile));
    let jsonDataList = jsonData["elements"][0]["elements"]

    let list = []

    for (let i in jsonDataList) {
        fromName = jsonDataList[i]["elements"][2]["elements"][0]["elements"][0]["text"]
        toName = jsonDataList[i]["elements"][2]["elements"][1]["elements"][0]["text"]
        list.push(fromName, toName)
    }

    nameList = new Set(list)

    console.log("Turned to name list")
    return nameList
}

n = xml2names(fileName)
console.log(n)