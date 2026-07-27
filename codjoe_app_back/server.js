const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const config = require('./config');
const app = require('./app');

const atlasUrl = config.MONGODB_ATLAS_URI;
const localUrl = config.MONGODB_LOCAL_URI;
const port = config.PORT || 8085;

// ----- Journalisation dans un fichier -----
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);

const accessLogStream = fs.createWriteStream(
    path.join(logsDir, 'access.log'),
    { flags: 'a' }
);
app.use(morgan('combined', { stream: accessLogStream }));


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

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// ----- Gestion globale des erreurs non catchées -----
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err.message);
    fs.appendFileSync(
        path.join(logsDir, 'error.log'),
        `[${new Date().toISOString()}] UNCAUGHT EXCEPTION: ${err.stack}\n`
    );
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    console.error('❌ Unhandled Rejection:', reason);
    fs.appendFileSync(
        path.join(logsDir, 'error.log'),
        `[${new Date().toISOString()}] UNHANDLED REJECTION: ${reason}\n`
    );
});



