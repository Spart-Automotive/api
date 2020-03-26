
const config = require('../config')
const Joi = require('joi')
const mongoose = require('mongoose')
const _ = require('lodash')
const deskafSchema = new mongoose.Schema({
	background: {
		type: String,
		required: true,
		minlength: 1,
		maxlength: 2000,
		default: '/background.jpg'
	},
	background_redirect: {
		type: Object,
		required: true,
		minlength: 1,
		maxlength: 2000,
		default: {
			url: null,
			placeholder: null,
			caption: null,
			btn_style: null
		}
	},
	facebook: {
		type: String,
		minlength: 5,
		maxlength: 255,
		default: 'https://www.facebook.com/'
	},
	twitter: {
		type: String,
		minlength: 5,
		maxlength: 255,
		default: 'https://twitter.com/'
	},
	instagram: {
		type: String,
		minlength: 5,
		maxlength: 255,
		default: 'https://www.instagram.com/'
	},
	socialmedia: {
		type: Object,
		minlength: 5,
		maxlength: 255,
		default: null
	},
	currency: {
		type: String,
		default: 'LE'
	},
	title: {
		type: String,
		default: 'Techno Service'
	},
	subtitle: {
		type: String,
		default: 'Egypt'
	},
	address: {
		type: String,
		default: '9 Mohamed Refaat, El nozha el gededa'
	},
	phones: {
		type: Array,
		default: ['01008645544']
	},
	promotions: {
		type: Array,
		default: []
	}
})


const Spart = mongoose.model('Spart', deskafSchema)

function validateSpart(deskaf) {
	const schema = {
		background: Joi.string().min(1).max(2000),
		background_redirect: Joi.object(),
		facebook: Joi.string().min(5).max(255),
		twitter: Joi.string().min(5).max(255),
		instagram: Joi.string().min(5).max(255),
		socialmedia: Joi.optional(),
		phones: Joi.optional(),
		address: Joi.optional(),
		promotions: Joi.optional(),
		title: Joi.optional(),
		subtitle: Joi.optional(),
		currency: Joi.optional(),
	}
	return Joi.validate(deskaf, schema)
}

exports.Spart = Spart 
exports.validate = validateSpart