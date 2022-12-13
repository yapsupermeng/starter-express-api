require('dotenv').config()
const express = require('express')
var mongoose = require('mongoose')
var cors = require('cors')

//global config
const port = process.env.PORT
const DB_URI = process.env.DB_URI
//setup
const app = express()
var tools = require('./tools');
//middleware 
app.use(cors())
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

//api router
const apiRoutes = require('./routes/routes')
app.use('/api', apiRoutes)

//db donnection
mongoose.set('strictQuery', false);
mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => {
		console.log('Connected to database!')
		tools.initFunc()
	})
	.catch((err) => console.log(err))



app.get('/', (req, res) => res.send('Like this video! owifaiwofk'))

app.listen(port, () => {
	console.log(`Example app listening on port ${port}!`)

})



