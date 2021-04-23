// routes/home.js

var express = require("express");
var router = express.Router();
// 로그인 1 : passport는 무조건 config에서 가져오겠다.
var passport = require("../config/passport");

// Home
router.get("/", function (req, res) {
    res.render("home/welcome");
});

router.get("/about", function (req, res) {
    res.render("home/about");
});

// Login
// 로그인 2 :  login view를 보여주는 route입니다.
router.get("/login", function (req, res) {
    var username = req.flash("username")[0];
    var errors = req.flash("errors")[0] || {};
    res.render("home/login", {
        username: username,
        errors: errors,
    });
    console.log(username);
});

// Post Login
// 로그인 3 : login form에서 보내진 post request를 처리해 주는 route입니다. 두개의 callback이 있는데,

// 첫번째 callback은 보내진 form의 validation을 위한 것으로 에러가 있으면 flash를 만들고 login view로 redirect합니다.
// 두번째 callback은 passport local strategy를 호출해서 authentication(로그인)을 진행합니다.
router.post(
    "/login",
    function (req, res, next) {
        var errors = {};
        var isValid = true;

        // 아이디가 맞지 않다면
        if (!req.body.username) {
            isValid = false;
            errors.username = "Username is required!";
        }
        // 패스워드가 맞지 않다면
        if (!req.body.password) {
            isValid = false;
            errors.password = "Password is required!";
        }

        // 모두 통과했다면 두번째 콜백 함수 호출
        if (isValid) {
            next();
        } else {
            // 통과를 못했으면
            req.flash("errors", errors);
            res.redirect("/login");
        }
    },
    // passport local strategy를 호출해서 authentication(로그인)을 진행하는 함수
    passport.authenticate("local-login", {
        successRedirect: "/posts", // 게시판으로 Redirect
        failureRedirect: "/login", // 다시 로그인 창으로 Redirect
    })
);

// Logout
// 로그인 4 : logout을 해주는 route입니다. passport에서 제공된 req.logout 함수를 사용하여 로그아웃하고 "/"로 redirect합니다.
router.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});

module.exports = router;
