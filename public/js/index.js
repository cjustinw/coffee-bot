// KAMUS
var listTugas = [];
const submitBtn = document.querySelector('.submit');
const chatlogs = document.querySelector('.chatlogs');
const textInput = document.querySelector('textarea');
const popup = document.querySelector('.chat-container');
const chatbtn = document.querySelector('#chat-logo');
const aboutbtn = document.querySelector('#about-us-logo');

window.addEventListener('DOMContentLoaded', (event) => {
    processOutput("help");
    kataTugas();
});

chatbtn.addEventListener('click', () => {
    popup.classList.toggle('show');
})

aboutbtn.addEventListener('click', () => {
    $(document).ready(function() {
        $('html').animate({
            scrollTop:1000
        }, 1000);
    });
})

submitBtn.addEventListener('click', ()=> {
    var input = textInput.value;

    if(input != ''){
        var showInput = `
            <div class="chat user">
                <p class="chat-message">${input}</p>
            </div>
        `;
        chatlogs.insertAdjacentHTML("beforeend", showInput);
        textInput.value = '';

        /* **** Output **** */
        processOutput(input);

        $(document).ready(function() {
            $('.chatlogs').animate({
                scrollTop:10000000000
            }, 500);
        });
    }
});

// Regex untuk data task yang ada
const regexTanggal = /(((0[1-9]|[12][0-9]|3[01])|[1-9])\s(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)\s\d{4})|((0[1-9]|[12][0-9]|3[01])[\/\-](0[1-9]|1[012])[\/\-]\d{4})/i;
const regexMatkul =  /[A-Z]{2}\d{4}/;
const regexTugas = /(kuis|ujian|tucil|tubes|praktikum)/i;
const regexTopik = /(?<=topik\s)(.*)$/i;
// Regex untuk fitur lihat deadline
const regexIndikatorLihat = /(lihat|apa\ssaja|tampilkan|deadline)/i;
const regexIndikatorWaktu = /((\d|\d{2})\sminggu\ske\sdepan|(\d|\d{2})\shari\ske\sdepan|hari\sini|besok|minggu\sini)/i;
const regexIndikatorSemua = /(sejauh\sini|semua|suluruh)/i; 
// Regex untuk menampilkan deadline
const regexDeadline = /waktu[\s]kumpul|deadline/i;
const regexTugas2 = /(tucil|tubes|tugas)/i;
// Regex untuk memperbarui deadline
const regexIndikatorUpdate = /diundur|mundur|ditunda|undur|update|ubah|ganti/i;
// Regex untuk delete task yang ada
const regexAmbilAngka = /[0-9]+/;
const regexIndikatorDelete = /selesai|kelar|done|delete|hapus|ga\sjadi|batal/i;
const regexIndikatorTask = /task\s[0-9]+/i;


