// models/Post.js

var mongoose = require("mongoose");

// schema
var postSchema = mongoose.Schema({
    title: { type: String, require: true },
    body: { type: String, require: true },
    // 2 : default 항목으로 기본값을 지정한다.
    // 함수명을 넣으면 해당 함수의 return이 기본값이 됨
    // Date.now는 현재 시간을 리턴하는 함수이다
    createAt: { type: Date, default: Date.now },
    updateAt: { type: Date },
});

// model & export
var Post = mongoose.model("post", postSchema);

module.exports = Post;
