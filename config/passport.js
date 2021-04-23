// config/passport.js
// passport는 node.js에서 user authentication(사용자 인증=login)을 만들기 위해 사용하는 패키지이다
// 입력받은 username, password과 DB에 존재하는 data의 값을 비교해서 login을 하는 local strategy를 사용한다

var passport = require("passport");
// 1 : strategy들은 거의 대부분이 require다음에 .Strategy가 붙습니다
var LocalStrategy = require("passport-local").Strategy;
var User = require("../models/User");

// serialize & deserialize User
// 로그인은 DB에 이미 등록되어 있는 user를 찾는 것인데,
// 로그인시에 DB로 부터 user를 찾아 session에 user 정보의 일부(간혹 전부)를 등록하는 것을 serialize라고 합니다.
// 반대로 session에 등록된 user 정보로부터 해당 user를 object로 만드는 과정을 deserialize라고 하며, server에 요청이 올때마다 deserialize를 거치게 됩니다.
// 2 : passport.serializeUser함수는 login시에 DB에서 발견한 user를 어떻게 session에 저장할지를 정하는 부분이다.
// session에 너무 많은 정보를 저장하면 성능이 떨어질 수 있기 때문에 user의 id만 저장한다.
passport.serializeUser(function (user, done) {
    done(null, user.id);
});
// passport.deserializeUser함수는 request시에 session에서 어떻게 user object를 만들지를 정하는 부분
passport.deserializeUser(function (id, done) {
    User.findOne({ _id: id }, function (err, user) {
        done(err, user);
    });
});

// local strategy
// 3 : local strategy를 설정하는 부분입니다.
passport.use(
    "local-login",
    new LocalStrategy(
        {
            // 3-1 :
            usernameField: "username",
            passwordField: "password",
            passReqToCallback: true,
        },

        // 3-2 : 로그인 시 호출되는 함수
        // DB에서 해당 user를 찾고, user model에 설정했던 user.authenticate 함수를 사용해서 입력받은 password와 저장된 password hash를 비교해서 값이 일치하면 해당 user를 done에 담아서 return하고,

        // 그렇지 않은 경우 username flash와 에러 flash를 생성한 후 done에 false를 담아 return한다.
        // user가 전달되지 않으면 local-strategy는 실패(failure)로 간주됩니다.
        // 참고: done함수의 첫번째 parameter는 항상 error를 담기 위한 것으로 error가 없다면 null을 담습니다.
        function (req, username, password, done) {
            User.findOne({ username: username })
                .select({ password: 1 })
                .exec(function (err, user) {
                    if (err) return done(err);

                    // 3-3 : user.authenticate(password)는 입력받은 password와 db에서 읽어온 해당 user의 password hash를 비교하는 함수이다.
                    if (user && user.authenticate(password)) {
                        return done(null, user);
                    } else {
                        req.flash("username", username);
                        req.flash("errors", { login: "The username or password is incorrect." });
                        return done(null, false);
                    }
                });
        }
    )
);

module.exports = passport;
