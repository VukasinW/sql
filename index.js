require('custom-env').env();
const mysql = require('mysql');
const sha512 = require('js-sha512').sha512;

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'banking-system',
    password: process.env.SYS_DB_PASSWORD,
    database: 'clients'
});
  
connection.connect(err => {
    if(err) 
        throw err;
    console.log('Connected!');
    saveClinent('Vukasin', 'Vulovic', '0811040000', '08/11/2004', 'gamersuper461@gmail.com')
    .then(console.log, console.error);
});


/*
    saveClient:
        resolve:
            0 : client created successfully
        reject:
            1 : client already exists
            2 : client not created
            else : error
*/

async function sendSQL(sql) {
    return new Promise((resolve, reject) => {
        connection.query(sql, (err, results) => {
            if(err) 
                return reject(err);
            resolve(results);
        });  
    });
}

function saveClinent(fname, lname, jmbg, birth_date, email) {
    return new Promise((resolve, reject) => {
        if((fname || '').length <= 0 || (lname || '').length <= 0 || (jmbg || '').length <= 0 || (birth_date || '').length <= 0 || (email || '').length <= 0)
            return reject(1);
        const id = sha512(`${fname}${lname}${jmbg}${birth_date}`); //generate a unique security id
        
        checkExistance()
        .then(exists => {
            if(exists)
                return reject(1);
            createClient();
        }, reject);


        function checkExistance() {
            return new Promise((cb, e) => {
                sendSQL(`SELECT * FROM clients.list WHERE id = '${id}'`) //check if client with generated id exists
                .then(v => {
                    if((v || ['']).length !== 0)
                        return cb(true);
                    return cb(false); //create the client
                }, e);
            });
        }

        function createClient() {
            sendSQL(`INSERT INTO clients.list (id, fname, lname, email, balance) VALUES ("${id}", "${fname}", "${lname}", "${email}", 0)`)
            .then(() => { //^ set all the valuse into the table
                checkExistance()
                .then(exists => {
                    if(exists)
                        return resolve(0); //client created
                    return reject(2);
                }, reject);
            }, reject);
        }
    });
}