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

// Insert task
app.post('/insert', (req, res) => {
    let sql = `SELECT id FROM task WHERE tanggal = "${req.body.tanggal}" and matkul = "${req.body.matkul}" and tugas = "${req.body.tugas}" and topik = "${req.body.topik}";`;
    db.query(sql, (err, result) => {
        if(err) throw err;
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
    let sql = `UPDATE task SET tanggal = "${req.body.tanggal}" WHERE id = ${req.body.id};`;
    db.query(sql, (err, result) => {
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
        res.send(result);
    });
});

// Get Task
app.post('/gettask', (req, res) => {
    let sql = 'SELECT * FROM task';
    if (req.body.tugas != null && req.body.tanggal1 == null){
        sql = `SELECT * FROM task WHERE tugas = "${req.body.tugas}"`;
    }
    else if (req.body.tanggal1 != null){
        if (req.body.tanggal2 != null){
            sql = `SELECT * FROM task WHERE (tanggal BETWEEN "${req.body.tanggal1}" and "${req.body.tanggal2}")`;
        }
        else{
            sql = `SELECT * FROM task WHERE (tanggal = "${req.body.tanggal1}")`;
        }
        if(req.body.tugas != null){
            sql += ` AND tugas = "${req.body.tugas}"`;
        }
    }
    sql += ";";
    db.query(sql, (err, result) => {
        if(err) throw err;
        res.send(result);
    });
});

//Get Keyword
app.post('/getkeyword', (req,res) =>  {
    let sql = '(SELECT * FROM keyword)';
    db.query(sql, (err, result) => {
        if(err) throw err;
        res.send(result);
    });
});

//Clear
app.post('/clear', (req, res) => {
    let sql = 'DELETE FROM task';
    db.query(sql, (err, result) => {
        if(err) throw err;
        res.send(true);
    });
})

app.listen(process.env.PORT || 3000, function(){
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
  });