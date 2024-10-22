
const express = require('express');

const router = express.Router();

const { getUserCartItems, addNewCartItems, removeCartItems } = require('../controllers/userController');


router.get('/:userID/cart', getUserCartItems)

router.post('/:userID/cart/add', addNewCartItems)

router.post('/:userID/cart/remove', removeCartItems)




module.exports = router;