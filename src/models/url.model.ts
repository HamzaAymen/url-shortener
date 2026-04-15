import mongoose from "mongoose";
import Counter from "./counter.model";

const urlSchema = new mongoose.Schema(
  {
    sequenceId: { type: Number, unique: true },
    originalUrl: String,
    shortCode: String,
  },
  { timestamps: true },
);

urlSchema.pre("save", async function () {
  if (!this.isNew) return;

  const counter = await Counter.findByIdAndUpdate(
    "urls",
    [{ $set: { seq: { $ifNull: [{ $add: ["$seq", 1] }, 0] } } }],
    { returnDocument: 'after', upsert: true, updatePipeline: true },
  );

  this.sequenceId = counter!.seq;
});

const Url = mongoose.model("Url", urlSchema);
export default Url;
