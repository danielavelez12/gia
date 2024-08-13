// pages/api/firestore.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { initAdmin } from "./firebaseAdmin";
import { getFirestore } from "firebase-admin/firestore";
import { getDownloadURL, getStorage } from "firebase-admin/storage";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("Request method: ", req.method);
  if (req.method === "GET") {
    try {
      initAdmin();
      res.status(200);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Failed to initialize db" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
