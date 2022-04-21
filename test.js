import { parse } from 'csv-parse';

const records = [];
// Initialize the parser
const parser = parse({
    delimiter: ','
});
// Use the readable stream api to consume records
parser.on('Transactions2014.csv', function(){
    let record;
    while ((record = parser.read()) !== null) {
        records.push(record);
    }
});





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

