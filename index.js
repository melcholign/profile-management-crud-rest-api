const express = require('express')
const session = require('express-session')
const mysql = require('mysql')
const MySQLStore = require('express-mysql-session')(session);
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')
const bcrypt = require('bcrypt')

const saltRounds = 10

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

    res.redirect('login.html')
})

app.post('/login', async (req, res) => {
    const data = req.body

    const { results } = await executeQuery(`SELECT * FROM profile WHERE email = '${data.email}'`)
    const isInvalidLogin = results.length === 0 ||
        !(await bcrypt.compare(data.password, results[0].password))

    if (isInvalidLogin) {
        res.status(400).send('The email or password you have entered is incorrect.')
        return
    }

    req.session.authenticated = true
    req.session.remember = data.rememberMe
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

    const hash = await bcrypt.hash(data.password, saltRounds)

    await executeQuery(`INSERT INTO profile (first_name, last_name, gender, date_of_birth, email, password, image_url)
            VALUES ('${data.first_name}', '${data.last_name}', '${data.gender}', '${data.date_of_birth}', '${data.email}', 
                '${hash}', null)`)

    res.sendStatus(200)
})

// profile api endpoints

app.get('/profile', async (req, res) => {

    if (req.accepts('text/html')) {
        res.redirect('profile.html')
        return
    }

    const { results } = await executeQuery(`SELECT first_name, last_name, date_of_birth, gender FROM profile where email = '${req.session.user}'`)
    results[0].date_of_birth = results[0].date_of_birth.toISOString().slice(0, 10)

    res.json(results[0])
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