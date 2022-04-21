
/*
TODO:
- read csv
- format date

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
        console.log(this.from + "transfer" + String(this.amount) + "to" + this.to + "at" + String(this.date))
    }

    // for search function in bank
    searchResponse(name) {
        return (name == this.to || name == this.from)

    }
}


///////////////////////////////////////////////////////////////


class Bank {
    constructor() {
        this.fullTrans = []
    }

    // read csv -----------------------------------------------!
    readFile() {

    }

    // print everything
    printAll() {
        for (let i in fullTrans) {
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