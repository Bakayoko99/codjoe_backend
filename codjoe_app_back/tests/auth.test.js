/**
 * @file auth.test.js
 * @description Tests unitaires et fonctionnels pour les routes d'authentification
 * Couvre : POST /api/auth/signup et POST /api/auth/login
 */

const request = require('supertest');
const app = require('../app');
const dbHandler = require('./helpers/dbHandler');

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

// ----- Données de test -----

const validUser = {
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@test.com',
    password: 'secret123',
    country: 'France',
    birthday: '1990-01-15'
};

// ================================================
// TESTS UNITAIRES — Validations des entrées
// ================================================

describe('[UNITAIRES] POST /api/auth/signup — Validation des champs', () => {

    test('Doit retourner 400 si firstName manquant', async () => {
        const { firstName, ...body } = validUser;
        const res = await request(app).post('/api/auth/signup').send(body);
        expect(res.statusCode).toBe(400);
        expect(res.body.errors).toBeDefined();
    });

    test('Doit retourner 400 si email invalide', async () => {
        const res = await request(app).post('/api/auth/signup').send({
            ...validUser,
            email: 'pas-un-email'
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.errors[0].path).toBe('email');
    });

    test('Doit retourner 400 si password trop court (< 6 caractères)', async () => {
        const res = await request(app).post('/api/auth/signup').send({
            ...validUser,
            password: '123'
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.errors[0].path).toBe('password');
    });

    test('Doit retourner 400 si birthday manquante', async () => {
        const { birthday, ...body } = validUser;
        const res = await request(app).post('/api/auth/signup').send(body);
        expect(res.statusCode).toBe(400);
    });

});

describe('[UNITAIRES] POST /api/auth/login — Validation des champs', () => {

    test('Doit retourner 400 si email invalide', async () => {
        const res = await request(app).post('/api/auth/login').send({
            email: 'invalide',
            password: 'secret123'
        });
        expect(res.statusCode).toBe(400);
    });

    test('Doit retourner 400 si password manquant', async () => {
        const res = await request(app).post('/api/auth/login').send({
            email: 'jean.dupont@test.com'
        });
        expect(res.statusCode).toBe(400);
    });

});

// ================================================
// TESTS FONCTIONNELS — Comportement métier
// ================================================

describe('[FONCTIONNELS] POST /api/auth/signup', () => {

    test('Doit créer un utilisateur et retourner un token JWT', async () => {
        const res = await request(app).post('/api/auth/signup').send(validUser);
        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBeDefined();
        expect(typeof res.body.token).toBe('string');
    });

    test('Doit retourner 400 si email déjà utilisé', async () => {
        // Créer le premier utilisateur
        await request(app).post('/api/auth/signup').send(validUser);
        // Tenter de recréer avec le même email
        const res = await request(app).post('/api/auth/signup').send(validUser);
        expect(res.statusCode).toBe(400);
        expect(res.body.msg).toBe('User already exists');
    });

    test('Le mot de passe doit être hashé (non stocké en clair)', async () => {
        const userModel = require('../models/userModel');
        await request(app).post('/api/auth/signup').send(validUser);
        const userInDb = await userModel.findOne({ email: validUser.email });
        expect(userInDb.password).not.toBe(validUser.password);
        expect(userInDb.password).toMatch(/^\$2[aby]\$/); // format bcrypt
    });

});

describe('[FONCTIONNELS] POST /api/auth/login', () => {

    beforeEach(async () => {
        // Créer un utilisateur avant chaque test de login
        await request(app).post('/api/auth/signup').send(validUser);
    });

    test('Doit retourner un token JWT avec des identifiants valides', async () => {
        const res = await request(app).post('/api/auth/login').send({
            email: validUser.email,
            password: validUser.password
        });
        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBeDefined();
    });

    test('Doit retourner 400 avec un mauvais mot de passe', async () => {
        const res = await request(app).post('/api/auth/login').send({
            email: validUser.email,
            password: 'mauvais_mdp'
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.msg).toBe('Invalid credentials');
    });

    test('Doit retourner 400 si l\'utilisateur n\'existe pas', async () => {
        const res = await request(app).post('/api/auth/login').send({
            email: 'inexistant@test.com',
            password: 'secret123'
        });
        expect(res.statusCode).toBe(400);
        expect(res.body.msg).toBe('Invalid credentials');
    });

});
