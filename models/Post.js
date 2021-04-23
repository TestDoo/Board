// models/Post.js

var mongoose = require("mongoose");

// schema
var postSchema = mongoose.Schema({
    title: { type: String, required: [true, "Title is required!"] },
    body: { type: String, required: [true, "Body is required!"] },

    // ref: 'user'를 통해 이 항목의 데이터가 user collection의 id와 연결됨을 mongoose에 알린다. 이렇게 하여 user의 user.id와 post의 post.author가 연결되어 user와 post의 관계를 형성하였다.
    author: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },

    // 2 : default 항목으로 기본값을 지정한다.
    // 함수명을 넣으면 해당 함수의 return이 기본값이 됨
    // Date.now는 현재 시간을 리턴하는 함수이다
    createdAt: { type: Date, default: Date.now }, // 2
    updatedAt: { type: Date },
});

// model & export
var Post = mongoose.model("post", postSchema);

module.exports = Post;
