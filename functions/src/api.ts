import express from "express";
import cors from "cors";
import { taskRouter } from "./routes/tasks";
import { userRouter } from "./routes/users";
import { matchRouter } from "./routes/match";
import { adminRouter } from "./routes/admin";

const app = express();

app.use(cors({ origin: true }));
app.use(express.json({ limit: "10mb" }));

// Health check
app.get("/v1/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Route mounts
app.use("/v1/tasks", taskRouter);
app.use("/v1/users", userRouter);
app.use("/v1/match", matchRouter);
app.use("/v1/admin", adminRouter);

export { app };
