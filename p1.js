
/*
TODO:
- read csv data into Transaction objects
- format date?

*/

// moment("12/25/1995", "MM-DD-YYYY");



// class for transaction
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
        console.log("print")
        console.log(this.from + "transfer" + String(this.amount) + "to" + this.to + "at" + String(this.date))
    }

    // for search function in bank
    searchResponse(name) {
        return (name == this.to || name == this.from)

    }
}


///////////////////////////////////////////////////////////////
const csv = require('csv-parser');
var fs = require("fs")



/////////////////////////////////////////////////


class Bank {
    constructor() {
        this.fullTrans = []
    }

    readAndParseFile(fileName) {
        let result = []
        return new Promise((resolve,reject)=> {
            let transactions = [];
            fs.createReadStream(fileName)
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

    // read csv -----------------------------------------------!
    readFile(fileName) {

        const runProgram = async () => {
            const transactions = await this.readAndParseFile(fileName);
            // use the transactions
            // console.log(transactions)

            // create trans objects and save into lists so no need to read again eaaaaaaaa
            for (let i in transactions) {
                let trans = new Transaction(transactions[i]["from"],
                    transactions[i]["to"],
                    transactions[i]["amount"],
                    transactions[i]["date"],
                    transactions[i]["narrative"])
                this.fullTrans.push(trans)
            }
        }

        runProgram();
    }

    // print everything
    printAll() {
        for (let i in this.fullTrans) {
            this.fullTrans[i].print()
        }
    }

    // search transaction with target name
    search(target) {
        let resultList = []
        for (let i in this.fullTrans) {
            let response = this.fullTrans[i].searchResponse(target)
            if (response) {
                resultList.push(this.fullTrans[i])
            }

        }
        return resultList
    }

    // print transactions for target name
    printResult(resultList) {
        for (let i in resultList) {
            resultList[i].print()
        }
    }

    // obtain and response to user input
    service() {
        const command = readlineSync.question('List All / List Account')

        // need to capture exception and return

        let targetName = command.slice(5)

        if (name=="All") {
            this.printAll()
        } else {
            let resultList = this.search(targetName)     // search for account with that name
            this.printResult(resultList)     // print out results
        }
    }
}

let b = new Bank()
b.readFile("Transactions2014.csv")
console.log(b.fullTrans)     // still not logging, need to ask ---------------------
r = b.search("Jon A")
console.log(r)


