//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // this.getToken();

    
    // // 获取用户信息
    // wx.getSetting({
    //   success: res => {
    //     wx.redirectTo({
    //       url: '/src/index/index',
    //     })
    //     return;
    //     if (res.authSetting['scope.userInfo']) {
    //       // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
    //       wx.getUserInfo({
    //         success: res => {
    //           // 可以将 res 发送给后台解码出 unionId
    //           this.globalData.userInfo = res.userInfo

    //           // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
    //           // 所以此处加入 callback 以防止这种情况
    //           if (this.userInfoReadyCallback) {
    //             this.userInfoReadyCallback(res)
    //           }
    //         }
    //       })
    //     } else {
    //       wx.redirectTo({
    //         url: '/src/index/index',//授权页面
    //       })
    //     }
    //   }
    // })
  },

  globalData: {
    // userInfo: null,
    token: "",
    openid: "",
    session_key: "",
    host: "https://eco.0791game.com"
    // host: "http://localhost:7104"
  },

  wxLogin: function() {
    var self = this;
    // 登录
    return new Promise(function (resolve, reject) {
      wx.login({
        success: res => {
          console.log("wxLogin:", res)
          if (res.code) {
            wx.request({
              url: self.globalData.host + '/api/wx/openid',
              method: 'POST',
              header: { 'content-type': 'application/json' },
              data: {
                js_code: res.code
              },
              success: res => {
                console.log("getOpenid: ", res)
                resolve(res);
                var resData = res.data.data;
                self.globalData.openid = resData.openid;
                self.globalData.session_key = resData.session_key;
              }
            })
          }
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
        }
      })
    })
    
  },

  getToken: function() {
    var self = this;
    return new Promise(function (resolve, reject) {
      wx.request({
        url: self.globalData.host + '/api/user/access/loginWX',
        method: 'POST',
        header: {
          'content-type': 'application/json'
        },
        dataType: 'json',
        data: {
          wxId: self.globalData.openid
        },
        success: res => {
          console.log("getToken: ", res)
          if (res.data.data.token != "") {
            resolve(res);
            var resData = res.data.data.token;
            self.globalData.token = resData;
          } else {
            wx.showToast({
              title: "获取token失败，请重新启动小程序",
              mask: true
            });
            reject('error');
          }
        },
        fail: function (data) {
          console.log("getToken fail:", data);
        }
      })
    })
  },
})