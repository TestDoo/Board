// models/User.js

var mongoose = require("mongoose");
var bcrypt = require("bcryptjs");

// schema
// 1 : require에 true 대신 배열이 들어갔다. 첫번째는 true, false값이고, 두번째는 에러 메시지이다.
// 그냥 true/false을 넣을 경우 기본 에러메시지가 나오고, 위와 같이 배열을 사용해서 에러메시시 내용을 원하는 대로 변경할 수 있다.
// password에 select:false 는 DB에서 해당 모델을 읽어 올 때 해당 항목값(password)을 읽어오지 않는다.
// 비밀번호는 중요하기 때문에 DB에서 값을 읽어 오지 않도록 설정한 것
// 물론 이 값이 필요할 때는 특별한 설정을 해줘야 함 -> 이건 route에서 설정
var userSchema = mongoose.Schema(
    {
        // user error 처리
        // trim 은 문자열 앞뒤에 빈칸이 있는 경우 빈칸을 제거해 주는 옵션이다
        // match에는 정규표현식이 들어가서 값이 regex에 부합하지 않으면 에러메시지를 내게 된다.
        // 정규표현식은 문자열에 특정한 규칙에 맞는 문자열이 있는지 알아보는 표현식이다.

        username: {
            type: String,
            required: [true, "Username is required!"],
            // username을 위한 regex -> /^.{4,12}$/ : 해석하면 "문자열의 시작 위치에 길이 4 이상 12 이하인 문자열이 있고, 바로 다음이 문자열의 끝이여야 함".
            // 즉 전체 길이가 4이상 12자리 이하의 문자열이라면 이 regex를 통과할 수 있습니다.
            match: [/^.{4,12}$/, "Should be 4-12 characters!"],
            trim: true,
            unique: true,
        },
        password: {
            type: String,
            required: [true, "Password is required!"],
            select: false,
        },
        name: {
            type: String,
            required: [true, "Name is required!"],
            match: [/^.{4,12}$/, "Should be 4-12 characters!"],
            trim: true,
        },
        email: {
            type: String,
            // 이메일을 위한 정규표현식 :
            match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Should be a vaild email address!"],
            trim: true,
        },
    },
    {
        toObject: { virtuals: true },
    }
);

// virtuals
// 2 : DB에 저장되는 값 이외의 항목이 필요할 땐 virtual 항목으로 만든다. 즉, passwordConfirmation, originalPassword, currentPassword, newPassword는 회원가입, 회원정보 수정을 위해 필요한 항목이지만, DB에 저장할 필요 없는 값들이다. 이처럼 DB에 저장할 필요는 없지만 model에서 사용하고 싶은 항목들은 virtual로 만듭니다.
// 여기 있는 것들은 모두 값들이다. 굳이 DB에 저장 안해도 되는 값들! 함수로 착각하지 마라
userSchema
    .virtual("passwordConfirmation")
    .get(function () {
        return this._passwordConfirmation;
    })
    .set(function (value) {
        this._passwordConfirmation = value;
    });

userSchema
    .virtual("originalPassword")
    .get(function () {
        return this._originalPassword;
    })
    .set(function (value) {
        this._originalPassword = value;
    });

userSchema
    .virtual("currentPassword")
    .get(function () {
        return this._currentPassword;
    })
    .set(function (value) {
        this._currentPassword = value;
    });

userSchema
    .virtual("newPassword")
    .get(function () {
        return this._newPassword;
    })
    .set(function (value) {
        this._newPassword = value;
    });

// password validation
//  8-16자리 문자열 중에 숫자랑 영문자가 반드시 하나 이상 존재해야 한다는 뜻의 regex
var passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/;

// 반복되는 에러메시지를 변수로 선언
var passwordRegexErrorMessage = "Should be minimum 8 characters of alphabet and number combination!";

