const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const config = require('./config');

const atlasUrl = config.MONGODB_ATLAS_URI;
const localUrl = config.MONGODB_LOCAL_URI;
const port = config.PORT || 8085;
const app = express();

const stripe = require("stripe")(config.stripe_st_key)

app.use(express.json());
app.use(cors());

const categoryRoute = require('./routes/categoryRoute');
const productRoute = require('./routes/productRoute');
const userRoute = require('./routes/userRoute');
const authRoute = require('./routes/authRoute');
const orderRoute = require('./routes/orderRoute');

const connectToDatabase = async () => {
    try {
        console.log('🔄 Attempting to connect to MongoDB Atlas...');
        
        await mongoose.connect(atlasUrl, {
            serverSelectionTimeoutMS: 5000, // Timeout après 5 secondes
            socketTimeoutMS: 45000,
        });
        
        console.log('✅ Connected to MongoDB Atlas');
        console.log('📊 Database name:', mongoose.connection.name);
        
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('📁 Collections:', collections.map(c => c.name));
        
    } catch (atlasError) {
        console.error('❌ MongoDB Atlas connection failed:', atlasError.message);
        console.log('🔄 Attempting to connect to local MongoDB...');
        
        try {
            await mongoose.connect(localUrl, {
                serverSelectionTimeoutMS: 5000,
            });
            
            console.log('✅ Connected to MongoDB Local');
            console.log('📊 Database name:', mongoose.connection.name);
            
        } catch (localError) {
            console.error('❌ MongoDB Local connection failed:', localError.message);
            console.log('⚠️  Running without database connection');
            console.log('💡 Please ensure MongoDB is installed and running, or check your Atlas connection');
        }
    }
};

connectToDatabase();

app.get('/api/codjoe', (req, res) => {
    res.json('Hello World from CodJoe App server !');
});

app.get('/api/config', (req, res) => {
    res.send({
        stripePublicKey: config.stripe_pc_key
    })
})

app.post('/api/pay', async (req, res) => {

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: 1999,
            currency: "eur",
            payment_method_configuration: config.stripe_pay_method,
            automatic_payment_methods: {
                enabled: true
            }
        })

        res.json({ clientSecret: paymentIntent.client_secret })

    } catch (error) {
        return res.status(400).send({ error: error.message })
    }

})

app.use('/api/auth', authRoute);
app.use('/api/categories', categoryRoute);
app.use('/api/products', productRoute);
app.use('/api/users', userRoute);
app.use('/api', orderRoute);


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});


