// routes/users.js

var express = require("express");
var router = express.Router();
var User = require("../models/User");

// Index
// 1 :찾은 값을 정렬하는 기능이 추가됐음. sort함수를 말함. {username:1}이 들어가서 username을 기준으로 오름차순(asc)로 정렬하고 있다. -1은 내림차순이다
// 이처럼 sort 함수와 같이 어떤 기능을 하는 함수를 추가했을 때 exec()함수를 사용해야 한다.
router.get("/", function (req, res) {
    User.find({})
        .sort({ username: 1 })
        .exec(function (err, users) {
            if (err) return res.json(err);
            res.render("users/index", { users: users });
        });
});

// New
router.get("/new", function (req, res) {
    // user error 처리
    var user = req.flash("user")[0] || {};
    var errors = req.flash("errors")[0] || {};
    res.render("users/new", { user: user, errors: errors });
});

// create
router.post("/", function (req, res) {
    User.create(req.body, function (err, user) {
        if (err) {
            // user error 처리
            req.flash("user", req.body);
            req.flash("errors", parseError(err));
            return res.redirect("/users/new");
        }
        res.redirect("/users");
    });
});

// show
router.get("/:username", function (req, res) {
    User.findOne({ username: req.params.username }, function (err, user) {
        if (err) return res.json(err);
        res.render("users/show", { user: user });
    });
});

// edit
router.get("/:username/edit", function (req, res) {
    var user = req.flash("user")[0];
    var errors = req.flash("errors")[0] || {};
    if (!user) {
        User.findOne({ username: req.params.username }, function (err, user) {
            if (err) return res.json(err);
            res.render("users/edit", { username: req.params.username, user: user, errors: errors });
        });
    } else {
        res.render("users/edit", { username: req.params.username, user: user, errors: errors });
    }
});

// update
// 2
router.put("/:username", function (req, res, next) {
    // 2-1 : findOne함수로 값을 찾은 후에 값을 수정하고, user.save함수로 값을 저장한다. 단순히 값을 바꾸는 것이 아닌 user.password를 조건에 맞게 바꿔주어야 하기 때문이다
    User.findOne({ username: req.params.username })
        // 2-2 : select함수를 이용하면 DB에서 어떤 항목을 선택하고, 안할지를 정할 수 있다. user schema에서 password의 select을 false로 설정했으니 DB에 password가 있더라도 기본적으로 password를 읽어오지 않게 된다. select('password')를 통해서 password를 읽어오게 했다.
        // select함수로 선택적으로 읽어 올 수 있다. 항목이름 앞에 -를 붙이면 된다
        // 예) .select('password -name') 이런식으로
        .select("password")
        .exec(function (err, user) {
            if (err) return res.json(err);

            // update user object
            user.originalPassword = user.password;
            // 2-3 : user의 update(회원 정보 수정)은 password를 업데이트 하는 경우와, password를 업데이트 하지 않는 경우로 나눌 수 있는데, 이에 따라 user.password의 값이 바뀐다.
            user.password = req.body.newPassword ? req.body.newPassword : user.password;

            // 2-4 : user는 DB에서 읽어온 data이고, req.body가 실제 form으로 입력된 값이므로 각 항목을 엎어 쓴느 부분이다.
            for (var p in req.body) {
                user[p] = req.body[p];
            }

            // save updated user
            user.save(function (err, user) {
                if (err) {
                    req.flash("user", req.body);
                    req.flash("errors", parseError(err));
                    return res.redirect("/users/" + req.params.username + "/edit");
                }
                res.redirect("/users/" + user.username);
            });
        });
});

// destroy
router.delete("/:username", function (req, res) {
    User.deleteOne({ username: req.params.username }, function (err) {
        if (err) return res.json(err);
        res.redirect("/users");
    });
});

module.exports = router;

// functions
function parseError(errors) {
    var parsed = {};
    if (errors.name == "ValidationError") {
        for (var name in errors.errors) {
            var validationError = errors.errors[name];
            parsed[name] = { message: validationError.message };
        }
    } else if (errors.code == "11000" && errors.errmsg.indexOf("username") > 0) {
        parsed.username = { message: "This username already exists!" };
    } else {
        parsed.unhandled = JSON.stringify(errors);
    }
    return parsed;
}
