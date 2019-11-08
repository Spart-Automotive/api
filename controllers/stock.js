const _ = require('lodash')
const moment = require('moment')


const config = require('../config')
const { Stock } = require('../models/stock')

// Sortable Attributes  
const sortableAttributes = ['timein', 'sales', 'price']
// Validate Sort Key
const validSort = val => (sortableAttributes.indexOf(val) !== -1) ? val : false

const handleSpecialChars = val => val.replace(/[!@#$%^&*(),.?":{}|<>+-]/, t => `\\${t}`)

module.exports = {
	async getAll(req, res) {
		const page = req.query.page ? parseInt(req.query.page, 10) : 0
		const sort = validSort(req.query.sort) || 'timein'
		const date = req.query.date ? req.query.date.split(',').map(d => (d && d.length ? d : null)) : null
		const price = req.query.price ? req.query.price.split(',').map(d => (d ? parseInt(d, 10) : null)) : null
		const desc = req.query.desc && req.query.desc !== 'yes' ? 1 : -1
		const stats = !!(req.query.stats && req.query.stats === 'yes')
		const external = !!(req.query.external && req.query.external === 'yes')
		const ignoreExternal = !!(req.query.ignore_external && req.query.ignore_external === 'yes')
		const phone = req.query.phone || null
		const vendorName = req.query.vendor_name || null
		const brand = req.query.brand ? req.query.brand.split(',').map(d => (d && d.length ? d : null)) : null
		const model = req.query.model ? req.query.model.split(',').map(d => (d && d.length ? d : null)) : null
		const release = req.query.release ? req.query.release.split(',').map(d => (d && d.length ? d : null)) : null
		const modelac = req.query.modelac || null
		const brandac = req.query.brandac || null
		const part = req.query.part || null
		const status = req.query.status ? req.query.status : null
		const limit = req.query.limit ? parseInt(req.query.limit, 10) : 5
		const select = req.query.select ? req.query.select.split(',').join(' ') : null
		const filters = { }
		if (!ignoreExternal) {
			filters.external = external
		}
		if (phone && phone.length) {
			filters['vendor.phone'] = {  $regex: new RegExp( handleSpecialChars(phone), 'i') }
		}
		if (vendorName && vendorName.length) {
			filters['vendor.name'] = {  $regex: new RegExp( handleSpecialChars(vendorName), 'i') }
		}
		if (date) {
			if (date.length === 2) {
				if (date[0])
					filters.created_at = { $gte: new Date(date[0]) }
				if (date[1])
					filters.created_at = date[0] ? { ...filters.timein, $lte: new Date(date[1]) } : { $lte: new Date(date[1]) }
			}
		}
		if (brandac && brandac.length) {
			filters['car_compatibility.brand'] = {  $regex: new RegExp( handleSpecialChars(brandac), 'i') }
		} else if (brand && brand.length) {
				filters['car_compatibility.brand'] = { $in : brand }
		}

		if (modelac && modelac.length) {
			filters['car_compatibility.model'] = {  $regex: new RegExp( handleSpecialChars(modelac), 'i') }
		} else if (model && model.length) {
				filters['car_compatibility.model'] = { $in : model }
		}
		if (release && release.length) {
				filters['car_compatibility.release'] = { $in : release }
		}
		if (part && part.length) {
			filters['name'] = { $regex: new RegExp( handleSpecialChars(part), 'i') } 
		}
		if (status) {
			filters.status = status
		}
		if (price) {
			if (price.length === 2) {
				filters['price'] = {}
				if (price[0])
					filters['price'].$gte = price[0]
				if (price[1])
					filters['price'].$lte = price[1]
			}
		}

		const count = await Stock.find(filters)
		const pages = Math.ceil(count.length / limit, 10)
		const sorter = {}
		sorter[sort] = desc
		try {
			const stock = stats ? null : await Stock.find(filters)
		    .select(select)
				.skip(page * limit)
				.limit(limit)
				.sort(sorter)
			const result = {
				stock: stats ? count : stock,
				page : stats ? null : page,
				pages : stats ? null : pages,
				limit : stats ? null : limit ,
				stats,
				// filters,
				totalPrice: _.sumBy(count, p => p.price)
			}
			return res.send(result)
		} catch(err) {
			return res.status(500).send(err)
		}
	},

	async add(req, res) {

			stock = new Stock({...req.body})
			await stock.save()
			return res.send(stock)
	},


	// Per One
	async getOne(req, res) {

		if (!req.params.id || !req.params.id.length) return res.status(400).send('Stock number is required')

		const stock = await Stock.findOne({_id: req.params.id})
		if (!stock) {
			return res.status(404).send('Stock Not Found')
		}
		res.send(stock)
	},

	async update(req, res) {
		// const { error } = ValidateStock(req.body, true) 
		// if (error) return res.status(400).send(error.details[0].message)
		const updated = await Stock.findOneAndUpdate(
			{_id: req.params.id},
			{
				$set: req.body 
			},
			{
				new: true
			}
		)
		if (!updated) {
			return res.status(404).send('Stock Not Found')
		}
		return res.send(updated)
	},
	async deleteStock(req, res) {
		const job = await Stock.findById(req.params.id)
		if (!job) {
			return res.status(404).send('Stock Not Found')
		}
		Stock.deleteOne({ _id: req.params.id }, function(err) {
				   return res.send('Deleted')
		})
	}
}