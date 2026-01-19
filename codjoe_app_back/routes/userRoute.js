
const express = require('express');

const router = express.Router();

const { getUserCartItems, addNewCartItems, removeCartItems, updateCartItemQuantity, updateCartItemSize } = require('../controllers/userController');


router.get('/:userID/cart', getUserCartItems)

router.post('/:userID/cart/add', addNewCartItems)

router.post('/:userID/cart/remove', removeCartItems)

router.post('/:userID/cart/update-quantity', updateCartItemQuantity)

router.post('/:userID/cart/update-size', updateCartItemSize)




module.exports = router;