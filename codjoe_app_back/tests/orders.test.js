/**
 * @file orders.test.js
 * @description Tests fonctionnels pour les routes commandes
 * Couvre : création, lecture, mise à jour du statut, annulation
 */

const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = require('../app');
const dbHandler = require('./helpers/dbHandler');
const userModel = require('../models/userModel');
const orderModel = require('../models/orderModel');
const config = require('../config');

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

// ---- Helpers ----

const createTestUser = async () => {
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash('Secr3t!Pass', salt);
    return await userModel.create({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@codjoe.com',
        password: hashed,
        country: 'France',
        birthday: new Date('1990-01-01')
    });
};

const createAdminUser = async () => {
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash('Secr3t!Pass', salt);
    return await userModel.create({
        firstName: 'Admin',
        lastName: 'CODJOE',
        email: 'admin@codjoe.com',
        password: hashed,
        country: 'France',
        birthday: new Date('1985-01-01'),
        role: 'admin'
    });
};

const getToken = (user) => {
    return jwt.sign({ user: { id: user._id, role: user.role } }, config.key, { expiresIn: 3600 });
};

const validOrderItems = [
    {
        productId: new mongoose.Types.ObjectId(),
        productName: 'T-Shirt',
        productPrice: 29.99,
        size: 'M',
        quantity: 2,
        subtotal: 59.98
    }
];

// ================================================
// TESTS FONCTIONNELS — POST /api/users/:userID/orders/create
// ================================================

describe('[FONCTIONNELS] POST /api/users/:userID/orders/create', () => {

    test('Doit créer une commande et retourner 201', async () => {
        const user = await createTestUser();
        const token = getToken(user);

        const res = await request(app)
            .post(`/api/users/${user._id}/orders/create`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                items: validOrderItems,
                subtotal: 59.98,
                shippingFee: 5.99,
                total: 65.97,
                paymentIntentId: 'pi_test_123'
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.message).toBe('Order created successfully');
        expect(res.body.order.orderNumber).toMatch(/^COD-/);
    });

    test('Doit vider le panier après création de commande', async () => {
        const user = await createTestUser();
        const token = getToken(user);

        await request(app)
            .post(`/api/users/${user._id}/orders/create`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                items: validOrderItems,
                subtotal: 59.98,
                shippingFee: 5.99,
                total: 65.97
            });

        const updatedUser = await userModel.findById(user._id);
        expect(updatedUser.shoppingCart.length).toBe(0);
    });

    test('Doit retourner 403 sans token', async () => {
        const user = await createTestUser();
        const res = await request(app)
            .post(`/api/users/${user._id}/orders/create`)
            .send({ items: validOrderItems, subtotal: 10, total: 10 });
        expect(res.statusCode).toBe(403);
    });

    test('Doit retourner 400 si items vide', async () => {
        const user = await createTestUser();
        const token = getToken(user);
        const res = await request(app)
            .post(`/api/users/${user._id}/orders/create`)
            .set('Authorization', `Bearer ${token}`)
            .send({ items: [], subtotal: 0, total: 0 });
        expect(res.statusCode).toBe(400);
    });

});

// ================================================
// TESTS FONCTIONNELS — GET /api/users/:userID/orders
// ================================================

describe('[FONCTIONNELS] GET /api/users/:userID/orders', () => {

    test('Doit retourner les commandes d\'un utilisateur', async () => {
        const user = await createTestUser();
        const token = getToken(user);

        // Créer une commande
        await request(app)
            .post(`/api/users/${user._id}/orders/create`)
            .set('Authorization', `Bearer ${token}`)
            .send({ items: validOrderItems, subtotal: 59.98, total: 65.97 });

        const res = await request(app)
            .get(`/api/users/${user._id}/orders`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.data.length).toBe(1);
        expect(res.body.count).toBe(1);
    });

    test('Doit retourner 403 sans token', async () => {
        const user = await createTestUser();
        const res = await request(app).get(`/api/users/${user._id}/orders`);
        expect(res.statusCode).toBe(403);
    });

});

// ================================================
// TESTS FONCTIONNELS — PUT /api/orders/:orderID/status
// ================================================

describe('[FONCTIONNELS] PUT /api/orders/:orderID/status', () => {

    test('Doit mettre à jour le statut de la commande (admin uniquement)', async () => {
        const user = await createTestUser();
        const token = getToken(user);
        const admin = await createAdminUser();
        const adminToken = getToken(admin);

        const createRes = await request(app)
            .post(`/api/users/${user._id}/orders/create`)
            .set('Authorization', `Bearer ${token}`)
            .send({ items: validOrderItems, subtotal: 59.98, total: 65.97 });

        const orderId = createRes.body.order._id;

        const res = await request(app)
            .put(`/api/orders/${orderId}/status`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: 'shipped' });

        expect(res.statusCode).toBe(200);
        expect(res.body.order.status).toBe('shipped');
    });

    test('Doit retourner 403 si un utilisateur non-admin tente de mettre à jour le statut', async () => {
        const user = await createTestUser();
        const token = getToken(user);

        const createRes = await request(app)
            .post(`/api/users/${user._id}/orders/create`)
            .set('Authorization', `Bearer ${token}`)
            .send({ items: validOrderItems, subtotal: 59.98, total: 65.97 });

        const orderId = createRes.body.order._id;

        const res = await request(app)
            .put(`/api/orders/${orderId}/status`)
            .set('Authorization', `Bearer ${token}`)
            .send({ status: 'shipped' });

        expect(res.statusCode).toBe(403);
    });

    test('Doit retourner 400 avec un statut invalide', async () => {
        const user = await createTestUser();
        const token = getToken(user);
        const admin = await createAdminUser();
        const adminToken = getToken(admin);

        const createRes = await request(app)
            .post(`/api/users/${user._id}/orders/create`)
            .set('Authorization', `Bearer ${token}`)
            .send({ items: validOrderItems, subtotal: 59.98, total: 65.97 });

        const orderId = createRes.body.order._id;

        const res = await request(app)
            .put(`/api/orders/${orderId}/status`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: 'invalide' });

        expect(res.statusCode).toBe(400);
    });

});

// ================================================
// TESTS FONCTIONNELS — PUT /api/orders/:orderID/cancel
// ================================================

describe('[FONCTIONNELS] PUT /api/orders/:orderID/cancel', () => {

    test('Doit annuler une commande en attente', async () => {
        const user = await createTestUser();
        const token = getToken(user);

        const createRes = await request(app)
            .post(`/api/users/${user._id}/orders/create`)
            .set('Authorization', `Bearer ${token}`)
            .send({ items: validOrderItems, subtotal: 59.98, total: 65.97 });

        const orderId = createRes.body.order._id;

        const res = await request(app)
            .put(`/api/orders/${orderId}/cancel`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.order.status).toBe('cancelled');
    });

    test('Ne doit pas annuler une commande expédiée', async () => {
        const user = await createTestUser();
        const token = getToken(user);
        const admin = await createAdminUser();
        const adminToken = getToken(admin);

        const createRes = await request(app)
            .post(`/api/users/${user._id}/orders/create`)
            .set('Authorization', `Bearer ${token}`)
            .send({ items: validOrderItems, subtotal: 59.98, total: 65.97 });

        const orderId = createRes.body.order._id;

        // Mettre à jour le statut à shipped (action admin)
        await request(app)
            .put(`/api/orders/${orderId}/status`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: 'shipped' });

        // Tenter d'annuler
        const res = await request(app)
            .put(`/api/orders/${orderId}/cancel`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(400);
    });

});
