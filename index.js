const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const { userRouter, productRouter } = require('./router')
const port = 2000
const cors = require('cors')

app.use(bodyParser.json())
app.use(cors())

app.use('/uploads',express.static('uploads'))
app.use('/user' , userRouter)
app.use('/product', productRouter)


app.get('/' , (req,res) => {
    res.send('<h1> Selamat Datang di Tugas Akhir</h1>')
})


app.listen(port , () => console.log('Berjalan di Port ' + port))




