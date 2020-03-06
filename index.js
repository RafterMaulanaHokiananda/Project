const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('mysql')
const jwt = require('jsonwebtoken')

//membuat aplikasi framework express
const app = express()

//inisialisasi secret key yang digunakan oleh JWT
const secretKey = 'thisisverysecretkey'

//enable body-parser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

//koneksi -> database
const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'project'
})

conn.connect((err) => {
    if(err) throw err
    console.log('Connected............')
})

//fungsi mengecek token JWT
const isAuthorized = (req, res, next) => {
        if(typeof(req.headers['x-api-key']) == 'undefined')
        {
            return res.status(403).json({
                success: false,
                message: 'Unathorized Token is not provided'
            })
        }


    //get token dari headers
    let token = req.headers['x-api-key']

    //melakukuan verivikasi token yang dikirim user
    jwt.verify(token, secretKey, (err, decoded) => {
        if(err)
        {
            return res.status(403).json({
                success: false,
                message: 'Unathorized Token'
            })
        }
    })

    //lanjut ke next request
    next()
}

//=========== list end point ============//

app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Selamat Datang'
    })
})


//Lapangan

app.post('/login', (req, res) => {
    let data = req.body

    if(data.username == 'admin' && data.password == 'admin')
    {
        let token = jwt.sign(data.username + ' | ' + data.password, secretKey)

        res.json({
            success: true,
            message: 'Haloo',
            token: token
        })
    }
    res.json({
        success: false,
        message: 'dohhh'
    })
})

app.get('/lapangan',isAuthorized,  (req, res) => {
    let sql = 'select * from lapangan'
    conn.query(sql, (err, result) => {
        if(err) throw err
        res.json({
            success: true,
            message: 'Lapangan',
            data: result
        })
    })
})

app.get('/lapangan/:id',isAuthorized, (req, res) => {
    let sql = `
        select * from lapangan
        where id_lap = `+req.params.id+`
        limit 1
    `

    conn.query(sql, (err, result) => {
        if (err) throw err

        res.json({
            message: "success get user's detail",
            data: result[0]
        })
    })
})


app.post('/lapangan',isAuthorized,  (req, res) => {
    let data = req.body
    let sql = `
        insert into lapangan(nama_lap, jam,  harga, jenis)
        values('`+data.nama_lap+`','`+data.jam+`','`+data.harga+`','`+data.jenis+`');
    `

    conn.query(sql, (err, result) => {
        if(err) throw err
    })
    res.json({
        success: true,
        message: 'Sippp'
    })
})

app.put('/lapangan/:id_lap',isAuthorized,  (request, result) => {
    let data = request.body
    let sql =`
        update books
        set nama_lap = '`+data.nama_lap+`', jam = '`+data.jam+`', jenis = '`+data.jenis+`'
        where id = `+request.params.id+`
    `

    conn.query(sql, (err, result) => {
        if(err) throw err
    })
    result.json({
        success: true,
        message: 'Sipppp'
    })
})


app.delete('/lapangan/:id_lap',isAuthorized,  (request, result) => {
    let sql =`
        delete from lapangan where id_lap = `+request.params.id_lap+`
    `

    conn.query(sql, (err, res) => {
        if(err) throw err
    })
    result.json({
        success: true,
        message: 'Data deleted'
    })
})

app.post('/lapangan/:id/pesan', (req, res) => {
    let data = req.body

    conn.query(`
        insert into pesan (id_user, id_lap)
        values ('`+data.id_user+`', '`+req.params.id+`')
    `, (err, result) => {
        if (err) throw err
    })

    conn.query(`
        update lapangan
        set status = "booking"
        where id_lap = '`+req.params.id+`'
    `, (err, result) => {
        if (err) throw err
    })

    res.json({
        message: "Book has been taked by user"
    })
})
//Pemesanan

app.delete('/lapangan/:id/:id_lap',isAuthorized, (req, res) => {
    let data = req.body

    conn.query(`
        delete from pesan where id_pesan = `+req.params.id+`
    `, (err, result) => {
        if (err) throw err
    })

    conn.query(`
        update lapangan
        set status = "tersedia"
        where id_lap = '`+req.params.id_lap+`'
    `, (err, result) => {
        if (err) throw err
    })

    res.json({
        message: "Success"
    })
})







//Port

app.listen(9000, () => {
    console.log('Sippp')
})
