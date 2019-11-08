const _ = require('lodash')
const moment = require('moment')
require('moment-timezone')

const config = require('../config')
const { Job, ValidateJob } = require('../models/job')
const { Move } = require('../models/move')
const { Stock } = require('../models/stock')
const { Deskaf } = require('../models/app')

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
		const job_no = req.query.job_no && req.query.job_no.length ? parseInt(req.query.job_no) : null
		const phone = req.query.phone || null
		const name = req.query.name || null
		const brand = req.query.brand || null
		const model = req.query.model || null
		const part = req.query.part || null
		const status = req.query.status ? req.query.status : null
		const limit = req.query.limit ? parseInt(req.query.limit, 10) : 5
		const select = req.query.select ? req.query.select.split(',').join(' ') : null
		const filters = {}
		if (job_no && typeof job_no === 'number') {
			filters.job_no = parseInt(job_no, 10)
		}
		if (phone && phone.length) {
			filters['client.phone'] = {  $regex: new RegExp( handleSpecialChars(phone), 'i') }
		}
		if (name && name.length) {
			filters['client.name'] = {  $regex: new RegExp( handleSpecialChars(name), 'i') }
		}
		if (brand && brand.length) {
			filters['car.brand'] = {  $regex: new RegExp( handleSpecialChars(brand), 'i') }
		}
		if (model && model.length) {
			filters['car.model'] = {  $regex: new RegExp( handleSpecialChars(model), 'i') }
		}
		if (part && part.length) {
			filters['operations.part'] = { $regex: new RegExp( handleSpecialChars(part), 'i') } 
		}
		if (status) {
			filters.status = status
		}
		if (date) {
			if (date.length === 2) {
				if (date[0])
					filters.timein = { $gte: new Date(date[0]) }
				if (date[1])
					filters.timein = date[0] ? { ...filters.timein, $lte: new Date(date[1]) } : { $lte: new Date(date[1]) }
			}
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

		const count = await Job.find(filters)
		const pages = Math.ceil(count.length / limit, 10)
		const sorter = {}
		sorter[sort] = desc
		try {
			const jobs = stats ? null : await Job.find(filters)
		    .select(select)
				.skip(page * limit)
				.limit(limit)
				.sort(sorter)
			const result = {
				jobs: stats ? count : jobs,
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
		const { error } = ValidateJob(req.body) 
		if (error) return res.status(400).send(error.details[0].message)
		const instance = await Deskaf.find({})
	    const job_no = instance && instance[0].jobs_count ? instance[0].jobs_count : 0
	    const price = _.sumBy(req.body.operations, operation => ((operation.price + operation.fees) * operation.count))
	    await Deskaf.updateMany({}, { $set: { jobs_count: job_no + 1 } })
		job = new Job({...req.body, job_no, price ,timein: moment.tz('UTC').toDate()})
		await job.save()
		// Update Moves
		if (req.body.operations && req.body.operations.length) {
			let i
			let move
			for (i = 0; i < req.body.operations.length; i += 1) {
				if (req.body.operations[i].makeMove) {
					move = new Move({
						...req.body.operations[i],
						...job
					})
					await move.save()
				}
			}
		} 
		
		return res.send(job)
	},


	// Per One
	async getOne(req, res) {

		if (!req.params.id || !req.params.id.length) return res.status(400).send('Job number is required')

		const job = await Job.findOne({job_no: parseInt(req.params.id, 10)})
		if (!job) {
			return res.status(404).send('Job Not Found')
		}
		res.send(job)
	},

	async update(req, res) {
		const { error } = ValidateJob(req.body, true) 
		if (error) return res.status(400).send(error.details[0].message)
		const price = _.sumBy(req.body.operations, operation => ((operation.price + operation.fees) * operation.count))
		let payload = { ...req.body, price }
		if (payload.status && payload.status.toLowerCase() === 'finished') {
			payload.timeleave = moment.tz('UTC').toDate()
		}
		const updated = await Job.findOneAndUpdate(
			{_id: req.params.id},
			{
				$set: payload 
			},
			{
				new: true
			}
		)
		if (!updated) {
			return res.status(404).send('Job Not Found')
		}
		// Delete Last Moves
		const lastMoves = await Move.find({ 'job.job_no': updated.job_no })
		let m
		for (m = 0; m < lastMoves.length; m += 1) {
			if (lastMoves[m].item.makeMove) {
				await Stock.findOneAndUpdate(
						{ _id:  lastMoves[m].item._id },
						{ 
							$inc: { count:  lastMoves[m].count } 
						}
					)
			}
			await Move.deleteOne({ '_id': lastMoves[m]._id })
		}
		// Update Moves
		if (req.body.operations && req.body.operations.length) {
			let i
			let move
			for (i = 0; i < req.body.operations.length; i += 1) {
				if (req.body.operations[i].makeMove) {
					move = await new Move({
						item: req.body.operations[i],
						job: _.pick(updated, ['_id', 'job_no', 'timein', 'timeleave', 'car', 'client']),
						count: req.body.operations[i].count,
						price: req.body.operations[i].count * req.body.operations[i].price
					})
					await move.save()
					// Decreament Stock
					await Stock.findOneAndUpdate(
						{ _id:  req.body.operations[i]._id },
						{ $inc: { count:  req.body.operations[i].count * -1 } }
					)
				}
			}
		} 
		return res.send(updated)
	},
	async deleteJob(req, res) {
		const job = await Job.findById(req.params.id)
		if (!job) {
			return res.status(404).send('Job Not Found')
		}
		Job.deleteOne({ _id: req.params.id }, function(err) {
				   return res.send('Deleted')
		})
	}
}
