const auth = require('../middleware/auth')
const express = require('express')
const router = express.Router()
const vehicleController = require('../controllers/vehicle')

// Get
router.get('/' ,vehicleController.getAll)

// Get one
router.get('/:id' ,vehicleController.getOne)

// Register
router.post('/', auth('admin') ,vehicleController.add)

// Update
router.put('/' , auth('admin') ,vehicleController.update)

// Add VehicleImage
router.put('/:id/image' , auth('admin') ,vehicleController.addVehicleImage)

// Get VehicleImage
router.get('/:id/image' ,vehicleController.getVehicleImage)

// Delete VehicleImage
router.delete('/:id/image' , auth('admin'),vehicleController.removeVehicleImage)

module.exports = router 
