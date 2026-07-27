const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');
const dotenv = require('dotenv');
dotenv.config();
const config = require('./config');
const orderModel = require('./models/orderModel');

const app = express();

const stripe = require('stripe')(config.stripe_st_key);

// Sécurité HTTP — headers de protection (C23)
app.use(helmet());

// Journalisation HTTP — format 'combined' pour les logs de production (C23)
const logFormat = process.env.NODE_ENV === 'test' ? 'dev' : 'combined';
app.use(morgan(logFormat));

/**
 * @swagger
 * /api/webhook:
 *   post:
 *     summary: "C29 — Webhook Stripe : traitement des événements de paiement"
 *     tags: [Paiement]
 *     description: |
 *       Reçoit les événements Stripe (payment_intent.succeeded, payment_intent.payment_failed).
 *       La signature est vérifiée avec STRIPE_WEBHOOK_SECRET.
 *       Le body doit être raw (non parsé en JSON).
 *     responses:
 *       200:
 *         description: Événement traité
 *       400:
 *         description: Signature invalide ou événement non traité
 */
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook signature error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        await orderModel.findOneAndUpdate(
            { paymentIntentId: paymentIntent.id },
            { paymentStatus: 'completed', status: 'processing' }
        );
    } else if (event.type === 'payment_intent.payment_failed') {
        const paymentIntent = event.data.object;
        await orderModel.findOneAndUpdate(
            { paymentIntentId: paymentIntent.id },
            { paymentStatus: 'failed' }
        );
    }

    res.json({ received: true });
});

app.use(express.json());
app.use(cors());

// Documentation API — accessible sur /api/docs
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'CodJoe API Docs',
    customCss: '.swagger-ui .topbar { background-color: #1a1a2e; }'
}));

// Endpoint pour obtenir le JSON OpenAPI brut
app.get('/api/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

const categoryRoute = require('./routes/categoryRoute');
const productRoute = require('./routes/productRoute');
const userRoute = require('./routes/userRoute');
const authRoute = require('./routes/authRoute');
const orderRoute = require('./routes/orderRoute');

app.get('/api/codjoe', (req, res) => {
    res.json('Hello World from CodJoe App server !');
});

app.get('/api/config', (req, res) => {
    res.send({
        stripePublicKey: config.stripe_pc_key
    });
});

app.post('/api/pay', async (req, res) => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: 1999,
            currency: 'eur',
            payment_method_configuration: config.stripe_pay_method,
            automatic_payment_methods: { enabled: true }
        });
        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
        return res.status(400).send({ error: error.message });
    }
});

app.use('/api/auth', authRoute);
app.use('/api/categories', categoryRoute);
app.use('/api/products', productRoute);
app.use('/api/users', userRoute);
app.use('/api', orderRoute);

module.exports = app;
