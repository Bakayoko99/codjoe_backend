const orderModel = require('../models/orderModel');
const userModel = require('../models/userModel');
const productModel = require('../models/productModel');

const createOrder = async (req, res) => {
    try {
        const userID = req.params.userID;
        const { items, subtotal, shippingFee, total, paymentIntentId, shippingAddress } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No items in the order' });
        }

        const user = await userModel.findById(userID);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const newOrder = new orderModel({
            userId: userID,
            items,
            subtotal,
            shippingFee: shippingFee || 5.99,
            total,
            paymentIntentId,
            paymentStatus: 'completed',
            shippingAddress: shippingAddress || {
                firstName: user.firstName,
                lastName: user.lastName,
                address: user.address,
                country: user.country
            }
        });

        await newOrder.save();

        user.orders.push(newOrder._id);
        
        user.shoppingCart = [];
        
        await user.save();

        res.status(201).json({ 
            message: 'Order created successfully', 
            order: newOrder 
        });

    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: error.message });
    }
};

const getUserOrders = async (req, res) => {
    try {
        const userID = req.params.userID;

        const user = await userModel.findById(userID).populate('orders');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const orders = await orderModel
            .find({ userId: userID })
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({ 
            data: orders,
            count: orders.length 
        });

    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: error.message });
    }
};

const getOrderById = async (req, res) => {
    try {
        const { orderID } = req.params;

        const order = await orderModel.findById(orderID).lean();
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json({ data: order });

    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: error.message });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { orderID } = req.params;
        const { status } = req.body;

        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const order = await orderModel.findByIdAndUpdate(
            orderID, 
            { status, updatedAt: Date.now() },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json({ 
            message: 'Order status updated', 
            order 
        });

    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ message: error.message });
    }
};

const cancelOrder = async (req, res) => {
    try {
        const { orderID } = req.params;

        const order = await orderModel.findById(orderID);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        if (order.status === 'shipped' || order.status === 'delivered') {
            return res.status(400).json({ 
                message: 'Cannot cancel order that has been shipped or delivered' 
            });
        }

        order.status = 'cancelled';
        order.updatedAt = Date.now();
        await order.save();

        res.status(200).json({ 
            message: 'Order cancelled successfully', 
            order 
        });

    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    createOrder, 
    getUserOrders, 
    getOrderById, 
    updateOrderStatus, 
    cancelOrder 
};
