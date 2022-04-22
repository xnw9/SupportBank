const moment = require("moment");
const csv = require("csv-parser");

function readJSON(fileName) {
    const fs = require("fs")
    let raw = fs.readFileSync(fileName)
    let data = JSON.parse(raw)
    console.log(data[0])
    // turn into objects etc...
}
a = readJSON('Transactions2013.json')
console.log(a["Date"])


//////////////// draft structure //////////////////////////

readJSON('Transactions2013.json')

function importFile(fileName) {
    // justify what type of file it is by looking at its extension
    splited = fileName.split(".")
    extension = splited[1]
    if (extension=="csv") {
        // evoke csv reading
        console.log("csv")
    } else if (extension=="json") {
        // evoke json reading
        console.log("json")
    } else {
        console.log("Only support .csv or .json!")
    }
}

importFile('Transactions2013.json')


/////////////////////////////////////////////////////////////

// the common part between reading json and csv: convert data to trans objects / account objects!
// just transactions for now
function saveToTrans(list) {
    // convert to Transaction objects
        let transactions = []

        for (let i in list) {
            let trans = new Transaction(list[i]["From"],
                list[i]["To"],
                list[i]["Amount"],
                list[i]["Date"],
                list[i]["Narrative"])
            transactions.push(trans);
        }
        return transactions
}

function csv2list(fileName) {
    return new Promise((resolve, reject) => {
        logger.info("Start reading transactions from " + fileName)

        let rowNum = 1
        list = []
        fs.createReadStream(fileName)
            .pipe(csv())
            // .on('data') handling transactions.push(...)
            .on('data', (row) => {
                rowNum = rowNum + 1         // for logger
                if (String(moment(row.Date, "DD-MM-YYYY")) == "Invalid date") {
                    logger.error("Invalid date at row " + String(rowNum))
                    // continue to next row? ----------------------------------------------
                }
                // a better way to write/ --------------------------------------------------
                if (String(Number(row.Amount)) == "NaN" || String(Number(row.Amount)) == "NaN") {
                    logger.error("Invalid number at row " + String(rowNum))
                }

                list.push(row)

            })
            .on('end', () => {
                if (list) {
                    resolve(list)
                } else {
                    reject(Error("No data was found in the .csv"))
                }
            })
    })

    const runProgram = async () => {
        fullList = await this.readAndParseFile(fileName);
        // use the lists
        console.log(this.accountNames[0])     // just testing

        // use the transactions
        transactions = saveToTrans(fullList)
    }
    runProgram();
}