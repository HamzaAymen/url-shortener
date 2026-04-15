import mongoose from "mongoose";

const urlSchema = new mongoose.Schema(
  {
    sequenceId: { type: Number, unique: true },
    originalUrl: String,
    shortCode: String,
  },
  { timestamps: true },
);

const Url = mongoose.model("Url", urlSchema);
export default Url;
