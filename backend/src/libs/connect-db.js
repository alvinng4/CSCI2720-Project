// Group 33:
// Chan Darren Jun Rong (1155256148)
// Li Clement (1155214128)
// Ng Ching Yin (1155175606)
// Zhao Yiming (1155211152)

import mongoose from "mongoose";

export default async function connectDB(dbPort, dbName) {
  const url = `mongodb://127.0.0.1:${dbPort}/${dbName}`;
  console.log(`Connecting to database on ${url}...`);

  mongoose.set("strictQuery", true);
  await mongoose.connect(url);
  console.log("Connected to database...");
}
