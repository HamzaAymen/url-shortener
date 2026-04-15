import express from "express";
import mongoose from "mongoose";
import base62 from "base62";
import getConfig from "./config";
import Url from "./models/url.model";
import Counter from "./models/counter.model";

const app = express();
app.use(express.json());

const config = getConfig();
await mongoose.connect(config.MONGODB_URI);

const URL_REGEX = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/;
const BASE62_REGEX = /^[A-Za-z0-9]+$/;

app.post("/shorten", async (req, res) => {
  const { originalUrl } = req.body;

  if (!URL_REGEX.test(originalUrl)) {
    return res.status(400).send("Invalid URL format");
  }

  const url = await Url.create({ originalUrl });
  url.shortCode = base62.encode(url.sequenceId!);
  await url.save();

  return res.status(201).json(url);
});

app.delete("/urls", async (req, res) => {
  await Url.deleteMany({});
  await Counter.deleteMany({});

  res.send("All URLs deleted");
});

app.get("/:shortCode", async (req, res) => {
  const { shortCode } = req.params;

  if (!BASE62_REGEX.test(shortCode)) {
    return res.status(400).send("Invalid short code");
  }

  const url = await Url.findOne({
    sequenceId: base62.decode(shortCode),
  });
  if (!url) return res.status(404).send("No page found for this URL");

  return res.redirect(url.originalUrl!);
});

app.listen(3000, () => console.log("Server is running on PORT 3000"));
