import mongoose from "mongoose";
import Counter from "./counter.model";

const urlSchema = new mongoose.Schema(
  {
    index: { type: Number, unique: true },
    originURL: String,
    shortenURL: String,
  },
  { timestamps: true },
);

urlSchema.pre("save", async function () {
  if (!this.isNew) return;

  const counter = await Counter.findByIdAndUpdate(
    "urls",
    [{ $set: { seq: { $ifNull: [{ $add: ["$seq", 1] }, 0] } } }],
    { new: true, upsert: true, updatePipeline: true },
  );

  this.index = counter!.seq;
});

const URLShortenerModel = mongoose.model("URLs", urlSchema);
export default URLShortenerModel;
