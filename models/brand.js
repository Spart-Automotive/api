
const config = require('../config')
const Joi = require('joi')
const mongoose = require('mongoose')
const _ = require('lodash')
const brandSchema = new mongoose.Schema({
	image: {
		type: String,
		required: true,
		minlength: 1,
		maxlength: 2000,
		default: null
	},
	name: {
		type: String,
		default: 'Item Based'
	},
	about: {
		type: String,
		default: 'Spare Parts'
	},
	vehicles: {
		type: Array,
		default: []
	},
	keywords: {
		type: Array,
		default: []
	}
})


const Brand = mongoose.model('Brand', brandSchema)

function validateBrand(brand) {
	const schema = {
		image: Joi.string().min(1).max(2000),
		name: Joi.optional(),
		about: Joi.optional(),
		vehicles: Joi.optional(),
		keywords: Joi.optional()
	}
	return Joi.validate(brand, schema)
}

exports.Brand = Brand 
exports.validateBrand = validateBrand