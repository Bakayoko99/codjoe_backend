const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const config = require('./config');

const atlasUrl = config.MONGODB_ATLAS_URI
const port = config.PORT || 8085;
const app = express();

const stripe = require("stripe")(config.stripe_st_key)

app.use(express.json());
app.use(cors());

const categoryRoute = require('./routes/categoryRoute');
const productRoute = require('./routes/productRoute');
const userRoute = require('./routes/userRoute');
const authRoute = require('./routes/authRoute')

try {


    setTimeout(() => {

        mongoose.connect(atlasUrl)
            .then(() => {
                console.log('Connected to MongoDB');
            });

    }, 60000)

} catch (error) {

    console.log('Error connecting to MongoDB:', error.message);

}

app.get('/api/codjoe', (req, res) => {
    res.json('Hello World from CodJoe App server !');
});

// app.get('/api/config', (req, res) => {
//     res.send({
//         stripePublicKey: config.stripe_pc_key
//     })
// })

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


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});


