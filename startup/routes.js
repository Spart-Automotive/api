const express = require('express')
const bodyParser = require('body-parser')
const user = require('../routes/user')
const address = require('../routes/user/address')
const auth = require('../routes/auth')
const spart = require('../routes/app')
const section = require('../routes/section')
const vehicle = require('../routes/vehicle')
const brand = require('../routes/brand')
const test = require('../routes/test')
const error = require('../middleware/error')
const cors = require('cors')


// const formData = require('express-form-data')
// const os = require('os')
 


module.exports = function(app) {
	app.options('*', cors())
	app.use(cors())
	app.use(express.json())
	app.use( bodyParser.json() )       // to support JSON-encoded bodies
	app.use(bodyParser.urlencoded({
		extended: true
	}))
	app.use('/api/users', user)
	app.use('/api/address', address)
	app.use('/api/auth', auth)
	app.use('/api/section', section)
	app.use('/api/vehicle', vehicle)
	app.use('/api/brand', brand)
	app.use('/api/app', spart)
	app.use('/api/test', test)
	app.use(error)
}