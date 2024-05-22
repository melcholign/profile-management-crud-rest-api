const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('mysql')
const cors = require('cors')
const path = require('path')
const { ok } = require('assert')

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
app.use(bodyParser.json())
app.use(cors())

// server port id
const port = 3000

// api endpoints

app.get('/', (req, res) => {
    res.send('Hello world')
})


// login endpoints
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'))
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
    body = req.body
    executeQuery(`SELECT email from profile where email = '${body.email}'`).then(results => {
        if (results.length != 0) {
            res.status(400).send(`A profile with the email ${results[0].email} is already registered.`)
        } else {
            executeQuery(`INSERT INTO profile (first_name, last_name, gender, date_of_birth, email, password, image_url)
            VALUES ('${body.first_name}', '${body.last_name}', '${body.gender}', '${body.date_of_birth}', '${body.email}', '${body.password}', null)`)
                .then(() => {
                    res.sendStatus(200)
                })
        }
    })
})

// run server
app.listen(port, () => console.log(`Server is started at http://localhost:${port}/`))


function executeQuery(query) {
    return new Promise((resolve, reject) => {

        connection.query(query, (err, results) => {

            if (err) {
                reject(err)
            } else {
                resolve(results)
            }

        })

    })
}