// 3 : password를 DB에서 생성, 수정하기 전에 값이 유효한지 확인하는 코드
// 확인하는 path에 들어간 값이 유효한지 확인하는 값
userSchema.path("password").validate(function (v) {
    // 3-1 : validation callback 함수 속에서 this는 user model이다. 헷갈리지 않도록 user 변수에 넣는다.
    var user = this;

    // create user
    // 3-3 : 회원가입의 경우 password confirmation값이 없는 경우와, password값이 passowrd confirmation값과 다른 경우에 유효하지 않음 처리(invalidate)를 하게 된다. model.invalidate함수를 사용하며, 첫번째 인자로 항목이름, 두번째 인자로 에러메시지를 받는다.
    if (user.isNew) {
        // 3-2 : model.isNew 항목은 해당 모델이 생성되는 경우에는 true, 아니면 false값을 가진다.
        // 이 항목을 이용해서 현재 password vaildation이 '회원가입' 단계인지, 아니면 '회원정보수정' 단계인지 알 수 있다.
        if (!user.passwordConfirmation) {
            user.invalidate("passwordConfirmation", "Password Confirmation is required.");
        }

        // user error 처리
        // 정규표현식.test(문자열) 함수는 문자열에 정규표현식을 통과하는 부분이 있다면 true를, 그렇지 않다면 false를 반환합니다.
        if (!passwordRegex.test(user.password)) {
            // 정규표현식.test(문자열) 함수에서 false가 반환되는 경우 변수 passwordRegexErrorMessage에 저장된 문자열로 model.invalidate함수를 호출합니다.
            user.invalidate("password", passwordRegexErrorMessage);
        }

        if (user.password !== user.passwordConfirmation) {
            user.invalidate("passwordConfirmation", "Password Confirmation does not matched!");
        }
    }

    // update user
    // 3-4 : 회원 정보 수정의 경우 current password값이 없는 경우와, current password값이 original password값과 다른 경우, new password값과 password confirmation값이 다른 경우 invalidate합시다. 회원정보 수정시에는 항상 비밀번호를 수정하는 것은 아니기 때문에 new password와 password confirmation값이 없어도 에러는 아닙니다.
    if (!user.isNew) {
        if (!user.currentPassword) {
            user.invalidate("currentPassword", "Current Password is required!");
        } else if (!bcrypt.compareSync(user.currentPassword, user.originalPassword)) {
            // 암호화 2 : bcrypt의 compareSync함수를 사용해서 저장된 hash와 입력받은 password의 hash가 일치하는지 확인한다
            // bcrypt.compareSync(user.currentPassword, user.originalPassword) 에서
            // user.currentPassword는 입력받은 text값이고 user.originalPassword는 user의 password hash값입니다. hash를 해독해서 text를 비교하는 것이 아니라 text값을 hash로 만들고 그 값이 일치하는 지를 확인하는 과정이다.
            user.invalidate("currentPassword", "Current Password is invalid!");
        }

        // user error 처리
        // 정규표현식.test(문자열) 함수는 문자열에 정규표현식을 통과하는 부분이 있다면 true를, 그렇지 않다면 false를 반환합니다.
        // newPassword에 값이 있는데 정규표현식을 통과하지 못한다면..
        if (user.newPassword && !passwordRegex.test(user.newPassword)) {
            // 정규표현식.test(문자열) 함수에서 false가 반환되는 경우 변수 passwordRegexErrorMessage에 저장된 문자열로 model.invalidate함수를 호출합니다.
            user.invalidate("newPassword", passwordRegexErrorMessage);
        } else if (user.newPassword !== user.passwordConfirmation) {
            user.invalidate("passwordConfirmation", "Password Confirmation does not matched!");
        }
    }
});

// hash password
// 암호화 3 : Schema.pre 함수는 첫번째 파라미터로 설정된 event가 일어나기 전(pre)에 먼저 콜백함수를 실행시킨다
// save event는 Model.create, mode.save 함수 실행시 발생하는 event이다
// 즉 user를 생성하거나 user를 수정한 뒤 save함수를 실행할 때 위의 콜백 함수가 먼저 호출된다.
userSchema.pre("save", function (next) {
    var user = this;
    // 암호화 3-1 : isModified함수는 해당 값이 db에 기록된 값과 비교해서 변경된 경우 true를, 그렇지 않은 경우 false를 반환하는 함수입니다.
    // user 생성시는 항상 true이며, user 수정시는 password가 변경되는 경우에만 true를 반환한다
    // user.password의 변경이 없는 경우라면 이미 해당위치에 hash가 저장되어 있으므로 다시 hash를 만들지 않는다.
    if (!user.isModified("password")) {
        return next();
    } else {
        //암호화 3-2 : user를 생성하거나 user수정시 user.password의 변경이 있는 경우에는 bcrypt.hashSync함수로 password를 hash값으로 바꿉니다.
        user.password = bcrypt.hashSync(user.password);
        return next();
    }
});

// model methods
// 암호화 4 : user model의 password hash와 입력받은 password text를 비교하는 method를 추가합니다. 이번 예제에 사용되는 method는 아니고 나중에 로그인을 만들때 될 method인데 bcrypt를 사용하므로 지금 추가해봤습니다.
userSchema.methods.authenticate = function (password) {
    var user = this;
    return bcrypt.compareSync(password, user.password);
};

// model & export
var User = mongoose.model("user", userSchema);
module.exports = User;
