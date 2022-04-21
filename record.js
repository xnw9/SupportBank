var readlineSync = require('readline-sync');

// Wait for user's response.
var userName = readlineSync.question('May I have your name? ');

//////////////////////////////////////////////////
import assert from 'assert';
import { parse } from 'csv-parse';

const records = [];
// Initialize the parser
const parser = parse({
    delimiter: ':'
});
// Use the readable stream api to consume records
parser.on('readable', function(){
    let record;
    while ((record = parser.read()) !== null) {
        records.push(record);
    }
});
// Catch any error
parser.on('error', function(err){
    console.error(err.message);
});

// Write data to the stream
parser.write("root:x:0:0:root:/root:/bin/bash\n");
parser.write("someone:x:1022:1022::/home/someone:/bin/bash\n");
// Close the readable stream
parser.end();

/////////////////////////////////////////////////


// after npm i -s csv-parser
const csv = require('csv-parser');
const fs = require('fs');

transs = []

fs.createReadStream('Transactions2014.csv')
    .pipe(csv())
    .on('data', (row) => {
        let trans = {
            date: row.Date,
            from: row.From,
            to: row.To,
            narrative: row.Narrative,
            amount: row.Amount
        }
        transs.push(trans)
    })
    .on('end', () => {
        console.log('CSV file successfully processed');
        console.log(transs[0]["date"])     // has been pushed correctly
    });

console.log(transs)


///////////////////////////////////////////

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