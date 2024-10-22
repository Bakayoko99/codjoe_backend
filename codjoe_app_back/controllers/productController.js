
const productModel = require('../models/productModel');
const categoryModel = require('../models/categoryModel');

const getProducts = async (req, res) => {
    try {
        const products = await productModel.find({});
        res.json(products);
    } catch (error) {
        res.json({ message: error.message });
    }
}

const getProductById = async (req, res) => {

    try {
        const productId = req.params.id
        const product = await productModel.findById(productId)

        if (product === null) {
            res.json({ message: 'product not found' })
        }

        res.json(product)
    } catch (error) {
        res.json({ message: 'getProductById error' })
    }

}

const addProduct = async (req, res) => {

    if (!req.files) {
        return res.status(400).send('No images were uploaded.');
    }

    const mainImg = {
        data: req.files['mainImg'][0].buffer,
        contentType: req.files['mainImg'][0].mimetype
    }

    const imgs = [];

    req.files['imgs'].forEach(img => {

        imgs.push({
            data: img.buffer,
            contentType: img.mimetype
        });

    });

    const product = new productModel({
        name: req.body.name,
        price: req.body.price,
        quantity: req.body.quantity,
        mainImg: mainImg,
        imgs: imgs,
        soldOut: req.body.soldOut,
        sizes: req.body.sizes,
        category: req.body.category.toLowerCase()
    });

    try {
        const newProduct = await product.save();
        const category = await categoryModel.findOne({ name: req.body.category.toLowerCase() });
        category.products.push(newProduct._id);
        await category.save();
        res.json(newProduct);
    } catch (error) {
        res.json({ message: error.message });
    }
}

const deleteProduct = async (req, res) => {
    try {
        const product = await productModel.findById(req.params.id);
        const category = await categoryModel.findOne({ name: product.category });
        category.products = category.products.filter(prod => prod != req.params.id);
        await category.save();
        await productModel.findByIdAndDelete(req.params.id);
        res.json('Product deleted');
    } catch (error) {
        res.json({ message: error.message });
    }
}

module.exports = { getProducts, addProduct, deleteProduct, getProductById };