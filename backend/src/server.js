import "dotenv/config";
import express, { json } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes/index.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));
app.use(json({ limit: "10mb" }));

app.use("/api", routes);

app.use((req, res) => {
  res
    .status(404)
    .json({
      success: false,
      error: { message: `Route ${req.originalUrl} not found` },
    });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));