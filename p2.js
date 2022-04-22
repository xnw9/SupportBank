// ----------------------------- "import" -----------------------------------------

const csv = require('csv-parser');
var fs = require("fs")
const readlineSync = require("readline-sync");
const log4js = require("log4js")

// ------------------------- logging ------------------------------------

log4js.configure({
    appenders: {
        file: { type: 'fileSync', filename: 'logs/debug.log' }
    },
    categories: {
        default: { appenders: ['file'], level: 'debug'}
    }
});


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
    }

    readAndParseFile(fileName) {
        let result = []
        return new Promise((resolve, reject) => {
            let transactions = [];
            fs.createReadStream(fileName)
                .pipe(csv())
                // .on('data') handling transactions.push(...)
                .on('data', (row) => {

                    let trans = new Transaction(row.From,
                        row.To,
                        row.Amount,
                        row.Date,
                        row.Narrative)
                    transactions.push(trans)

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
            console.log(this.fullTrans[0])     // just testing
        }
        runProgram();
    }

    // print everything
    printAll(fileName) {
        const runProgram = async () => {
            this.fullTrans = await this.readAndParseFile(fileName);

            // use the transactions
            for (let i in this.fullTrans) {
                this.fullTrans[i].print()
            }
        }
        runProgram();

    }

    // search transaction with target name & print
    printResult(target, fileName) {
        const runProgram = async () => {
            this.fullTrans = await this.readAndParseFile(fileName);
            // use the transactions
            let resultList = []
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

    // obtain and response to user input
    service(fileName) {

        var readlineSync = require('readline-sync');
        const command = readlineSync.question('List All / List Account: \n')

        // need to capture exception and return

        let targetName = command.slice(5)

        if (targetName == "All" || targetName == "all") {
            this.printAll(fileName)
        } else {
            this.printResult(targetName, fileName)
        }
    }
}

// ----------------------- Playground ---------------------------------------

// nowFile = "Transactions2014.csv"
nowFile = "DodgyTransactions2015.csv"
let b = new Bank()
// b.readFile(nowFile)
// b.printAll(nowFile)
// console.log(b.fullTrans)     // which is empty
// b.printResult("Jon A", nowFile)     // which is is working
b.service(nowFile)