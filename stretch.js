/*
TODO: better way to catch invalid input
TODO: logging
TODO: avoid calling account.name directly?
TODO: date formatting
TODO: show available accounts in serviceTrans
*/

// ----------------------------- "import" -----------------------------------------

const csv = require('csv-parser');
var fs = require("fs")
var readlineSync = require('readline-sync');
const moment = require("moment");
const log4js = require("log4js")
const convert = require("xml-js");

// ------------------------- logging ------------------------------------

log4js.configure({
    appenders: {
        file: {type: 'fileSync', filename: 'logs/debug.log'}
    },
    categories: {
        default: {appenders: ['file'], level: 'debug'}
    }
});

const logger = log4js.getLogger('p2.js');
logger.info("Start")

// ------------------------ functions ------------------------------------

// importing from (csv, json, xml) file to list
function csv2list(fileName) {
    return new Promise((resolve, reject) => {
        let rowNum = 1
        let list = []
        fs.createReadStream(fileName)
            .pipe(csv())
            // .on('data') handling transactions.push(...)
            .on('data', (row) => {
                rowNum = rowNum + 1         // for logger
                if (String(moment(row.Date, "DD-MM-YYYY")) == "Invalid date") {
                    logger.error("Invalid date at row " + String(rowNum))
                } else if (String(Number(row.Amount)) == "NaN" || String(Number(row.Amount)) == "NaN") {
                    logger.error("Invalid number at row " + String(rowNum))
                } else {
                    let item = {
                        "Date": moment(row.Date, "DD-MM-YYY"),
                        "FromAccount": row.From,
                        "ToAccount": row.To,
                        "Narrative": row.Narrative,
                        "Amount": Number(row.Amount)
                    }
                    list.push(item)
                }


            })
            .on('end', () => {
                if (list) {
                    resolve(list)
                } else {
                    logger.error("No data was found in the .csv")
                    reject(Error("No data was found in the .csv"))
                }
            })
    })
}

function json2list(fileName) {
    return new Promise((resolve) => {
        let raw = fs.readFileSync(fileName)
        let data = JSON.parse(raw)
        resolve(data)
    })
}

function xml2list(fileName) {
    return new Promise((resolve) => {
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
        resolve(list)
    })

}

// importing from (csv, json, xml) file to list of names only
function csv2names(fileName) {
    return new Promise((resolve, reject) => {
        let names = [];
        fs.createReadStream(fileName)
            .pipe(csv())
            .on('data', (row) => {

                names.push(row.To, row.From)
            })

            .on('end', () => {
                let accountNames = Array.from(new Set(names))
                if (accountNames) {
                    resolve(accountNames)
                } else {
                    reject(Error("No data was found in the .csv"))
                }
            })
    })
}

function json2names(fileName) {
    return new Promise((resolve) => {
        let names = [];
        let raw = fs.readFileSync(fileName)
        let data = JSON.parse(raw)

        for (let i in data) {
            names.push(data[i]["FromAccount"], data[i]["ToAccount"])
        }
        let accountNames = Array.from(new Set(names))
        resolve(accountNames)
    })
}

function xml2names(fileName) {
    return new Promise((resolve) => {
        const xmlFile = fs.readFileSync(fileName, 'utf8');
        const jsonData = JSON.parse(convert.xml2json(xmlFile));
        let jsonDataList = jsonData["elements"][0]["elements"]

        let list = []

        for (let i in jsonDataList) {
            fromName = jsonDataList[i]["elements"][2]["elements"][0]["elements"][0]["text"]
            toName = jsonDataList[i]["elements"][2]["elements"][1]["elements"][0]["text"]
            list.push(fromName, toName)
        }

        nameList = Array.from(new Set(list))

        console.log("Turned to name list")
        resolve(nameList)
    })

}

// convert list to list of Transaction objects
function saveToTrans(list) {
    let transactions = []

    for (let i in list) {
        let trans = new Transaction(list[i]["FromAccount"],
            list[i]["ToAccount"],
            list[i]["Amount"],
            list[i]["Date"],
            list[i]["Narrative"])
        transactions.push(trans);
    }
    return transactions
}

// update account following given transactions
function updateWith(accountNames, fullTrans, showAccounts) {
    // create account
    let accounts = []
    for (let i in accountNames) {
        let acc = new Account(accountNames[i], 0)
        accounts.push(acc)
    }
    console.log("Accounts initialisation completed")
    console.log("We have " + String(accounts.length) + " accounts")

    // update account
    for (let i in fullTrans) {      // for each transaction
        if (i % 10 == 0) {
            console.log("Updated with transaction " + String(i))
        }

        let thisTran = fullTrans[i]

        for (let j in accounts) {       // search for the account OBJECT with corresponding .name
            let thisAcc = accounts[j]

            if (thisAcc.name == thisTran.from) {     // manipulate balance of the account OBJECT
                thisAcc.transferOut(thisTran.amount)
            }
            if (thisAcc.name == thisTran.to) {
                thisAcc.transferIn(thisTran.amount)
            }
        }

    }
    console.log("Account update completed")
    logger.info("Account update completed")

    // print accounts
    if (showAccounts) {
        for (let i in accounts) {
            accounts[i].print()
        }
    }

    return accounts
}

