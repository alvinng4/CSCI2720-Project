import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
// import usersRoutes from "./routes/users.routes.js";
// import locationsRoutes from "./routes/locations.routes.js";
// import eventsRoutes from "./routes/events.routes.js";
// import commentsRoutes from "./routes/comments.routes.js";
// import adminRoutes from "./routes/admin.routes.js";
import errorMiddleware from "./middleware/error.js";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

/* Health check */
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
// app.use("/api/users", usersRoutes);
// app.use("/api/locations", locationsRoutes);
// app.use("/api/events", eventsRoutes);
// app.use("/api/comments", commentsRoutes);
// app.use("/api/admin", adminRoutes);

/* Middleware for error handling */
app.use(errorMiddleware);

export default app;
