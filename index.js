const express = require('express')
const session = require('express-session')
const mysql = require('mysql')
const MySQLStore = require('express-mysql-session')(session);
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')
const bcrypt = require('bcrypt');

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
    cookie: {
        httpOnly: false,
        secure: false,
    }
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


// LOGIN endpoints

app.post('/login', async (req, res) => {

    const loginData = req.body

    // validation step: find the email that matches the input email
    const { results } = await executeQuery(`SELECT * FROM profile WHERE email = '${loginData.email}'`)

    // isInvalidLogin represents the state of an invalid login (if it is the case)
    // an invalid login occurs when there is an email mismatch (due which there is no result from the database),
    // or a password mismatch
    const isInvalidLogin = results.length === 0 || !(await bcrypt.compare(loginData.password, results[0].password))

    if (isInvalidLogin) {
        res.status(400).send('The email or password you have entered is incorrect.')
        return
    }

    // if login is valid
    req.session.authenticated = true
    req.session.user = results[0].email
    req.session.remember = loginData.rememberMe

    req.session.save(() => res.sendStatus(200))
})

// LOGOUT endpoint

app.post('/logout', (req, res) => {
    req.session.authenticated = false

    return res.sendStatus(200)
})

// REGISTRATION endpoints

app.post('/registration', async (req, res) => {

    const registrationData = req.body

    // validation step: search for duplicate emails that match the input email
    const { results } = await executeQuery(`SELECT email from profile where email = '${registrationData.email}'`)

    // a duplicate email means that there is already a user with the same email as the input,
    // so registration process is forfeited
    if (results.length != 0) {
        res.status(400).send(`A profile with the email ${results[0].email} is already registered.`)
        return
    }

    // if the registration data pose no issues, hash the provided password
    const passwordHash = await bcrypt.hash(registrationData.password, saltRounds)

    // complete registration by inserting user data into the database
    await executeQuery(`INSERT INTO profile (first_name, last_name, gender, date_of_birth, email, password, image_url)
            VALUES ('${registrationData.first_name}', '${registrationData.last_name}', '${registrationData.gender}',
            '${registrationData.date_of_birth}', '${registrationData.email}',  '${passwordHash}', null)`)

    res.sendStatus(200)
})

// PROFILE endpoints

app.get('/profile', async (req, res) => {

    // validation criteria: user is authenticated
    if (!req.session.authenticated) {
        res.sendStatus(400)
        return
    }

    const { results } = await executeQuery(`SELECT first_name, last_name, date_of_birth, gender FROM profile where email = '${req.session.user}'`)
    console.log(results)
    results[0].date_of_birth = results[0].date_of_birth.toISOString().slice(0, 10)


    // if the logged-in state is transient, then the next call to this api will return an error
    if(!req.session.remember) {
        req.session.authenticated = false
    }

    res.json(results[0])
})

app.put('/profile', async (req, res) => {
    const updateData = req.body
    let updateQuery = `UPDATE profile SET `

    for(let key in updateData) {
        updateQuery +=  `${key} = "${updateData[key]}", `
    }

    updateQuery = updateQuery.slice(0, updateQuery.length - 2)
    updateQuery += ` WHERE email = "${req.session.user}"`

    await executeQuery(updateQuery)

    res.sendStatus(200)
})

app.delete('/profile', async (req, res) => {
    await executeQuery(`DELETE FROM profile WHERE email = '${req.session.user}'`)

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