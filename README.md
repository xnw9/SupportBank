# SupportBank
JS Bootcamp Ex.2 SupportBank


### p1 reading csv

Use a class for each type of object you want to create

- [x] creates account for each person

- [x] creates transactions between the accounts
    - The person in the 'From' column is paying money, so the amount needs to be deducted from their account
    - The person in the 'To' column is being paid, so the amount needs to be added to their account
    
Your program should support two commands, which can be typed in on the console:

  - [x] List All should output the names of each person, and the total amount they owe, or are owed.
  - [x] List [Account] should print a list of every transaction, with the date and narrative, for that account with that name.

> Hint
> 
> - [x] accept user input - the readline-sync package
> 
> - [x] JavaScript Date class is extremely bothersome to use; parse your date strings using the moment package instead: install it with npm install moment and see [this](https://momentjs.com/docs/#/parsing/string-format/) link for documentation on how to parse dates.
>
> - [x] parse the file yourself, or search NPM for a relevant CSV parsing library


    
### p2 logging and exception handling

- [x] Now add logging to your program
- [x] Get to a point where you could work out what went wrong by reading your log files - ***can I really work out what's wrong without knowing how the file is like?***
- [x] tells the user which line of the CSV caused the problem
- [ ] Discuss with your trainers and work out what to do in this situation


### p3 JSON

- [x] Modify your program to accept JSON files in addition to CSV files (`JSON.parse()`)
- [x] adding a new command: `Import File` which reads the file from disk. You'll need different behaviour for CSV and JSON files

***Try to keep your modules small and focused, and make their function obvious based on their name. Try not to have common functionality repeated across two or more modules!***

### p4 XML
Read XML file with npm packages

### stretch goal
`Export file`: write transactions out

