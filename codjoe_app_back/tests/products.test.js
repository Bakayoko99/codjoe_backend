/**
 * @file products.test.js
 * @description Tests unitaires et fonctionnels pour les routes produits
 * Couvre : GET /api/products, GET /api/products/:id, DELETE /api/products/delete/:id
 */

const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../app');
const dbHandler = require('./helpers/dbHandler');
const productModel = require('../models/productModel');
const categoryModel = require('../models/categoryModel');
const userModel = require('../models/userModel');
const config = require('../config');

const getAdminToken = async () => {
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash('Secr3t!Pass', salt);
    const admin = await userModel.create({
        firstName: 'Admin',
        lastName: 'CODJOE',
        email: 'admin-products@codjoe.com',
        password: hashed,
        country: 'France',
        birthday: new Date('1985-01-01'),
        role: 'admin'
    });
    return jwt.sign({ user: { id: admin._id, role: admin.role } }, config.key, { expiresIn: 3600 });
};

// ----- Setup / Teardown -----

beforeAll(async () => {
    await dbHandler.connect();
});

afterEach(async () => {
    await dbHandler.clearDatabase();
});

afterAll(async () => {
    await dbHandler.closeDatabase();
});

// ---- Seed helper ----

const seedProduct = async (overrides = {}) => {
    let category = await categoryModel.findOne({ name: 'test' });
    if (!category) {
        category = await categoryModel.create({ name: 'test', products: [] });
    }
    const product = await productModel.create({
        name: 'T-Shirt Test',
        price: '29.99',
        quantity: 10,
        mainImg: { data: Buffer.from('img'), contentType: 'image/jpeg' },
        imgs: [],
        sizes: 'S,M,L',
        soldOut: false,
        category: 'test',
        ...overrides
    });
    category.products.push(product._id);
    await category.save();
    return product;
};

// ================================================
// TESTS FONCTIONNELS — GET /api/products
// ================================================

describe('[FONCTIONNELS] GET /api/products', () => {

    test('Doit retourner un tableau vide si aucun produit', async () => {
        const res = await request(app).get('/api/products');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(0);
    });

    test('Doit retourner la liste des produits', async () => {
        await seedProduct({ name: 'Produit A' });
        await seedProduct({ name: 'Produit B' });
        const res = await request(app).get('/api/products');
        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(2);
    });

    test('Chaque produit doit avoir les champs requis', async () => {
        await seedProduct();
        const res = await request(app).get('/api/products');
        const product = res.body[0];
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('price');
        expect(product).toHaveProperty('category');
    });

});

// ================================================
// TESTS FONCTIONNELS — GET /api/products/:id
// ================================================

describe('[FONCTIONNELS] GET /api/products/:id', () => {

    test('Doit retourner le bon produit par ID', async () => {
        const product = await seedProduct({ name: 'Produit Unique' });
        const res = await request(app).get(`/api/products/${product._id}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.name).toBe('Produit Unique');
    });

    test('Doit retourner un message si produit introuvable', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const res = await request(app).get(`/api/products/${fakeId}`);
        expect(res.body.message).toBeDefined();
    });

    test('Doit retourner une erreur avec un ID invalide', async () => {
        const res = await request(app).get('/api/products/id-invalide');
        expect(res.body.message).toBeDefined();
    });

});

// ================================================
// TESTS FONCTIONNELS — DELETE /api/products/delete/:id
// ================================================

describe('[FONCTIONNELS] DELETE /api/products/delete/:id', () => {

    test('Doit retourner 403 sans token admin', async () => {
        const product = await seedProduct();
        const res = await request(app).delete(`/api/products/delete/${product._id}`);
        expect(res.statusCode).toBe(403);
    });

    test('Doit supprimer un produit existant (admin)', async () => {
        const product = await seedProduct();
        const adminToken = await getAdminToken();
        const res = await request(app)
            .delete(`/api/products/delete/${product._id}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toBe('Product deleted');

        const deleted = await productModel.findById(product._id);
        expect(deleted).toBeNull();
    });

    test('La catégorie doit être mise à jour après suppression (admin)', async () => {
        const product = await seedProduct();
        const adminToken = await getAdminToken();
        await request(app)
            .delete(`/api/products/delete/${product._id}`)
            .set('Authorization', `Bearer ${adminToken}`);
        const category = await categoryModel.findOne({ name: 'test' });
        expect(category.products).not.toContain(product._id);
    });

});
