import express from "express";
import mongoose from "mongoose";
import getConfig from "./config";
import urlRoutes from "./routes/url.routes";

const config = getConfig();
await mongoose.connect(config.MONGODB_URI);

const app = express();
app.use(express.json());
app.use(urlRoutes);

app.listen(config.PORT, () =>
  console.log(`Server is running on PORT ${config.PORT}`),
);
