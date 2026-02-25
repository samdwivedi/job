import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new Schema({
  name: { type: String, required: true },
  role: { type: String, enum: ["hr","admin","employee","verifier"], required: true },
  coins: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model("User", userSchema);