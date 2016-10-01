var urlBase = "http://invits.chinacloudsites.cn";
var testBase = "";
// var urlBase = "http://10.0.2.245";

// 在微信浏览器中测试用，头部css文件随机化
var vm = new Vue({
    el: 'head', 
    data: {
        rd:Math.random()*1000
    }
});  

// ajax封装
function aj(url , type , data ){
    var type = arguments[1]?arguments[1]:"GET";
    var data = arguments[2]?arguments[2]:"json";

    console.log("ajax path = "+ urlBase + url);
    var final = Rx.Observable.fromPromise(
        $.ajax({
        type: type,
        url: urlBase + url,
        dataType: data
        })
        .promise()
    );
    return final;
}


//tool function
function strToDate(string) {  
    var regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" +  
        "(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?" +  
        "(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?";  
    if(string)  
    {  
        var d = string.match(new RegExp(regexp));  
        var offset = 0;  
        var date = new Date(d[1], 0, 1);  
	  
        if (d[3]) {  
            date.setMonth(d[3] - 1);  
        }  
        if (d[5]) {  
            date.setDate(d[5]);  
        }  
        if (d[7]) {  
            date.setHours(d[7]);  
        }  
        if (d[8]) {  
            date.setMinutes(d[8]);  
        }  
        if (d[10]) {  
            date.setSeconds(d[10]);  
        }  
        if (d[12]) {  
            date.setMilliseconds(Number("0." + d[12]) * 1000);  
        }  
        if (d[14]) {  
            offset = (Number(d[16]) * 60) + Number(d[17]);  
            offset *= ((d[15] == '-') ? 1 : -1);  
        }  
        offset -= date.getTimezoneOffset();  
        time = (Number(date) + (offset * 60 * 1000));  
        date.setTime(Number(time));
        return date.toLocaleString();
    }  
    else  
    {  
        return "";  
    }  
}



function ReplaceAll(str, sptr, sptr1) {
    while (str.indexOf(sptr) >= 0) {
        str = str.replace(sptr, sptr1);
    }
    return str;
}

function GetQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
}
function getLocal($key) {
    //return JSON.parse(window.localStorage.getItem($key));
    return Cookies.get($key);
}
function setLocal($key, $val) {
    return Cookies.set($key, $val);
    //window.localStorage.setItem($key, JSON.stringify($val));
}

/*function openWinLogin() {
    vm_login.status=1;
    $('#scLogin').addClass('scActive').siblings('.sc').removeClass('scActive');
}*/


// 允许链接跳转
mui('*').on('tap', 'a', function (e) {
    mui.openWindow({
        url: this.href,
        id: this.href
    });
});
//init block  比如：详情页进入购物车时，此时不需要验证token,def_reg($fn)但是要使用注册登录弹窗
// var vm_sc;
function cart_reg_init($fn) {
    def_reg($fn);

    Rx.Observable.fromEvent($('#btnOrderPanel'),"tap").subscribe(
        function (x) {
            var token = getLocal("wk_token");
            if (token == "" || token == null) {
                console.log("无token，要登录");
                vm_login.loginH();
            } else {
                console.log("有token,无需登录");
                mui('#orderPanel').popover('show');
                $fn();
            }
        }
    );
}
function reg_init($fn) {
    def_reg($fn);

    var token = getLocal("wk_token");
    if (token == "" || token == null) {
        console.log("无token，要登录");
        vm_login.loginH();
    } else {
        var chkTokenRAC = aj("/ShopData/verifyToken/" + token);
        //驗證token失敗
        chkTokenRAC.where(function d(res) { return !res.result; }).subscribe(function d(res) {
            vm_login.loginH();
        });
        chkTokenRAC.where(function d(res) { return res.result; }).subscribe(function d(res) {
            $fn();
        });
    }
    /*mui('body').on('tap', '#linkNewID', function (e) {
        closeWin($('#popWinLogin'));
        openWin($('#popWinRegister'));
    });
    // 打开“登录”窗口
    mui('body').on('tap', '#linkLogin', function (e) {
        closeWin($('#popWinRegister'));
        openWin($('#popWinLogin'));
    });*/
}

// 定义登录/注册vm对象及行为

 // 登录、注册场景管理

var vm_login;
var vm_sc;

