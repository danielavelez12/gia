// pages/api/firestore.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getFirestore } from "firebase-admin/firestore";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("Request method: ", req.method);
  if (req.method === "GET") {
    try {
      const firestore = getFirestore();
      const snapshot = await firestore
        .collection("kyb_logs")
        .orderBy("created_at", "desc")
        .get();
      
      if (snapshot.empty) {
        res.status(404).json({ error: "No logs found" });
        return;
      }

      const doc = snapshot.docs[0];
      const results:any[] = []
      snapshot.forEach(doc => {
        results.push({ id: doc.id, ...doc.data() });
      });
      res.status(200).json(results);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Failed to fetch data" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
