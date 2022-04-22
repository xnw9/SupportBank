function readJSON(fileName) {
    const fs = require("fs")
    let raw = fs.readFileSync(fileName)
    let data = JSON.parse(raw)
    console.log(data[0])
    return data[0]
}
a = readJSON('Transactions2013.json')
console.log(a["Date"])


readJSON('Transactions2013.json')

function importFile(fileName) {
    // justify what type of file it is by looking at its extension
    splited = fileName.split(".")
    extension = splited[1]
    if (extension=="csv") {
        // evoke csv reading
        console.log("csv")
    } else if (extension=="json") {
        // evoke json reading
        console.log("json")
    } else {
        console.log("Only support .csv or .json!")
    }
}

importFile('Transactions2013.json')


/////////////////////////////////////////////////////////////