function def_reg($fn) {
    vm_login = new Vue({
        el: '#headerLoginTemplate',
        data: {
            status:0  //0为未登录，1为登录，2为注册
        },
        methods: {
            loginH: function () {this.status=1;vm_sc.status=1; },
            registerH: function () {this.status=2; vm_sc.status=2;},
            loginOutH: function () {this.status=0; vm_sc.status=0;}
        }
    });

    vm_sc = new Vue({
        el: '#scTemplate',
        data: {
            status:0,
            loginForm: {
                id: "18975141930",
                password: "yyyyyy"
            },
            registerForm: {
                id: "18975141930",
                password: "yyyyyy",
                code: ""
            },
            txtYzm: "获取验证码",
            isBtnYzmDisable: false
        },
        methods: {
            login: function (event) {
                
                var clSub = aj( "/shopData/login/" + vm_sc.loginForm.id + "/" + vm_sc.loginForm.password );
                clSub.where(function (res) { return res.result; }).subscribeOnNext(function (res) {
                    mui.toast(vm_sc.loginForm.id+' 登录成功！');

                    setLocal("wk_token", res.txt);
                    vm_login.loginOutH();
                    $fn();
                });
                clSub.where(function (res) { return !res.result; }).subscribeOnNext(function (res) {
                    mui.toast(vm_sc.loginForm.id+'<br>登录失败，请重新输入帐号及密码');
                });
            },
        }
    });

    /*var vm_login = new Vue({
        el: '#scLogin',
        data: {
            user: {
                id: "18975141930",
                password: "yyyyyy"
            },
            feed: ""
        },
        methods: {
            login: function (event) {
                
                var clSub = aj( "/shopData/login/" + vm_login.user.id + "/" + vm_login.user.password );
                clSub.where(function (res) { return res.result; }).subscribeOnNext(function (res) {
                    mui.toast(vm_login.user.id+' 登录成功！');

                    setLocal("wk_token", res.txt);
                    vm_login.loginOutH();
                    $fn();
                });
                clSub.where(function (res) { return !res.result; }).subscribeOnNext(function (res) {
                    mui.toast(vm_login.user.id+'<br>登录失败，请重新输入帐号及密码');
                });
            },
        }
    });

    var vm_sc = new Vue({
        el: '#scRegister',
        data: {
            user: {
                id: "13117316111",
                password: "yyyyyy",
                code: ""
            },
            txtYzm: "获取验证码",
            isBtnYzmDisable: false
        }
    });*/


    // 获取验证码 按钮
    var yzmRAC = Rx.Observable.fromEvent($('#btnGetYzm'), "tap");

    yzmRAC.where(function (x) { return vm_sc.loginForm.id == "" }).subscribe(
        function () {
            mui.toast(vm_login.loginForm.id+' 请输入手机号');
        });

    var yzmRAC2 = yzmRAC.where(function (x) { return vm_sc.loginForm.id != "" });

    yzmRAC2.subscribe(function (x) {
        vm_sc.txtYzm = "等待输入验证码 (60)";
        vm_sc.isBtnYzmDisable = true;

        Rx.Observable.interval(1000).take(60).map(function (x) { return 60 - x; })
       .subscribe(function (x) {
            // 计时中
           vm_sc.txtYzm = "等待输入验证码 (" + x + ")";
       }, null, function (x) {
            // 计时结束
           vm_sc.txtYzm = "重新获取验证码 ";
           vm_sc.isBtnYzmDisable = false; //用来切换是否灰色的css样式
       });

        aj("/shopData/sendCode/" + vm_sc.loginForm.id)
        .subscribe(function (x) {
            if (x.result) {   //send ok
                feed = "验证码已发送到手机 (" + vm_sc.loginForm.id + ")";
                mui.toast(feed);

            } else { //send fail
                feed = "获取验证码失败，请重新获取";
                mui.toast(feed);
            }
        });
    });

    // 提交注册 按钮
    var registerRAC = Rx.Observable.fromEvent($('#btnRegister'), "tap")
 .where(function (x) { return vm_sc.loginForm != "" && vm_sc.password != "" && vm_sc.code != "" });

    registerRAC.subscribe(function (x) {

        aj("/shopData/verifyCode/" + vm_sc.loginForm.id + "/" + vm_sc.loginForm.password + "/" + vm_sc.loginForm.code).
        subscribe(function (x) {
            if (x.result) {   //reg ok
                feed = "注册成功！请登录";mui.toast(feed);

                vm_sc.loginForm.id = vm_sc.registerForm.id;
                vm_sc.loginForm.password = vm_sc.registerForm.password;
                vm_sc.loginH();

                vm_sc.registerForm.id = "";
                vm_sc.registerForm.password = "";
                vm_sc.registerForm.code = "";

            } else { //reg fail
                feed = "帐号/密码/验证码有误，注册失败";mui.toast(feed);
                vm_sc.registerForm.password = "";
                vm_sc.registerForm.code = "";
            }
        });
    });
}


