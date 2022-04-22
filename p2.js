// ----------------------------- "import" -----------------------------------------


const csv = require('csv-parser');
var fs = require("fs")
const readlineSync = require("readline-sync");
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
        console.log(this.name + " has " + this.balance + "\n")
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
        console.log(this.from + " transfer " + String(this.amount) + " to " + this.to + " on " + String(this.date) + "\n")
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

    readAndParseFile(fileName) {
        return new Promise((resolve, reject) => {
            let transactions = [];
            fs.createReadStream(fileName)
                .pipe(csv())
                // .on('data') handling transactions.push(...)
                .on('data', (row) => {

                    let trans = new Transaction(row.From,
                        row.To,
                        Number(row.Amount),
                        moment(row.Date, "DD-MM-YYYY"),
                        row.Narrative)
                    transactions.push(trans);

                })
                .on('end', () => {
                    if (transactions) {
                        resolve(transactions)
                    } else {
                        reject(Error("No data was found in the .csv"))
                    }
                })
        })
    }

    // not really useful on its own
    readFile(fileName) {
        const runProgram = async () => {
            this.fullTrans = await this.readAndParseFile(fileName);
            // use the transactions
            console.log(this.accountNames[0])     // just testing
        }
        runProgram();
    }

    readNameOnly(fileName) {
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

    // print everything
    printAll(fileName) {
        logger.info("Printing all transactions")
        const runProgram = async () => {
            this.fullTrans = await this.readAndParseFile(fileName);

            // use the transactions
            for (let i in this.fullTrans) {
                this.fullTrans[i].print()
            }
        }
        runProgram();
        logger.info("Printed all transactions")
    }

    // search transaction with target name & print
    printResult(target, fileName) {
        const runProgram = async () => {
            this.fullTrans = await this.readAndParseFile(fileName);
            // use the transactions
            let resultList = []        // search for corresponding trans -- was originally a separate function, could be reused
            for (let i in this.fullTrans) {
                let response = this.fullTrans[i].searchResponse(target)
                if (response) {
                    resultList.push(this.fullTrans[i])
                }
// ---------------------------------------- how about returning values??? maybe just combine them for now
            }

            // ---------------- was supposed to be another function
            for (let i in resultList) {
                resultList[i].print()
            }
        }
        runProgram();
    }

    // create account
    createAccounts(fileName) {
        const runProgram = async () => {
            this.accountNames = await this.readNameOnly(fileName);

            for (let i in this.accountNames) {
                let acc = new Account(this.accountNames.name, 0)
                this.accounts.push(acc)
            }

            console.log("Accounts initialisation completed")
            console.log("We have " + String(this.accountNames.length) + " accounts")
        }
        runProgram();
    }

    // modify accounts according to csv !!!
    updateAccounts(fileName, show) {
        logger.info("Updating accounts")
        if (show == undefined) {
            logger.error("show is not defined")
        }
        const runProgram = async () => {
            // get stuff from csv
            this.accountNames = await this.readNameOnly(fileName);
            this.fullTrans = await this.readAndParseFile(fileName);         // both working!

            // create account
            for (let i in this.accountNames) {
                let acc = new Account(this.accountNames[i], 0)
                this.accounts.push(acc)
            }
            console.log("Accounts initialisation completed")
            console.log("We have " + String(this.accounts.length) + " accounts")

            // update account according to transaction
            for (let i in this.fullTrans) {      // for each transaction
                if (i % 10 == 0) {
                    console.log("Updated with transaction " + String(i))
                }

                let thisTran = this.fullTrans[i]

                for (let j in this.accounts) {       // search for the account OBJECT with corresponding .name
                    let thisAcc = this.accounts[j]

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

            if (show) {
                for (let i in this.accounts) {
                    this.accounts[i].print()
                }
                logger.info("Accounts shown")
            }
        }
        runProgram();
    }

    // obtain and response to user input
    serviceTrans(fileName) {

        var readlineSync = require('readline-sync');
        const command = readlineSync.question('List All / List Account: \n')

        // need to capture exception and return

        let targetName = command

        if (targetName == "All" || targetName == "all") {
            this.printAll(fileName)
        } else {
            this.printResult(targetName, fileName)
        }
    }

    // for viewing account
    serviceAccount(fileName) {
        this.updateAccounts(fileName, true)
    }
}

// ----------------------- Playground ---------------------------------------

// nowFile = "Transactions2014.csv"
nowFile = "DodgyTransactions2015.csv"
let b = new Bank()
// b.updateAccounts(nowFile)
b.printResult("Ben B", nowFile)
// b.printAll(nowFile)