
const mongoose = require('mongoose');

const imgSchema = new mongoose.Schema({
    _id: { type: mongoose.Types.ObjectId },
    data: { type: Buffer, required: true },
    contentType: { type: String, required: true }
});

// const ProductImg = mongoose.model('ProductImg', imgSchema);

const productSchema = new mongoose.Schema({
    // _id: { type: mongoose.Types.ObjectId },
    name: { type: String, required: true },
    price: { type: String, required: true },
    quantity: { type: Number, required: true },
    mainImg: { type: imgSchema, required: true },
    imgs: { type: [imgSchema], required: true },
    soldOut: { type: Boolean, required: true },
    sizes: { type: String, required: true },
    category: { type: String, required: true }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;