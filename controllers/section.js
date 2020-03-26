const path = require('path')
const mime = require('mime-types')
const fs = require('fs')
const {Section, validateSection} = require('../models/section')
const { uploadSectionImage } = require('../middleware/multer')
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

const getFilePath = name => path.resolve(`storage/background/${name}`)
//
module.exports = {
	// Get
	async getAll(req, res) {
		try {
			const filters = Getters.build(req.query, {
				name: {
					extractor: 'string',
					resolver: 'search'
				}
			})
			const sections = await Section.find(filters)
			const result = {
				sections,
				filters
			}
			return res.send(result)
		} catch (err) {
			return deliverError(res, 500, 'somethingWentWrong', err)
		}
	},
	async getOne(req, res) {
		try {
			const section = await Section.findById(req.params.id)
			if (!section)
				return deliverError(res, 404, 'sectionNotFound')
			return res.send(section)
		} catch (err) {
			return deliverError(res, 500, 'somethingWentWrong', err)
		}
	},
	// Add Client Deskaf
	async add(req, res) {
		const { error } = validateSection(req.body) 
		if (error) return deliverError(res, 400, 'validationError', error.details[0].message)
		const repeated = await Section.find({ name: req.body.name })
	    console.log(repeated, { name: req.body.name })
	    if (repeated && repeated.length)
	    	return deliverError(res, 400, 'sectionExists')
		const section = new Section(res.body)
		await section.save()
		return res.send(section)

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

	/// Add Section SectionImage

	async addSectionImage(req, res) {
		// const { error } = validateId(req.params)
		// if (error) return deliverError(res, 400, 'validationError', error.details[0].message)

		const section = await Section.findById(req.params.id)
		if (!section) {
			return deliverError(res, 400, 'sectionNotFound')
		}
		// Remove The Old SectionImage
		if(section.image) {
			fs.unlink(getFilePath(section.image), err => {
				if (err) {
					return deliverError(res, 500, 'somethingWentWrong')
				}
			})
		}
		const filename = (req, file, cb) => {
			cb(null, generateFileName(req, file ,section._id))
		}
		uploadSectionImage({filename}).single('file')(req, res, async error => {
			if (error) {
				return deliverError(res, 500, 'somethingWentWrong')
			}
			if (!req.file) {
				return deliverError(res, 500, 'noFileSelected')
			}
			const image = generateFileName(req, req.file,section._id)
			const updated = await Section.findOneAndUpdate(
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

	// Remove SectionImage

	async removeSectionImage(req, res) {
		// const { error } = validateId(req.params)
		// if (error) return res.status(400).send(error.details[0].message)

		const section = await Section.findById(req.params.id)
		if (!section) {
			return deliverError(res, 404, 'sectionNotFound')
		}
		// Remove The Old SectionImage
		if(section.image) {
			fs.unlink(getFilePath(section.image), err => {
				if (err) {
					return deliverError(res, 500, 'somethingWentWrong')
				}
			})
		} else {
			return deliverError(res, 500, 'noSectionImageFound')
		}
		const updated = await Section.findOneAndUpdate(
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

	// Get Section SectionImage

	async getSectionImage(req, res) {
		// const { error } = validateId(req.params)
		// if (error) return res.status(400).send(error.details[0].message)
		const section = await Section.findById(req.params.id)
		if (!section) {
			return deliverError(res, 404, 'sectionNotFound')
		}
		if(section.image) {
			return res.set({
				'Content-Type': mime.lookup(path.extname(section.image)),	
				'Content-Disposition': `inline; filename="${section.name}${path.extname(section.image)}"`
			}).sendFile(getFilePath(section.image))
		} 

		return deliverError(res, 404, 'noSectionImageFound')
	}

}
