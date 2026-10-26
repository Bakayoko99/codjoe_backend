const mongoose = require('mongoose');


const shoppingCartSchema = new mongoose.Schema({
    productId: { type: mongoose.Types.ObjectId, required: true },
    size: { type: String, required: true },
    quantity: { type: Number, required: true }
});

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    address: { type: String, required: false },
    // telephone: { type: Number, unique: true, required: false },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    country: { type: String, required: true},
    birthday: { type: Date, required: true},
    role: { type: String, default: 'user' },
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, default: null },
    consentDate: { type: Date, default: null },
    shoppingCart: { type: [shoppingCartSchema], required: false },
    orders: [{ type: mongoose.Types.ObjectId, ref: 'Order' }],
    createdAt: { type: Date, default: Date.now }
});

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;