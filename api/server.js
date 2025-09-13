import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.get("/env.js", (req, res) => {
  res.setHeader("Content-Type", "application/javascript");
  res.send(`
    window.firebaseConfig = {
      apiKey: "${process.env.FIREBASE_API_KEY}",
      authDomain: "${process.env.FIREBASE_AUTH_DOMAIN}",
      databaseURL: "${process.env.FIREBASE_DATABASE_URL}",
      projectId: "${process.env.FIREBASE_PROJECT_ID}",
      storageBucket: "${process.env.FIREBASE_STORAGE_BUCKET}",
      messagingSenderId: "${process.env.FIREBASE_MESSAGING_SENDER_ID}",
      appId: "${process.env.FIREBASE_APP_ID}"
    };
  `);
});

export default app;
