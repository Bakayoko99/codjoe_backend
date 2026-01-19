
const config = {
    // 1: MongoDB Atlas 
    MONGODB_ATLAS_URI: process.env.MONGODB_ATLAS_URI || "mongodb+srv://codjoe-sendu-hp-user:GVC4LxfZ6m511IUg@codjoe.amyjx.mongodb.net/codjoe?retryWrites=true&w=majority&appName=codjoe",
    
    // 2: MongoDB local (fallback)
    MONGODB_LOCAL_URI: process.env.MONGODB_LOCAL_URI || "mongodb://localhost:27017/codjoe",
    
    // MONGODB_URI: process.env.MONGODB_URI,
    PORT: process.env.PORT || 8085,
    key: 'codjoeSecretKey',
    stripe_pc_key: process.env.STRIPE_PUBLIC_KEY,
    stripe_st_key: process.env.STRIPE_SECRET_KEY,
    stripe_pay_method: process.env.STRIPE_PAYMENT_METHOD
};


module.exports = config;