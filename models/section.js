
const config = require('../config')
const Joi = require('joi')
const mongoose = require('mongoose')
const _ = require('lodash')
const sectionSchema = new mongoose.Schema({
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


const Section = mongoose.model('Section', sectionSchema)

function validateSection(deskaf) {
	const schema = {
		image: Joi.string().min(1).max(2000),
		name: Joi.optional(),
		about: Joi.optional(),
		vehicles: Joi.optional(),
		keywords: Joi.optional()
	}
	return Joi.validate(deskaf, schema)
}

exports.Section = Section 
exports.validateSection = validateSection