const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('mysql')
const cors = require('cors')
const path = require('path')

// establish connection and connect with the database
const connection = mysql.createConnection({
    user: 'root',
    password: 'qwerty123',
    database: 'profile_manager',
    port: 3306,
})

connection.connect(err => {
    const database = connection.config.database

    if (err) {
        console.log(`Could not connect with database (${database}).`)
    } else {
        console.log(`Database (${database}) connection successful.`)
    }
})

// Create an app instance of express and bind middlewares to it
const app = express()
app.use(express.static(__dirname))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())

// server port id
const port = 3000

// api endpoints

app.get('/', (req, res) => {
    res.send('Hello world')
})


// login endpoints
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname,'login.html'))
})

app.post('/login', (req, res) => {
    console.log(req.body)
    res.json(req.body)
})

// registration endpoints
app.get('/registration', (req, res) => {
    res.sendFile(path.join(__dirname, 'registration.html'))
})

app.post('/registration', (req, res) => {
    console.log(req.body)
    res.json(req.body)
})

// run server
app.listen(port, () => console.log(`Server is started at http://localhost:${port}/`))