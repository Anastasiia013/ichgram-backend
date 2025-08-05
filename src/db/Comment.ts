import mongoose, { Schema, Document, Types } from "mongoose";

export interface IComment extends Document {
  author: Types.ObjectId;
  text: string;
  likes: Types.ObjectId[];
  createdAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  }
);

const Comment = mongoose.model<IComment>("Comment", commentSchema);

export default Comment;
