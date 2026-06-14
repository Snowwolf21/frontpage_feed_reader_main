import mongoose from 'mongoose';

const articleStateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    feedUrl: {
      type: String,
      required: true,
    },
    articleId: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    bookmarked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

articleStateSchema.index({ userId: 1, feedUrl: 1, articleId: 1 }, { unique: true });

const ArticleState = mongoose.models.ArticleState || mongoose.model('ArticleState', articleStateSchema);

export default ArticleState;
