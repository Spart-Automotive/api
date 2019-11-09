const express = require('express')
const bodyParser = require('body-parser')
const user = require('../routes/user')
const address = require('../routes/user/address')
const auth = require('../routes/auth')
const deskaf = require('../routes/app')
const job = require('../routes/job')
const stock = require('../routes/stock')
const move = require('../routes/move')
const locations = require('../routes/locations')
const error = require('../middleware/error')
const cors = require('cors')
const whitelist = ['*', 'https://8080-dot-9728892-dot-devshell.appspot.com']
var corsOptions = {
	origin: function (origin, callback) {
		if (whitelist.indexOf(origin) !== -1) {
			callback(null, true)
		} else {
			callback(new Error('Not allowed by CORS'))
		}
	}
}

// const formData = require('express-form-data')
// const os = require('os')
 


module.exports = function(app) {
	app.use(cors(corsOptions))
	app.use(express.json())
	app.use( bodyParser.json() )       // to support JSON-encoded bodies
	app.use(bodyParser.urlencoded({
		extended: true
	}))
	app.use('/api/users', user)
	app.use('/api/address', address)
	app.use('/api/auth', auth)
	app.use('/api/locations', locations)
	app.use('/api/app', deskaf)
	app.use('/api/stock', stock)
	app.use('/api/job', job)
	app.use('/api/move', move)
	app.use(error)
}