//Fungsi-fungsi untuk formating
function formatTanggal(tgl) {
    /* prereq tanggal yg sesuai dengan regexTanggal */
    const regexHari =  /((0[1-9]|[12][0-9]|3[01])|[1-9])[\s|\/|-]/;
    const regexBulan = /\s(januari|februari|maret|april|mei|juni|juli|agustus|september|oktober|november|desember)\s|[\/|-](0[1-9]|1[012])[\/|-]/i;
    const regexTahun = /[\s|\/|-]\d{4}/;

    /* format hari */
    var hari = /(0[1-9]|[12][0-9]|3[01])|[1-9]/.exec(regexHari.exec(tgl)[0])[0];
    if (hari.length==1){
        hari = "0" + hari.toString();
    }

    /* format bulan */
    var bulan = regexBulan.exec(tgl)[0];
    if(/januari/i.exec(bulan) != null) {bulan = "01";}
    else if(/februari/i.exec(bulan) != null) {bulan = "02";}
    else if(/maret/i.exec(bulan) != null) {bulan = "03";}
    else if(/april/i.exec(bulan) != null) {bulan = "04";}
    else if(/mei/i.exec(bulan) != null) {bulan = "05";}
    else if(/juni/i.exec(bulan) != null) {bulan = "06";}
    else if(/juli/i.exec(bulan) != null) {bulan = "07";}
    else if(/agustus/i.exec(bulan) != null) {bulan = "08";}
    else if(/september/i.exec(bulan) != null) {bulan = "09";}
    else if(/oktober/i.exec(bulan) != null) {bulan = "10";}
    else if(/november/i.exec(bulan) != null) {bulan = "11";}
    else if(/desember/i.exec(bulan) != null) {bulan = "12";}
    else {bulan = /(0[1-9]|1[012])/.exec(bulan)[0];}

    /* format tahun */
    var tahun = /\d{4}/.exec(regexTahun.exec(tgl)[0]);
    
    return tahun + '-' + bulan + '-' + hari;
}
function formatTugas(tugas) {
    /* prereq tugas yg sesuai dengan regexTugas */
    var str = tugas.toLowerCase()
    str = str[0].toUpperCase() + str.substr(1);
    return str;
}
function formatTopik(topik) {
    var tanggal = regexTanggal.exec(topik)[0].toString();
    var matkul = regexMatkul.exec(topik)[0].toString();
    var tugas = regexTugas.exec(topik)[0].toString();
    var key = [tanggal , matkul, tugas];
    var output = null;
    var bool = false;
    key.forEach(element => {
        var str = "(?<=topik\\s)(.*)(?=\\sreplacement)";
        var newStr = str.replace("replacement", element);
        var regx = new RegExp(newStr, 'i');
        if(regx.test(topik)){
            output = regx.exec(topik)[0];
            bool = true;
        }
    });
    if(!bool){
        if(regexTopik.test(topik)){
            output = regexTopik.exec(topik)[0];
        }
    }
    return output;
}
function printTask(str) {
    /* prereq isTask(str) true */
    var tanggal = formatTanggal(regexTanggal.exec(str)[0].toString());
    var matkul = regexMatkul.exec(str)[0].toString();
    var tugas = formatTugas(regexTugas.exec(str)[0]);
    var topik = "Regex";
    var task = {
        tanggal: tanggal,
        matkul: matkul,
        tugas: tugas,
        topik: topik
    }
    return tanggal + " - " + matkul + " - " + tugas + " - " + topik;
}
function buatTanggal(hari, bulan, tahun){
    if (parseInt(hari)<10){
        hari = "0" + hari.toString();
    }
    if (parseInt(bulan)<10){
        bulan = "0" + bulan.toString();
    } 
    return tahun + '-' + bulan + '-'+ hari;
}
function printTanggal(tanggal){
    return tanggal.slice(8,10)+'/'+tanggal.slice(5,7)+'/'+tanggal.slice(0,4);
}


//Fungsi-fungsi untuk mengecek masukan dan menentukan masukan fitur berdasarkan masukan
function isCommandToAddTask(str) {
    return regexTanggal.test(str) && regexMatkul.test(str) && containTugas(str.toLowerCase()) && formatTopik(str) != null;
}
function isCommandToSearchDeadline(str) {
    return regexDeadline.test(str) && regexTugas2.test(str) && regexMatkul.test(str);
}
function isCommandToSeeTask(str) {
    return (regexIndikatorLihat.test(str) && (containTugas(str.toLowerCase()) || regexIndikatorWaktu.test(str) || regexIndikatorSemua.test(str) || regexTanggal.test(str)) && !regexMatkul.test(str)); 
}
function containTugas(str){
    var i=0;
    var found = false
    while (i<listTugas.length & !found){
        if (kmpMatch(str, listTugas[i])){
            found = true;
        }
        i++;
    }
    return found;
}
function isCommandToUpdateTask(str){
    return regexIndikatorUpdate.test(str) && regexTanggal.test(str) && regexIndikatorTask.test(str);
}
function isCommandToDeleteTask(str){
    return regexIndikatorDelete.test(str) && regexIndikatorTask.test(str);
}
function isCommandToHelp(str){
    return kmpMatch(str.toLowerCase(),"help") || kmpMatch(str.toLowerCase(),"bantuan") || kmpMatch(str.toLowerCase(),"detail");
}

function isCommandToClearAllTask(str){
    return kmpMatch(str.toLowerCase(),"clear");
}

//Fungsi Tambahan
async function taskExistInDatabase(id){
    var temp;
    try{
        temp = await processSearchTask(id);
        if (temp == "null"){
            return "false";
        } else {
            return "true";
        }
    }
    catch (err){
        console.log(err);
    }
}
async function processSearchTask(id){
    var output;
    try{
        await $.post('/search',
            {id : id},
            function(result){
            if (result == "false"){
                output = "null";
            } else {
                output = result;
            }
        })
    } catch (err) {
        console.log(err);
    }
    return output;
}

