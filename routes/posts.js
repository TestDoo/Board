// routes/posts.js

const { response } = require("express");
var express = require("express");
var router = express.Router();
var Post = require("../models/Post");

// Index
// nav에 board버튼이 클릭되면 실행되는 라우터
router.get("/", function (req, res) {
    // 1 : exec함수 앞에서 DB에서 데이터를 어떻게 찾을지, 어떻게 정렬할 지 등을 함수로 표현하고, exec안의 함수에서 해당 data를 받아와서 할일을 정하는 구조이다.
    // sort() 함수는 string이나 object를 받아서 데이터 정렬방법을 정의하는 함수다
    // 문자열로 표현하는 경우 정렬할 항목명을 문자열로 넣으면 오름차순으로 정렬하고, 내림차순인 경우 -를 앞에 붙여준다. 두가지 이상으로 정렬하는 경우 빈칸을 넣고 각각의 항목을 적어주면 된다.
    // object를 넣는 경우
    // {createAt:1}(오름차순), {createAt:-1}(내림차순) 이런식으로 넣어주면 된다
    Post.find({})
        .sort("-createAt")
        .exec(function (err, posts) {
            if (err) return res.json(err);
            res.render("posts/index", { posts: posts });
        });
});

// New
router.get("/new", function (req, res) {
    res.render("posts/new");
});

// create
router.post("/", function (req, res) {
    Post.create(req.body, function (err, post) {
        if (err) return res.json(err);
        res.redirect("/posts");
    });
});

// show
router.get("/:id", function (req, res) {
    Post.findOne({ _id: req.params.id }, function (err, post) {
        if (err) return res.json(err);
        res.render("posts/show", { post: post });
    });
});

// edit
router.get("/:id/edit", function (req, res) {
    Post.findOne({ _id: req.params.id }, function (err, post) {
        if (err) return res.json(err);
        res.render("posts/edit", { post: post });
    });
});

// update
router.put("/:id", function (req, res) {
    //2 : post를 수정하는 경우 수정된 날짜를 updateAt에 기록한다.
    req.body.updatedAt = Date.now();
    Post.findOneAndUpdate({ _id: req.params.id }, req.body, function (err, post) {
        if (err) return res.json(err);
        res.redirect("/posts/" + req.params.id);
    });
});

// destroy
router.delete("/:id", function (req, res) {
    Post.deleteOne({ _id: req.params.id }, function (err) {
        if (err) return res.json(err);
        res.redirect("/posts");
    });
});

module.exports = router;
