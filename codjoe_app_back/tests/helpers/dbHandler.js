const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongod;

/**
 * Démarre une instance MongoDB en mémoire et connecte mongoose.
 */
const connect = async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
};

/**
 * Vide toutes les collections (entre les tests).
 */
const clearDatabase = async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
};

/**
 * Déconnecte mongoose et stoppe MongoDB en mémoire.
 */
const closeDatabase = async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongod.stop();
};

module.exports = { connect, clearDatabase, closeDatabase };