//Fungsi KMP
function computeFail(pattern){
    var fail = [];
    fail.push(0);
    var m = pattern.length;
    var j = 0;
    var i = 1;
    while (i < m) {
        if (pattern.charAt(j) == pattern.charAt(i)) { //j+1 chars match
            fail.push(j+1);
            i++;
            j++;
        }
        else if (j > 0) // j follows matching prefix
            j = fail[j-1];
        else { // no match
            fail.push(0);
            i++;
        }
    }
    return fail;
}
function kmpMatch(text, pattern){
    var n = text.length;
    var m = pattern.length;
    var fail = computeFail(pattern);
    var i=0;
    var j=0;
    while (i < n) {
        if (pattern.charAt(j) == text.charAt(i)) {
            if (j == m - 1)
                return true; // match
            i++;
            j++;
        }
        else if (j > 0)
            j = fail[j-1];
        else
            i++;
        } 
        return false; // no match
}


//Fungsi fitur-fitur yang ada
//Fungsi fitur 1
//Menambahkan Task
async function processAddTask(input){
    var output;
    var task = {
        id: null,
        tanggal: formatTanggal(regexTanggal.exec(input)[0].toString()),
        matkul: regexMatkul.exec(input)[0].toString(),
        tugas: formatTugas(regexTugas.exec(input)[0]),
        topik: formatTopik(input)
    }
    try{
        await $.post('/insert',  
            {tanggal: task.tanggal, matkul: task.matkul, tugas: task.tugas, topik: task.topik}, 
            function(id){
            task.id = id;
            if(task.id != null){
                if(task.id == false){
                    output = "Task sudah pernah dicatat sebelumnya :)"
                }
                else{
                    output = "<b>[Task Berhasil Dicatat]</b> <br> <br>";
                    output += "(ID: " + task.id + ") " + printTanggal(task.tanggal) + " - " + task.matkul + " - " + task.tugas + " - " + task.topik;
                }
            }
        })
    } catch (err) {
        console.log(err);
    }
    printOutputText(output);
}

//Fungsi Fitur 2
//Melihat Daftar Task
async function printSeeTask(str){
    var semua = false;
    var tugas, tanggal1, tanggal2;
    if (regexIndikatorSemua.test(str)){
        semua = true;
    }
    if (containTugas(str.toLowerCase())){
        tugas = formatTugas(regexTugas.exec(str)[0]);
    }
    if (regexIndikatorWaktu.test(str)){
        var regex1 = /(\d|\d{2})\sminggu\ske\sdepan/i;
        var regex2 =/(\d|\d{2})\shari\ske\sdepan/i;
        var regex3 = /besok/i;
        var regex4 = /minggu\sini/i;
        var d = new Date(); 
        // d.setDate(d.getDate()+1);
        tanggal1 = buatTanggal(d.getDate(), d.getMonth()+1, d.getFullYear());
        if (regex1.test(str)){
            d.setDate(d.getDate() + 7*parseInt(regex1.exec(str)[0].slice(0,2)));
            tanggal2 = buatTanggal(d.getDate(), d.getMonth()+1, d.getFullYear());
        }
        else if (regex2.test(str)){
            d.setDate(d.getDate() + parseInt(regex2.exec(str)[0].slice(0,2)));
            tanggal2 = buatTanggal(d.getDate(), d.getMonth()+1, d.getFullYear());
        }
        else if (regex3.test(str)){
            d.setDate(d.getDate() + 1);
            tanggal1 = buatTanggal(d.getDate(), d.getMonth()+1, d.getFullYear());
        }
        else if (regex4.test(str)){
            d.setDate(d.getDate() + 7);
            tanggal2 = buatTanggal(d.getDate(), d.getMonth()+1, d.getFullYear());
        }
    }
    if (regexTanggal.test(str)){
        var hasil = [];
        var tanggal;
        while (regexTanggal.test(str)){
            tanggal = regexTanggal.exec(str)[0]
            hasil.push(tanggal);
            str = str.replace(tanggal, "");
        }
        tanggal1 = formatTanggal(hasil[0]);
        if (hasil.length > 1){
            tanggal2 = formatTanggal(hasil[1]);
        }
        console.log(tanggal1);
    }
    
    var output;
    var task = {
        tgs: tugas,
        tgl1: tanggal1,
        tgl2: tanggal2,
    }
    try{
        await $.post('/gettask',  
            {tugas: task.tgs, tanggal1: task.tgl1, tanggal2: task.tgl2}, 
            function(data){
                var i;
                if (data.length == 0){
                    output = "Yeay, deadline tugas yang kamu cari tidak ada :)";
                }
                else{
                    output = "<b>[Daftar Deadline]</b> <br> <br>";
                    for (i = 0;  i<data.length; i++){
                        var date = new Date(data[i].tanggal);
                        var dateOutput = buatTanggal(date.getDate(), date.getMonth() + 1, date.getFullYear())
                        output += (i+1) + ". (ID : " + data[i].id + ") " + printTanggal(dateOutput) + " - " + data[i].matkul + " - " + data[i].tugas + " - " + data[i].topik + "<br>"; 
                    }    
                }             
            })
    } catch (err) {
        console.log(err);
    }
    printOutputText(output);
}

