const express = require('express');
const mysql = require('mysql');

// Create connection
const db_config = {
    host     : 'us-cdbr-east-03.cleardb.com',
    user     : 'bc53dac014cb20',
    password : '73ace8d8',
    database : 'heroku_1128e12ec2383cd'
};

var db;

function handleDisconnection() {
    // var connection = mysql.createConnection(mysql_config);
    db = mysql.createConnection(db_config);
    db.connect(function(err) {
        if(err) {
            console.log('error when connecting to db:', err);
            setTimeout('handleDisconnection()', 2000);
        }
        console.log('Database connected ...');
    });
 
     db.on('error', function(err) {
        console.log('db error', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnection();
        } else {
            throw err;
        }
    });
}
handleDisconnection();

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: false}));

app.get('/', (req, res) => {
    res.render('pages/index');
});

// // Create DB
// app.get('/createdb', (req, res) => {
//     let sql = `DROP DATABASE IF EXISTS chatbot;`;
//     db.query(sql, (err, result) => {
//         if(err) throw err;
//     });
//     sql = `CREATE DATABASE chatbot;`;
//     db.query(sql, (err, result) => {
//         if(err) throw err;
//         res.send("Database created ...");
//     });
// });

// // Create table
// app.get('/createtable', (req, res) => {
//     let sql = 'DROP TABLE IF EXISTS task;';
//     db.query(sql, (err, result) => {
//         if(err) throw err;
//     });
//     sql = 'CREATE TABLE task (id INTEGER AUTO_INCREMENT PRIMARY KEY, tanggal DATE, matkul VARCHAR(255), tugas VARCHAR(255), topik VARCHAR(255));';
//     db.query(sql, (err, result) => {
//         if(err) throw err;
//     });
//     sql = "DROP TABLE IF EXISTS keyword;"
//     db.query(sql, (err, result) => {
//         if(err) throw err;
//     });
//     sql = 'CREATE TABLE keyword (id INTEGER AUTO_INCREMENT PRIMARY KEY, kata VARCHAR(255) UNIQUE NOT NULL);';
//     db.query(sql, (err, result) => {
//         if(err) throw err;
//     });
//     sql = 'INSERT INTO keyword (kata) VALUES ("tubes"), ("tucil"), ("ujian"), ("kuis"), ("praktikum");';
//     db.query(sql, (err, result) => {
//         if(err) throw err;
//         res.send("Table created ...");
//     });
// });

// Insert task
app.post('/insert', (req, res) => {
    let sql = `SELECT id FROM task WHERE tanggal = "${req.body.tanggal}" and matkul = "${req.body.matkul}" and tugas = "${req.body.tugas}" and topik = "${req.body.topik}";`;
    db.query(sql, (err, result) => {
        if(err) throw err;
        console.log(result);
        if(result.length != 0){
            res.send(false);
        }
        else{
            sql = `INSERT INTO task (tanggal, matkul, tugas, topik) VALUES ('${req.body.tanggal}','${req.body.matkul}','${req.body.tugas}','${req.body.topik}')`;
            db.query(sql, (err, result) => {
            if(err) throw err;
                console.log("INSERT SUCCESS");
            });
            sql = `SELECT id FROM task WHERE tanggal = "${req.body.tanggal}" and matkul = "${req.body.matkul}" and tugas = "${req.body.tugas}" and topik = "${req.body.topik}"`;
            db.query(sql, (err, result) => {
            if(err) throw err;
                res.send(result[0].id.toString());
            });
        }
    });
});

// Search task by ID
app.post('/search', (req, res) => {
    let sql = `SELECT * FROM task WHERE id = ${req.body.id};`;
    db.query(sql, (err, result) => {
        if(err) throw err;
        if(result.length == 0){
            res.send("false");
        }
        else{
            res.send(result);
        }
    });
});

// Update task by ID to tanggal
app.post('/update', (req, res) => {
    var tanggaltemp = new Date(req.body.tanggal);
    tanggaltemp.setDate(tanggaltemp.getDate()+1);
    var tanggalInsert = buatTanggal(tanggaltemp.getDate(),tanggaltemp.getMonth()+1,tanggaltemp.getFullYear());
    let sql = `UPDATE task SET tanggal = "${tanggalInsert}" WHERE id = ${req.body.id};`;
    db.query(sql, (err, result) => {
        console.log(result);
        if(err) throw err;
        sql = `SELECT * FROM task WHERE id = ${req.body.id} and tanggal = "${req.body.tanggal}";`;
        db.query(sql, (err, result) => {
            if (err) throw err;
            if (result.length != 0){
                res.send("true");
            } else {
                res.send("false");
            }
        });
    });
});

// Delete task by ID
app.post('/delete', (req, res) => {
    let sql = `DELETE FROM task WHERE id = ${req.body.id};`;
    db.query(sql, (err, result) => {
        console.log(result);
        if(err) throw err;
        sql = `SELECT * FROM task WHERE id = ${req.body.id};`;
        db.query(sql, (err, result) => {
            if (err) throw err;
            if (result.length == 0){
                res.send("true");
            } else {
                res.send("false");
            }
        });
    });
});

// Search deadline 
app.post('/deadline', (req, res) => {
    let sql = `SELECT * FROM task WHERE matkul = "${req.body.matkul}" AND `;
    console.log(req.body.tugas);
    if(req.body.tugas == "Tugas") {
        sql +=  `(tugas = "Tubes" OR tugas = "Tucil");`;
    }
    else if(req.body.tugas == "Tubes"){
        sql += `tugas = "Tubes";`;
    }
    else{
        sql += `tugas = "Tucil";`;
    }
    db.query(sql, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.send(result);
    });
});

// Get Task
app.post('/gettask', (req, res) => {
    let sql = '(SELECT * FROM task)';
    if (req.body.tugas != null){
        sql += ` INTERSECT (SELECT * FROM task WHERE tugas = "${req.body.tugas}")`;
    }
    if (req.body.tanggal1 != null){
        if (req.body.tanggal2 != null){
            sql += ` INTERSECT (SELECT * FROM task WHERE tanggal BETWEEN "${req.body.tanggal1}" and "${req.body.tanggal2}")`;
        }
        else{
            sql += ` INTERSECT (SELECT * FROM task WHERE tanggal = "${req.body.tanggal1}")`;
        }
    }
    db.query(sql, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.send(result);
    });
});

// Delete task
app.post('/deletetask', (req, res) => {
    let sql =  'DELETE FROM task WHERE id = 14;';
    db.query(sql, (err, result) => {
        if(err) throw err;
        console.log(result);
        req.body.id = result;
    });
});

const port = 8000 || process.env.PORT;
const server = app.listen(port, () => {
    console.log(`App running at port ${port}`);
});

//Get Keyword
app.post('/getkeyword', (req,res) =>  {
    let sql = '(SELECT * FROM keyword)';
    db.query(sql, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.send(result);
    });
});

function buatTanggal(hari, bulan, tahun){
    if (parseInt(hari)<10){
        hari = "0" + hari.toString();
    }
    if (parseInt(bulan)<10){
        bulan = "0" + bulan.toString();
    } 

    return tahun + '-' + bulan + '-'+ hari;
}