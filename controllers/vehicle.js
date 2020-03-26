const path = require('path')
const mime = require('mime-types')
const fs = require('fs')
const {Vehicle, validateVehicle} = require('../models/vehicle')
const { uploadVehicleImage } = require('../middleware/multer')
const deliverError = require('../resources/errors')
const Getters = require('../plugins/getters')


const generateFileName = (req, file, data) => {
	return [
		path.parse(file.originalname).name,
		'-',
		data,
		path.extname(file.originalname)
	].join('')
}

const getFilePath = name => path.resolve(`storage/vehicle/${name}`)
//
module.exports = {
	// Get
	async getAll(req, res) {
		try {
			const vehicles = await Vehicle.find({})
			const result = {
				vehicles
			}
			return res.send(result)
		} catch (err) {
			return deliverError(res, 500, 'somethingWentWrong', err)
		}
	},
	async getOne(req, res) {
		try {
			const vehicle = await Vehicle.findById(req.params.id)
			if (!vehicle)
				return deliverError(res, 404, 'vehicleNotFound')
			return res.send(vehicle)
		} catch (err) {
			return deliverError(res, 500, 'somethingWentWrong', err)
		}
	},
	// Add Client Deskaf
	async add(req, res) {
		const { error } = validateVehicle(req.body) 
		if (error) return deliverError(res, 400, 'validationError', error.details[0].message)
		const repeated = await Vehicle.find({ name: req.body.name })
	    console.log(repeated, { name: req.body.name })
	    if (repeated && repeated.length)
	    	return deliverError(res, 400, 'vehicleExists')
		const vehicle = new Vehicle(res.body)
		await vehicle.save()
		return res.send(vehicle)

	},
	// Update deskaf

	async update(req, res) {
		const { error } = validate(req.body, true) 
		if (error) return res.status(400).send(error.details[0].message)
		const deskaf = await Deskaf.update(
			{ },
			{$set: req.body},
			{ multi: true , new : true }
		)
		res.send(appSpecs[0])
	},

	/// Add Vehicle VehicleImage

	async addVehicleImage(req, res) {
		// const { error } = validateId(req.params)
		// if (error) return deliverError(res, 400, 'validationError', error.details[0].message)

		const vehicle = await Vehicle.findById(req.params.id)
		if (!vehicle) {
			return deliverError(res, 400, 'vehicleNotFound')
		}
		// Remove The Old VehicleImage
		if(vehicle.image) {
			fs.unlink(getFilePath(vehicle.image), err => {
				if (err) {
					return deliverError(res, 500, 'somethingWentWrong')
				}
			})
		}
		const filename = (req, file, cb) => {
			cb(null, generateFileName(req, file ,vehicle._id))
		}
		uploadVehicleImage({filename}).single('file')(req, res, async error => {
			if (error) {
				return deliverError(res, 500, 'somethingWentWrong')
			}
			if (!req.file) {
				return deliverError(res, 500, 'noFileSelected')
			}
			const image = generateFileName(req, req.file,vehicle._id)
			const updated = await Vehicle.findOneAndUpdate(
				{_id: req.params.id},
				{
					$set: { image }
				},
				{
					new: true
				}
			)
			return res.send(updated)
		})
	},

	// Remove VehicleImage

	async removeVehicleImage(req, res) {
		// const { error } = validateId(req.params)
		// if (error) return res.status(400).send(error.details[0].message)

		const vehicle = await Vehicle.findById(req.params.id)
		if (!vehicle) {
			return deliverError(res, 404, 'vehicleNotFound')
		}
		// Remove The Old VehicleImage
		if(vehicle.image) {
			fs.unlink(getFilePath(vehicle.image), err => {
				if (err) {
					return deliverError(res, 500, 'somethingWentWrong')
				}
			})
		} else {
			return deliverError(res, 500, 'noVehicleImageFound')
		}
		const updated = await Vehicle.findOneAndUpdate(
			req.params.id,
			{
				$set: { image: null }
			},
			{
				new: true
			}
		)
		return res.send(updated)
	},

	// Get Vehicle VehicleImage

	async getVehicleImage(req, res) {
		// const { error } = validateId(req.params)
		// if (error) return res.status(400).send(error.details[0].message)
		const vehicle = await Vehicle.findById(req.params.id)
		if (!vehicle) {
			return deliverError(res, 404, 'vehicleNotFound')
		}
		if(vehicle.image) {
			return res.set({
				'Content-Type': mime.lookup(path.extname(vehicle.image)),	
				'Content-Disposition': `inline; filename="${vehicle.name}${path.extname(vehicle.image)}"`
			}).sendFile(getFilePath(vehicle.image))
		} 

		return deliverError(res, 404, 'noVehicleImageFound')
	}

}
