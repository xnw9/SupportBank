
// class of account
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

    showBalance() {
        return this.balance
    }
}

class Transaction {
    constructor(from, to, amount, date) {
        this.from = from
        this.to = to
        this.amount = amount
        this.date = date
    }

    print() {
        \\ print or return
    }
}
let a = new Account("a", 0)
console.log(a.name)

a.transferIn(100)
a.transferOut(50)
console.log(a.balance)

b = a.showBalance()
console.log(b)

// methods:
// in / out
// "transfer from sb to sb", evoke 2 basic methods


function transaction(acc_from, acc_to, amount) {
    acc_from.transferOut(amount)
    acc_to.transferIn(amount)
    console.log("Completed transfer from" + acc_from.name + "to" + acc_to.name)
}

function service() {
    var command = readlineSync.question('List All / List Account')

    // need to capture exception and return

    let name = command.slice(5)

    if (name=="All") {
        // print all

    } else {
        // search for account with that name

    }

}

var readlineSync = require('readline-sync');
var userName = readlineSync.question('May I have your name? ');