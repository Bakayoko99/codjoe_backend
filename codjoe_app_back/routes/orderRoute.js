const express = require('express');
const { createOrder, getUserOrders, getOrderById, updateOrderStatus, cancelOrder } = require('../controllers/orderController');
const { verifyToken } = require('../middlewares/verifyToken');

const router = express.Router();

router.post('/users/:userID/orders/create', verifyToken, createOrder);
router.get('/users/:userID/orders', verifyToken, getUserOrders);
router.get('/orders/:orderID', verifyToken, getOrderById);
router.put('/orders/:orderID/status', verifyToken, updateOrderStatus);
router.put('/orders/:orderID/cancel', verifyToken, cancelOrder);

module.exports = router;
