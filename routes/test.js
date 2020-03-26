const auth = require('../middleware/auth')
const express = require('express')
const router = express.Router()
const jobController = require('../controllers/test')

// Get
router.get('/' , jobController.getAll)

// Get One
router.get('/:id' , auth('jobs') ,jobController.getOne)

// Register
router.post('/', auth('jobs') ,jobController.add)

// Update
router.put('/:id' , auth('jobs') ,jobController.update)

// Delete
router.delete('/:id' , auth('jobs'),jobController.deleteJob)

module.exports = router 
