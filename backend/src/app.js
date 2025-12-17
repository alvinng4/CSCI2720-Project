import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import commentsRoutes from "./routes/comments.routes.js";
import eventsRoutes from "./routes/events.routes.js";
import favouritesRoutes from "./routes/favourites.routes.js";
import likesRoutes from "./routes/likes.routes.js";
import locationsRoutes from "./routes/locations.routes.js";
import usersRoutes from "./routes/users.routes.js";

import errorMiddleware from "./middleware/error.js";
import loggingMiddleware from "./middleware/logging.js";
import timeoutMiddleware from "./middleware/timeout.js";

const app = express();

/* Middleware delay for testing slow internet */
const enableSlowInternet =
  process.argv.includes("-s") || process.argv.includes("--slow-internet");
if (enableSlowInternet) {
  app.use(timeoutMiddleware);
}

/* Middleware for logging */
app.use(loggingMiddleware);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

/* Health check */
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/favourites", favouritesRoutes);
app.use("/api/likes", likesRoutes);
app.use("/api/locations", locationsRoutes);
app.use("/api/users", usersRoutes);

/* Middleware for error handling */
app.use(errorMiddleware);

export default app;
