const admin = require("firebase-admin");
const firebasekey = require("./firebasekey.json");
require("dotenv").config();

admin.initializeApp({
    credential: admin.credential.cert(firebasekey),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

const bucket = admin.storage().bucket();

module.exports = bucket;
