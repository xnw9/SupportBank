
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

