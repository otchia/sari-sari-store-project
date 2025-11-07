import admin from "firebase-admin";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const serviceAccountPath = path.resolve("serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath),
});

export default admin;
