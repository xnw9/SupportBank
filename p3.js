/*
TODO: better method to catch invalid input

*/

function saveToTrans(list) {
    // convert to Transaction objects
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

function csv2list(fileName) {
    return new Promise((resolve, reject) => {
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
                } else if (String(Number(row.Amount)) == "NaN" || String(Number(row.Amount)) == "NaN") {
                    logger.error("Invalid number at row " + String(rowNum))
                } else {
                    item = {
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

function csv2name(fileName) {
    return new Promise((resolve, reject) => {
        let accountNames = [];
        fs.createReadStream(fileName)
            .pipe(csv())
            .on('data', (row) => {

                if (!accountNames.includes(row.From)) {
                    accountNames.push(row.From)
                }
                if (!accountNames.includes(row.To)) {
                    accountNames.push(row.To)
                }
            })
            .on('end', () => {
                if (accountNames) {
                    resolve(accountNames)
                } else {
                    reject(Error("No data was found in the .csv"))
                }
            })
    })
}

function json2name(fileName) {
    return new Promise((resolve) => {
        let accountNames = [];
        let raw = fs.readFileSync(fileName)
        let data = JSON.parse(raw)

        // there must be a better way to deal with this - set? -------------------
        for (let i in data) {
            if (!accountNames.includes(data[i]["FromAccount"])) {
                accountNames.push(data[i]["FromAccount"])
            }
            if (!accountNames.includes(data[i]["ToAccount"])) {
                accountNames.push(data[i]["ToAccount"])
            }
        }
        resolve(accountNames)
    })
}

function updateWith(accountNames, fullTrans, showAccounts) {
    // create account
    let accounts = []
    for (let i in accountNames) {
        let acc = new Account(accountNames[i], 0)
        accounts.push(acc)
    }
    console.log("Accounts initialisation completed")
    console.log("We have " + String(accounts.length) + " accounts")

    // update account according to transaction
    for (let i in fullTrans) {      // for each transaction
        if (i % 10 == 0) {
            console.log("Updated with transaction " + String(i))
        }

        let thisTran = fullTrans[i]

        for (let j in accounts) {       // search for the account OBJECT with corresponding .name
            let thisAcc = accounts[j]

            if (thisAcc.name == thisTran.from) {     // name=transfer from, deduct amount from balance
                thisAcc.transferOut(thisTran.amount)
            }
            if (thisAcc.name == thisTran.to) {
                thisAcc.transferIn(thisTran.amount)
            }
        }

    }
    console.log("Account update completed")
    logger.info("Account update completed")

    if (showAccounts) {
        for (let i in accounts) {
            accounts[i].print()
        }
        logger.info("Accounts shown")
    }

    return accounts
}

// ----------------------------- "import" -----------------------------------------


const csv = require('csv-parser');
var fs = require("fs")
var readlineSync = require('readline-sync');
const moment = require("moment");

const log4js = require("log4js")
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
logger.log('START', "Starting")
logger.trace()      // can be used to track down error?

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

    // link with trans! methods for showing name & balance to be used in trans?!?!?

}

// ------------------------------- Transaction class ----------------------------------

class Transaction {
    constructor(from, to, amount, date, narrative) {
        this.from = from
        this.to = to
        this.amount = amount
        this.date = date     // requires further tempting?
        this.narrative = narrative
    }

    // print
    print() {
        console.log(this.from + " transferred " + String(this.amount) + " to " + this.to + " on " + String(this.date) + "\n")
    }

    // for search function in bank
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

    // choose between file type, calling corresponding outside functions
    // returning Promises
    readNameOnly(fileName) {
        logger.info("Reading ONLY names from" + fileName)
        let extension = fileName.split(".")[1]
        if (extension == "csv") {
            return csv2name(fileName)
        } else if (extension == "json") {
            return json2name(fileName)
        }
    }

    readFile(fileName) {
        logger.info("Reading " + fileName)
        let extension = fileName.split(".")[1]
        if (extension == "csv") {
            return csv2list(fileName)
        } else if (extension == "json") {
            return json2list(fileName)
        }
    }

    // print transactions
    printTrans(fileName) {
        logger.info("Printing all transactions")
        const runProgram = async () => {
            let list = await this.readFile(fileName);
            this.fullTrans = saveToTrans(list)

            // use the transactions
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
            // use the transactions
            let resultList = []        // search for corresponding trans -- was originally a separate function, could be reused
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

    // obtain and response to user input
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
    serviceAccount(fileName) {
        this.updateAccounts(fileName, true)
    }
}

// ----------------------- Playground ---------------------------------------

// nowFile = "Transactions2014.csv"
nowFile = "Transactions2013.json"
let b = new Bank()
// b.updateAccounts(nowFile)
// b.printResult("Ben B", nowFile)
// b.serviceTrans(nowFile)
b.serviceAccount(nowFile, true)