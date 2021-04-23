// index.js

var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var flash = require("connect-flash");
var session = require("express-session");
var passport = require("./config/passport");
var app = express();

// DB setting
mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);
mongoose.connect(process.env.MONGO_DB);
var db = mongoose.connection;
db.once("open", function () {
    console.log("DB connected");
});
db.on("error", function (err) {
    console.log("DB ERROR :", err);
});

// Other settings
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
// user error 처리 : flash를 초기화 합니다. 이제부터 req.flash라는 함수를 사용할 수 있습니다.
app.use(flash());
// user error 처리 : session은 서버에서 접속자를 구분시키는 역할을 합니다
app.use(
    session({
        // secret는 session을 hash화 하는 값이다. 아무값이나 줘서 해커가 알수없게 하자
        secret: "MySecret",
        resave: true,
        saveUninitialized: true,
    })
);

// Passport
// passport.initialize()는 passport를 초기화 시켜주는 함수, passport.session()는 passport를 session과 연결해 주는 함수로 둘다 반드시 필요합니다
app.use(passport.initialize());
app.use(passport.session());

// Custom Middlewares
// app.use에 함수를 넣은 것을 middleware라고 합니다 -> 여기에 있는 함수는 app.use에 request가 올 때마다 route에 상관없이 무조건 해당 함수가 실행된다. 위치가 중요한데 app.use들 중에 가장 위에 있는 것부터 순서대로 실행된다.
// next()는 다음 진행을 위해 필요한 파라미터
app.use(function (req, res, next) {
    // req.isAuthenticated()는 passport에서 제공하는 함수로, 현재 로그인이 되어있는지 아닌지를true,false로 return
    res.locals.isAuthenticated = req.isAuthenticated();
    // req.user는 passport에서 추가하는 항목으로 로그인이 되면 session으로 부터 user를 deserialize하여 생성
    res.locals.currentUser = req.user;

    // res.locals에 위 두가지를 담는데, res.locals에 담겨진 변수는 ejs에서 바로 사용가능
    // res.locals.isAuthenticated는 ejs에서 user가 로그인이 되어 있는지 아닌지를 확인하는데 사용
    // res.locals.currentUser는 로그인된 user의 정보를 불러오는데 사용됩니다.

    next();
});

// Routes
// post, user routes
app.use("/", require("./routes/home"));
app.use("/posts", require("./routes/posts"));
app.use("/users", require("./routes/users"));

// Port setting
var port = 3000;
app.listen(port, function () {
    console.log("server on! http://localhost:" + port);
});
