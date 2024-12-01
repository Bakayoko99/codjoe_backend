
const config = {
    MONGODB_ATLAS_URI: process.env.MONGODB_ATLAS_URI,
    MONGODB_URI: process.env.MONGODB_URI,
    PORT: process.env.PORT,
    key: process.env.KEY,
    stripe_pc_key: process.env.STRIPE_PUBLIC_KEY,
    stripe_st_key: process.env.STRIPE_SECRET_KEY,
    stripe_pay_method: process.env.STRIPE_PAYMENT_METHOD
};


module.exports = config;