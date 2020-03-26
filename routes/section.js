const auth = require('../middleware/auth')
const express = require('express')
const router = express.Router()
const appController = require('../controllers/section')

// Get
router.get('/' ,appController.getAll)

// Get one
router.get('/:id' ,appController.getOne)

// Register
router.post('/', auth('admin') ,appController.add)

// Update
router.put('/' , auth('admin') ,appController.update)

// Add SectionImage
router.put('/:id/image' , auth('admin') ,appController.addSectionImage)

// Get SectionImage
router.get('/:id/image' ,appController.getSectionImage)

// Delete SectionImage
router.delete('/:id/image' , auth('admin'),appController.removeSectionImage)

module.exports = router 
