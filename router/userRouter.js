const express = require('express')
const router = express.Router()
const {userController } =require('../controler')


router.post('/register' , userController.register )
router.get('/login', userController.login)
router.put('/verify', userController.verification)
router.get('/users', userController.getUsers)


module.exports = router