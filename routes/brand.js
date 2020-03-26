const auth = require('../middleware/auth')
const express = require('express')
const router = express.Router()
const brandController = require('../controllers/brand')

// Get
router.get('/' ,brandController.getAll)

// Get one
router.get('/:id' ,brandController.getOne)

// Register
router.post('/', auth('admin') ,brandController.add)

// Update
router.put('/' , auth('admin') ,brandController.update)

// Add BrandImage
router.put('/:id/image' , auth('admin') ,brandController.addBrandImage)

// Get BrandImage
router.get('/:id/image' ,brandController.getBrandImage)

// Delete BrandImage
router.delete('/:id/image' , auth('admin'),brandController.removeBrandImage)

module.exports = router 
