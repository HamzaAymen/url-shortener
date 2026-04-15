import express from "express";
import mongoose from "mongoose";
import base62 from "base62";
import loadConfig from "./config";
import URLShortenerModel from "./models/url.model";
import Counter from "./models/counter.model";

const app = express();
app.use(express.json());

const config = loadConfig();
await mongoose.connect(config.MONGODB_URI);

const URL_REGEX = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/;
const BASE62_REGEX = /^[A-Za-z0-9]+$/;

app.post("/shorten", async (req, res) => {
  const { originURL } = req.body;

  if (!URL_REGEX.test(originURL)) {
    return res.status(400).send("Invalid URL format");
  }

  const URLDocument = await URLShortenerModel.create({ originURL });
  URLDocument.shortenURL = base62.encode(URLDocument.index!);
  await URLDocument.save();

  return res.status(201).json(URLDocument);
});
app.get("/app/delete", async (req, res) => {
  await URLShortenerModel.deleteMany({});
  await Counter.deleteMany({});

  res.send("( :");
});

app.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (!BASE62_REGEX.test(id)) {
    return res.status(400).send("Invalid URL");
  }

  const URLDocument = await URLShortenerModel.findOne({
    index: base62.decode(id),
  });
  if (!URLDocument) return res.status(404).send("No page found for this URL");

  return res.redirect(URLDocument.originURL!);
});

app.listen(3000, () => console.log("Server is running on PORT 3000"));
