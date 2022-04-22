/*
TODO:
- better fileName parameter


PS:
- moment("12/25/1995", "MM-DD-YYYY");

*/

// ----------------------------- "import" -----------------------------------------

const csv = require('csv-parser');
var fs = require("fs")
const readlineSync = require("readline-sync");

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

    printBalance() {
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
                        row.Amount,
                        row.Date,
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

            for (let i in this.accountNames.length) {
                let acc = new Account(this.accountNames.name, 0)
                this.accounts.push(acc)
            }

            console.log("Accounts initialisation completed")
            console.log("We have " + String(this.accountNames.length) + " accounts")
        }
        runProgram();
    }

    // find the account with the name
    // can't really work with runProgram, need to integrate with another function that requires this function


    // modify accounts according to csv !!!
    updateAccounts(fileName) {
        const runProgram = async () => {
            // get stuff
            this.accountNames = await this.readNameOnly(fileName);
            this.fullTrans = await this.readAndParseFile(fileName);         // both working!

            console.log(this.accountNames.length)
            console.log(this.fullTrans.length)

            // create account
            // why can't enter this for loop???
            for (let i in this.accountNames.length) {
                console.log(i)
                let acc = new Account(this.accountNames[i], 0)
                this.accounts.push(acc)
            }
            console.log("Accounts initialisation completed")
            console.log("We have " + String(this.accounts.length) + " accounts")

            // update account according to transaction
            for (let i in this.fullTrans.length) {      // for each transaction
                console.log("Updated transaction " + String(i))
                let thisTran = this.fullTrans[i]

                for (let j in this.accounts.length) {       // search for the account OBJECT with corresponding .name
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

nowFile = "Transactions2014.csv"
let b = new Bank()
// b.readFile(nowFile)
// b.printAll(nowFile)
// console.log(b.fullTrans)     // which is empty
// b.printResult("Jon A", nowFile)     // which is now working

b.updateAccounts(nowFile)