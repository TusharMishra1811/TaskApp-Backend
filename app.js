import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorHandler from "./middlewares/error.middleware.js";
import { connectPassport } from "./utils/passport.js";
import dotenv from "dotenv";



const app = express();
dotenv.config({
  path: "./.env",
});

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json());

app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

connectPassport();

import userRoutes from "./routes/user.routes.js";
import taskRoutes from "./routes/task.routes.js";


app.use("/api/v1", userRoutes);
app.use("/api/v1", taskRoutes);

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use(errorHandler);
export { app };
