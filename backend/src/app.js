import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import commentsRoutes from "./routes/comments.routes.js";
import eventsRoutes from "./routes/events.routes.js";
import favouritesRoutes from "./routes/favourites.routes.js";
import usersRoutes from "./routes/users.routes.js";
import locationsRoutes from "./routes/locations.routes.js";
// import adminRoutes from "./routes/admin.routes.js";

import errorMiddleware from "./middleware/error.js";

const app = express();

/* Middleware delay for testing slow internet */
app.use((_req, _res, next) => {
  setTimeout(next, 1000);
});

/* Middleware for logging */
app.use((req, _res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} from ${req.ip}`
  );
  next();
});

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
app.use("/api/users", usersRoutes);
app.use("/api/locations", locationsRoutes);
// app.use("/api/admin", adminRoutes);

/* Middleware for error handling */
app.use(errorMiddleware);

export default app;
