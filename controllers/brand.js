const path = require('path')
const mime = require('mime-types')
const fs = require('fs')
const {Brand, validateBrand} = require('../models/brand')
const { uploadBrandImage } = require('../middleware/multer')
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

const getFilePath = name => path.resolve(`storage/brand/${name}`)
//
module.exports = {
	// Get
	async getAll(req, res) {
		try {
			const brands = await Brand.find({})
			const result = {
				brands
			}
			return res.send(result)
		} catch (err) {
			return deliverError(res, 500, 'somethingWentWrong', err)
		}
	},
	async getOne(req, res) {
		try {
			const brand = await Brand.findById(req.params.id)
			if (!brand)
				return deliverError(res, 404, 'brandNotFound')
			return res.send(brand)
		} catch (err) {
			return deliverError(res, 500, 'somethingWentWrong', err)
		}
	},
	// Add Client Deskaf
	async add(req, res) {
		const { error } = validateBrand(req.body) 
		if (error) return deliverError(res, 400, 'validationError', error.details[0].message)
		const repeated = await Brand.find({ name: req.body.name })
	    console.log(repeated, { name: req.body.name })
	    if (repeated && repeated.length)
	    	return deliverError(res, 400, 'brandExists')
		const brand = new Brand(res.body)
		await brand.save()
		return res.send(brand)

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

	/// Add Brand BrandImage

	async addBrandImage(req, res) {
		// const { error } = validateId(req.params)
		// if (error) return deliverError(res, 400, 'validationError', error.details[0].message)

		const brand = await Brand.findById(req.params.id)
		if (!brand) {
			return deliverError(res, 400, 'brandNotFound')
		}
		// Remove The Old BrandImage
		if(brand.image) {
			fs.unlink(getFilePath(brand.image), err => {
				if (err) {
					return deliverError(res, 500, 'somethingWentWrong')
				}
			})
		}
		const filename = (req, file, cb) => {
			cb(null, generateFileName(req, file ,brand._id))
		}
		uploadBrandImage({filename}).single('file')(req, res, async error => {
			if (error) {
				return deliverError(res, 500, 'somethingWentWrong')
			}
			if (!req.file) {
				return deliverError(res, 500, 'noFileSelected')
			}
			const image = generateFileName(req, req.file,brand._id)
			const updated = await Brand.findOneAndUpdate(
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

	// Remove BrandImage

	async removeBrandImage(req, res) {
		// const { error } = validateId(req.params)
		// if (error) return res.status(400).send(error.details[0].message)

		const brand = await Brand.findById(req.params.id)
		if (!brand) {
			return deliverError(res, 404, 'brandNotFound')
		}
		// Remove The Old BrandImage
		if(brand.image) {
			fs.unlink(getFilePath(brand.image), err => {
				if (err) {
					return deliverError(res, 500, 'somethingWentWrong')
				}
			})
		} else {
			return deliverError(res, 500, 'noBrandImageFound')
		}
		const updated = await Brand.findOneAndUpdate(
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

	// Get Brand BrandImage

	async getBrandImage(req, res) {
		// const { error } = validateId(req.params)
		// if (error) return res.status(400).send(error.details[0].message)
		const brand = await Brand.findById(req.params.id)
		if (!brand) {
			return deliverError(res, 404, 'brandNotFound')
		}
		if(brand.image) {
			return res.set({
				'Content-Type': mime.lookup(path.extname(brand.image)),	
				'Content-Disposition': `inline; filename="${brand.name}${path.extname(brand.image)}"`
			}).sendFile(getFilePath(brand.image))
		} 

		return deliverError(res, 404, 'noBrandImageFound')
	}

}
