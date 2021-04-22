// index.js

var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var flash = require("connect-flash");
var session = require("express-session");
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
