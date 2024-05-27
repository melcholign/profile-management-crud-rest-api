const express = require('express')
const session = require('express-session')
const mysql = require('mysql')
const MySQLStore = require('express-mysql-session')(session);
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')

// Create an app instance of express and bind middlewares to it
const app = express()
app.use(express.static(__dirname))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
app.use(cors())


// use session middleware
const options = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'qwerty123',
    database: 'profile_manager',
}

const sessionStore = new MySQLStore(options)

app.use(session({
    secret: 'session profile',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
}))

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

// server port id
const port = 3000

// api endpoints

app.get('/', (req, res) => {
    res.send('Welcome!');
})


// login endpoints
app.get('/login', (req, res) => {
    if (req.session.authenticated) {
        res.send(req.session.user)
        return
    }

    res.sendFile(path.join(__dirname, 'login.html'))
})

app.post('/login', async (req, res) => {
    const data = req.body

    const { results } = await executeQuery(`SELECT * FROM profile WHERE email = '${data.email}' AND password = '${data.password}'`)

    if (results.length === 0) {
        res.status(400).send('The email or password you have entered is incorrect.')
        return
    }

    req.session.authenticated = true
    req.session.user = results[0].email

    res.sendStatus(200)
})

// registration endpoints
app.get('/registration', (req, res) => {
    res.sendFile(path.join(__dirname, 'registration.html'))
})

app.post('/registration', async (req, res) => {
    const data = req.body

    const { results } = await executeQuery(`SELECT email from profile where email = '${data.email}'`)

    if (results.length != 0) {
        res.status(400).send(`A profile with the email ${results[0].email} is already registered.`)
        return
    }

    await executeQuery(`INSERT INTO profile (first_name, last_name, gender, date_of_birth, email, password, image_url)
            VALUES ('${data.first_name}', '${data.last_name}', '${data.gender}', '${data.date_of_birth}', '${data.email}', '${data.password}', null)`)

    res.sendStatus(200)
})


// run server
app.listen(port, () => console.log(`Server is started at http://localhost:${port}/`))


function executeQuery(query) {
    return new Promise((resolve, reject) => {
        connection.query(query, (err, results, fields) => {

            if (err) {
                reject(err)
            }

            resolve({ results, fields })

        })
    })
}