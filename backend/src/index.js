// Group 33:
// Chan Darren Jun Rong (1155256148)
// Li Clement (1155214128)
// Ng Ching Yin (1155175606)
// Zhao Yiming (1155211152)

import App from "./app.js";
import connectDB from "./libs/connect-db.js";
import dotenv from "dotenv";

dotenv.config();

const DB_PORT = process.env.DB_PORT || 27017;
const DB_NAME = process.env.DB_NAME || "culturalApp";
const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await connectDB(DB_PORT, DB_NAME);
    App.listen(PORT, () => {
      console.log(`API server listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server. Error: ", err);
    process.exit(1);
  }
})();
