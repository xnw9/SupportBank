
// after npm i -s csv-parser
const csv = require('csv-parser');
const fs = require('fs');

transactions = []

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
        transactions.push(trans)
    })
    .on('end', () => {
        console.log('CSV file successfully processed');
        console.log(transactions[0]["date"])     // has been pushed correctly
    });

console.log(transactions)    // even though written after csv-reading section, it happens before that
                            // thus the empty list?

/*

let datas = []

fs.readFile("Transactions2014.csv", "utf-8", (err, data) => {
    if (err) console.log(err);
    else {
        // console.log(data)
        datas.push(data)
    }

});
console.log(datas)
*/

