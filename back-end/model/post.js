var database = require("../config/database");
var Schema = database.mongoose.Schema;

var postSchema = new Schema(
  {
    body: {
      type: String
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "user"
    },
    created: {
        type: Date,
        default: Date
    },
    userName: {
        type: String
    },
    likeCount: {
      type: Number,
      default: 0
    },
    likes: {
      type: Array,
      default: []
    }
  },
  {
    collection: "posts"
  }
);

module.exports = database.mongoose.model("post", postSchema);
