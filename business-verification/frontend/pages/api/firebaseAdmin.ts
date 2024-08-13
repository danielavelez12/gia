// lib/firebaseAdmin.ts
import "server-only";

import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import path from "path";
import fs from "fs";

const serviceAccountPath = path.resolve("./credentials.json");

export async function initAdmin() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(
        JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"))
      ),
      storageBucket: "fast-kyc.appspot.com",
    });
  } else {
    admin.app(); // if already initialized, use that one
  }
  return getFirestore();
}