//Fungsi Fitur 3
//Menampilkan Deadline
async function processSearchDeadline(input) {
    var output = "";
    var  task = {
        matkul : regexMatkul.exec(input)[0].toString(),
        tugas : formatTugas(regexTugas2.exec(input)[0].toString())
    }
    try{
        await $.post('/deadline',  
            {matkul: task.matkul, tugas: task.tugas}, 
            function(data){
                if(data != null) {
                    if(data.length == 0) {
                        output = "Yeay, deadline tugas yang kamu cari tidak ada :)"
                    }
                    else{
                        data.forEach(element => {
                            var date = new Date(element.tanggal);
                            var dateOutput = buatTanggal(date.getDate(), date.getMonth() + 1, date.getFullYear())
                            output += printTanggal(dateOutput) + " <br>";
                        });
                    }
                }
            }
        )
    } catch (err) {
        console.log(err);
    }
    printOutputText(output);
}

//Fungsi Fitur 4
//Memperbaharui Task Tertentu
async function printUpdateMessage(str){
    var task = regexIndikatorTask.exec(str);
    var number = regexAmbilAngka.exec(task)[0];
    var tanggal = formatTanggal(regexTanggal.exec(str));
    var output;
    try {
        var existCond = await taskExistInDatabase(number);
        if (existCond == "true"){
            var updateCond = await processUpdateTask(number, tanggal)
            if (updateCond == "true"){
                tanggal = printTanggal(tanggal);
                output = "<b>[Task Berhasil Diperbaharui]</b>" + "<br> <br>" + "Task " + number + " deadlinenya diupdate menjadi " + tanggal;
            } else {
                output = "Maaf, task gagal dihapus :(" + "<br> <br>" + "Terjadi error pada update database";
            }
        } else {
            output = "Maaf, task gagal diperbaharui :(" + "<br> <br>" + "Task " + number + " tidak ditemukan";
        }
    } catch (err) {
        console.log(err);
    }
    printOutputText(output);
}

async function processUpdateTask(id, tanggal){
    var cond; // kondisi delete berhasil atau tidak
    try{
        await $.post('/update',  
            {id: id, tanggal: tanggal}, 
            function(condition){
                cond = condition;
                console.log(cond);
        })
    } catch (err) {
        console.log(err);
    }
    return cond;
}

//Fungsi Fitur 5
//Menandai Task Sudah Selesai
async function printDeleteMessage(str){
    var task = regexIndikatorTask.exec(str);
    var number = regexAmbilAngka.exec(task)[0];
    var output;
    try{
        var existCond = await taskExistInDatabase(number);
        if (existCond == "true"){
            var deleteCond = await processDeleteTask(number);
            if (deleteCond == "true"){
                output = "<b>Task Berhasil Dihapus</b>" + "<br> <br>" + "Task " + number + " telah dihapus";
            } else {
                output = "Maaf, task gagal dihapus :(" + "<br> <br>" + "Terjadi error pada delete database";
            }
        } else {
            output = "Maaf, task gagal dihapus :(" + "<br> <br>" + "Task " + number + " tidak ditemukan";
        }
    } catch(err) {
        console.log(err);
    }
    printOutputText(output);
}

async function processDeleteTask(id){
    var cond; // kondisi delete berhasil atau tidak
    try{
        await $.post('/delete',  
            {id: id}, 
            function(condition){
                cond = condition;
        })
    } catch (err) {
        console.log(err);
    }
    return cond;
}

