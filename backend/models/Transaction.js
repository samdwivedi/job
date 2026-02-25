import mongoose from "mongoose";
const { Schema } = mongoose;

const txSchema = new Schema({
  from: { type: Schema.Types.ObjectId, ref: "User" },
  to: { type: Schema.Types.ObjectId, ref: "User" },
  amount: { type: Number, required: true },
  task: { type: Schema.Types.ObjectId, ref: "Task" }
}, { timestamps: true });

export default mongoose.model("Transaction", txSchema);