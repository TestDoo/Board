// models/User.js

var mongoose = require("mongoose");

// schema
// 1 : require에 true 대신 배열이 들어갔다. 첫번째는 true, false값이고, 두번째는 에러 메시지이다.
// 그냥 true/false을 넣을 경우 기본 에러메시지가 나오고, 위와 같이 배열을 사용해서 에러메시시 내용을 원하는 대로 변경할 수 있다.
// password에 select:false 는 DB에서 해당 모델을 읽어 올 때 해당 항목값(password)을 읽어오지 않는다.
// 비밀번호는 중요하기 때문에 DB에서 값을 읽어 오지 않도록 설정한 것
// 물론 이 값이 필요할 때는 특별한 설정을 해줘야 함 -> 이건 route에서 설정
var userSchema = mongoose.Schema(
    {
        username: { type: String, required: [true, "Username is required!"], unique: true },
        password: { type: String, required: [true, "Password is required!"], select: false },
        name: { type: String, required: [true, "Name is required!"] },
        email: { type: String },
    },
    {
        toObject: { virtuals: true },
    }
);

// virtuals
// 2 : DB에 저장되는 값 이외의 항목이 필요할 땐 virtual 항목으로 만든다. 즉, passwordConfirmation, originalPassword, currentPassword, newPassword는 회원가입, 회원정보 수정을 위해 필요한 항목이지만, DB에 저장할 필요 없는 값들이다. 이처럼 DB에 저장할 필요는 없지만 model에서 사용하고 싶은 항목들은 virtual로 만듭니다.
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
// 3 : password를 DB에서 생성, 수정하기 전에 값이 유효한지 확인하는 코드
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

        if (user.password !== user.passwordConfirmation) {
            user.invalidate("passwordConfirmation", "Password Confirmation does not matched!");
        }
    }

    // update user
    // 3-4 :
    if (!user.isNew) {
        if (!user.currentPassword) {
            user.invalidate("currentPassword", "Current Password is required!");
        } else if (user.currentPassword != user.originalPassword) {
            user.invalidate("currentPassword", "Current Password is invalid!");
        }

        if (user.newPassword !== user.passwordConfirmation) {
            user.invalidate("passwordConfirmation", "Password Confirmation does not matched!");
        }
    }
});

// model & export
var User = mongoose.model("user", userSchema);
module.exports = User;
