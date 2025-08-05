import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPost extends Document {
  author: Types.ObjectId;
  imageUrl: string;
  caption?: string;
  likes: Types.ObjectId[];
  comments: [
    {
      type: Schema.Types.ObjectId;
      ref: "Comment";
    }
  ];

  createdAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      default: "",
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  }
);

const Post = mongoose.model<IPost>("Post", postSchema);

export default Post;