//Fungsi Fitur 6
//Menampilkan Opsi Help
function help(){
    output = "<b>[COFFEE BOT]</b><br> <br>";
    output += "<b>Penjelasan Kata Kunci : </b><br>";
    output += "<b>1. Tanggal</b> (dd-mm-yyyy, x bulan yyyy, dd/mm/yyyy) <br> contoh : 28 april 2021 <br>";
    output += "<b>2. Kode Matkul</b> (YYXXXX) <br> contoh : IF2211 <br>";
    output += "<b>3. Jenis Tugas</b> (tubes, tucil, praktikum, ujian, kuis) <br>";
    output += "<b>4. Topik</b> (diawali dengan kata topik) <br>";
    output += "<b>5. Range waktu</b> (n hari ke depan, n minggu ke depan, hari ini, besok, tanggal, tanggal sampai tanggal) <br> contoh : deadline tanggal 1/04/2021 sampai 30/04/2021 <br>";
    output += "<br>*Kata kunci tidak dipengaruhi huruf kapital<br><br>";
    output += "<b>Command-Command : </b><br>"
    output += "<br><b>--Menambahkan Deadline </b><br>";
    output += "   <b>kata kunci :</b> tanggal, kode matkul, jenis tugas, \"topik\" <br>";
    output += "   <b>contoh :</b> bot, tolong tambahkan deadline <b>Tubes</b> <b>IF2211</b> tanggal <b>28 april 2021</b> dengan <b>topik String Matching</b><br>";
    output += "<br><b>--Melihat Daftar Task</b><br>";
    output += "   <b>kata kunci :</b> \"tampilkan\" atau \"lihat\", \"deadline\", range waktu atau \"semua\" atau jenis tugas <br>";
    output += "   <b>contoh :</b> bot, <b>lihat semua deadline</b><br>";
    output += "<br><b>--Menampilkan Deadline Tugas</b><br>";
    output += "   <b>kata kunci :</b> \"deadline\" atau \"waktu kumpul\", jenis tugas, kode matkul<br>";
    output += "   <b>contoh :</b> bot, <b>deadline tubes IF2211</b> kapan?<br>";
    output += "<br><b>--Memperbaharui Task</b><br>";
    output += "   <b>kata kunci :</b> \"task\", ID Task, \"diundur\", tanggal<br>";
    output += "   <b>contoh :</b> bot, <b>task 1 diundur </b> jadi <b>29 april 2021</b><br>";
    output += "<br><b>--Menandai Task Sudah Dikerjakan</b><br>";
    output += "   <b>kata kunci :</b> \"task\", ID Task, \"kelar\" atau \"hapus\", <br>";
    output += "   <b>contoh :</b> bot, <b>task 1 kelar</b> <br>";
    output += "<br><b>--Menampilkan Command</b><br>";
    output += "   <b>kata kunci :</b> \"help\" atau \"bantuan\" atau \"detail\"<br>";
    output += "<br><b>--Menghapus Seluruh Database</b><br>";
    output += "   <b>kata kunci :</b> \"clear\"<br>";
    return output;
}

//Fungsi Fitur 7
//Definisi dan List Task
async function kataTugas(){
    try{
        listTugas = [];
        await $.post('/getkeyword', {}, function(data){
            var i=0;
            while (i<data.length){
                listTugas.push(data[i].kata);
                i++;
            }                
        })
    } catch (err) {
        console.log(err);
    }
}

//Clear
async function processClearAllTask(){
    var output;
    try{
        await $.post('/clear', {}, function(data){
            if(data == true){
                output = "Yeay, semua task telah dihapus :)<br>"
            }             
            else{
                output = "Maaf, gagal untuk menghapus semua task :(<br>"
            }
        })
    } catch (err) {
        console.log(err);
    }
    printOutputText(output);
}


//Fungsi Fitur 8
//Menampilkan Pesan Error
//Fungsi menampilkan output dari semua fitur yang ada
function processOutput(input) {
    if(isCommandToAddTask(input)){
        processAddTask(input);
    }
    else if (isCommandToSeeTask(input)){
        printSeeTask(input);
    }
    else if (isCommandToSearchDeadline(input)){
        processSearchDeadline(input);
    }
    else if (isCommandToUpdateTask(input)){
        printUpdateMessage(input);
    }
    else if (isCommandToDeleteTask(input)){
        printDeleteMessage(input);
    }
    else if (isCommandToHelp(input)){
        printOutputText(help());
    }
    else if (isCommandToClearAllTask(input)){
        processClearAllTask();
    }
    else{
        printOutputText("Maaf, pesan tidak dapat dikenali :(");
    }
}

function printOutputText(output) {
    if(output != null){
        var showOutput = `
            <div class="chat bot">
                <p class="chat-message">${output}</p>
            </div>
        `;
        chatlogs.insertAdjacentHTML("beforeend", showOutput);
    }
    $(document).ready(function() {
        $('.chatlogs').animate({
            scrollTop:10000000000
        }, 500);
    });
}