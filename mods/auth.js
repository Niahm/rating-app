/**
 * @author qipbbn@gmail.com
 * @function User Auth
 */
var everyauth = require('everyauth');
//var hashlib = require('hashlib');
var User = require('../modules/index').User;


exports.everyauth = everyauth;

everyauth.everymodule.findUserById(function(userId, callback){
    User.findById(userId, callback);
});

everyauth.password
    .loginWith('email')
    .getLoginPath('/login')
    .postLoginPath('/login')
    .loginView('auth/login')
    .loginLocals({
        title : ' 登录'
    })
    .authenticate(function(login, password){
        var promise = this.Promise();
        User.findOne({email:login}, function(err, user){
            if(err){
                return promise.fulfill([err])
            }

            if(!user){
                return promise.fulfill(['没有找到邮箱，请先注册'])
            }

            return promise.fulfill(user);

            //remove password check
            //if(hashlib.md5(password) === user.password){
                //return promise.fulfill(user);
            //}else{
                //return promise.fulfill(['password not match']);
            //}

        });
        return promise;
    })
    .getRegisterPath('/register')
    .postRegisterPath('/register')
    .registerView('auth/register')
    .registerLocals({
        title : '注册'
    })
    .validateRegistration(function(user, errors){
        var promise = this.Promise();

        var user = User.findOne({ email : user.email}, function(err, user){
            if(err){
                errors.push(err)
                promise.fulfill(errors);
                return;
            }
            if(user){
                errors.push("用户已经存在")
                promise.fulfill(errors);
                return;
            }
            promise.fulfill(errors);
        });
        return promise;
    })
    .extractExtraRegistrationParams(function(req){
        return {
            name : req.body.name
        }
    })
    .registerUser(function(newUser, errors){
        var promise = this.Promise();
        //newUser.password = hashlib.md5(newUser.password);
        var user = new User(newUser);
        user.save(function(err,doc){
            if(err){
                errors.push(err);
                promise.fulfill(errors);
            }
            promise.fulfill(user);
        });

        return promise;
    })
    .respondToLoginSucceed(autoredirect)
    .respondToRegistrationSucceed(autoredirect);
/**
 * 登录完成后，根据session.redirectTo 自动重定向
 */
function autoredirect (res, user, req){
    if(user){
        if(req.session.redirectTo){
            res.redirect(req.session.redirectTo);
            req.session.redirectTo = null;
            return;
        }
        res.redirect('/');
    }
}
