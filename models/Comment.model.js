import mongoose from "mongoose";
const Schema = mongoose.Schema;

const CommentSchema = new Schema(
  {
    content: { type: String, required: true, minlength: 1, maxlength: 300 },
    author: { type: Schema.Types.ObjectId, ref: "User" },
    garden: { type: Schema.Types.ObjectId, ref: "Garden" },
  },
  { timestamps: true }
);

export const CommentModel = mongoose.model("Comment", CommentSchema);
