const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    productPrice: { type: Number, required: true },
    size: { type: String, required: true },
    quantity: { type: Number, required: true },
    subtotal: { type: Number, required: true } // price * quantity
});

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    orderNumber: { type: String, unique: true },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, required: true, default: 5.99 },
    total: { type: Number, required: true },
    status: { 
        type: String, 
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], 
        default: 'pending' 
    },
    paymentStatus: { 
        type: String, 
        enum: ['pending', 'completed', 'failed', 'refunded'], 
        default: 'pending' 
    },
    paymentIntentId: { type: String, required: false },
    shippingAddress: {
        firstName: { type: String, required: false },
        lastName: { type: String, required: false },
        address: { type: String, required: false },
        city: { type: String, required: false },
        country: { type: String, required: false },
        postalCode: { type: String, required: false }
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// numéro de commande unique
orderSchema.pre('save', function(next) {
    if (!this.orderNumber) {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 7).toUpperCase();
        this.orderNumber = `COD-${timestamp}-${random}`;
    }
    this.updatedAt = Date.now();
    next();
});

const orderModel = mongoose.model('Order', orderSchema);

module.exports = orderModel;
