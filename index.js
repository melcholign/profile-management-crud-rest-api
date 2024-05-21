const express = require('express')
const mysql = require('mysql')
const cors = require('cors')
const path = require('path')

const app = express()
app.use(express.static(__dirname))
app.use(cors)
const port = 3000

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'login.html'))
})

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname,'login.html'))
})

app.get('/registration', (req, res) => {
    res.sendFile(path.join(__dirname, 'registration.html'))
})

app.listen(port, () => console.log(`Server is started at http://localhost:${port}/...`))