const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('mysql')
const cors = require('cors')
const path = require('path')

const app = express()
app.use(express.static(__dirname))
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())
const port = 3000

app.get('/', (req, res) => {
    res.send('Hello world')
})

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname,'login.html'))
})

app.post('/login', (req, res) => {
    console.log(req.body)
    res.json(req.body)
})

app.get('/registration', (req, res) => {
    res.sendFile(path.join(__dirname, 'registration.html'))
})

app.post('/registration', (req, res) => {
    console.log(req.body)
    res.json(req.body)
})

app.listen(port, () => console.log(`Server is started at http://localhost:${port}/`))