// ------------------------------- Account class -------------------------------------

class Account {
    constructor(name, balance) {
        this.name = name
        this.balance = balance
    }

    transferIn(amount) {
        this.balance = this.balance + amount
    }

    transferOut(amount) {
        this.balance = this.balance - amount
    }

    print() {
        console.log(this.name + " has " + parseFloat(this.balance).toFixed(2) + "\n")
    }


}

// ------------------------------- Transaction class ----------------------------------

class Transaction {
    constructor(from, to, amount, date, narrative) {
        this.from = from
        this.to = to
        this.amount = amount
        this.date = date
        this.narrative = narrative
    }

    print() {
        console.log(this.from + " transferred " + String(this.amount) + " to " + this.to + " on " + String(this.date) + "\n")
        return (this.from + " transferred " + String(this.amount) + " to " + this.to + " on " + String(this.date))
    }

    // for search function in bank class
    searchResponse(name) {
        return (name == this.to || name == this.from)
    }
}

// ------------------------------ Bank class -----------------------------------

class Bank {
    constructor() {
        this.fullTrans = []
        this.accountNames = []
        this.accounts = []
    }

    // choose between file type, calling corresponding functions from outside
    // return is Promise
    readNameOnly(fileName) {
        logger.info("Reading ONLY names from" + fileName)
        let extension = fileName.split(".")[1]
        if (extension == "csv") {
            return csv2names(fileName)
        } else if (extension == "json") {
            return json2names(fileName)
        } else if (extension == "xml") {
            return xml2names(fileName)
        }
    }

    readFile(fileName) {
        logger.info("Reading " + fileName)
        let extension = fileName.split(".")[1]
        if (extension == "csv") {
            return csv2list(fileName)
        } else if (extension == "json") {
            return json2list(fileName)
        } else if (extension = "xml") {
            return xml2list(fileName)
        }
    }

    printTrans(fileName) {
        logger.info("Printing all transactions")
        const runProgram = async () => {
            let list = await this.readFile(fileName);
            this.fullTrans = saveToTrans(list)

            for (let i in this.fullTrans) {
                this.fullTrans[i].print()
            }
        }
        runProgram();
    }

    // search for transactions with target name & print
    printTransResult(target, fileName) {
        const runProgram = async () => {
            let list = await this.readFile(fileName);
            this.fullTrans = saveToTrans(list)

            // search for corresponding trans, make it a separate function?
            let resultList = []
            for (let i in this.fullTrans) {
                let response = this.fullTrans[i].searchResponse(target)
                if (response) {
                    resultList.push(this.fullTrans[i])
                }
            }

            for (let i in resultList) {
                resultList[i].print()
            }
        }
        runProgram();
    }

    // create & update (& print) accounts according to file, which (has to) involves loading transactions
    updateAccounts(fileName, showAccounts) {
        logger.info("Updating accounts")
        if (showAccounts == undefined) {
            logger.error("showAccounts is not defined")
        }
        const runProgram = async () => {
            // get stuff from csv
            this.accountNames = await this.readNameOnly(fileName);
            let list = await this.readFile(fileName);
            this.fullTrans = saveToTrans(list)

            this.accounts = updateWith(this.accountNames, this.fullTrans, showAccounts)
        }
        runProgram();
    }

    // obtain and response to user input about transactions
    serviceTrans(fileName) {
        const command = readlineSync.question('List All (type all) / List Account (type name): \n')

        let targetName = command

        // TODO: verify if account name is in list - but need to be done in runProgram?
        if (targetName == "All" || targetName == "all") {
            this.printTrans(fileName)
        } else {
            // TODO: better search function, maybe (not relevant atm tho)
            this.printTransResult(targetName, fileName)
        }
    }

    // for viewing account
    // can make it only show specific account following user input like serviceTrans
    serviceAccount(fileName) {
        this.updateAccounts(fileName, true)
    }

    // export transaction lines to file
    exportTrans(fileName) {
        logger.info("Exporting all transactions to " + fileName.split(".")[0] + "_Transactions.txt")
        const runProgram = async () => {
            let list = await this.readFile(fileName);
            this.fullTrans = saveToTrans(list)

            let transactions = []
            for (let i in this.fullTrans) {
                transactions.push(this.fullTrans[i].print())
            }

            // write to txt
            var stream = fs.createWriteStream(fileName.split(".")[0] + "_Transactions.txt");
            stream.once('open', function (fd) {

                for (let i in transactions) {
                    stream.write(transactions[i] + "\n")
                }

                console.log("Exported")
                stream.end();
            });
        }
        runProgram();
    }
}

// ----------------------- Playground ---------------------------------------

// nowFile = "Transactions2014.csv"
// nowFile = "Transactions2013.json"
nowFile = "Transactions2012.xml"
let b = new Bank()
// b.updateAccounts(nowFile)
// b.printResult("Ben B", nowFile)
b.serviceTrans(nowFile)
// b.serviceAccount(nowFile, true)
// b.exportTrans(nowFile)
