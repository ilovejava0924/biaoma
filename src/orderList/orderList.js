var app = getApp();
const util = require('../../utils/util.js')
Page({
  data: {
    list: []
  },

  onLoad: function() {

    wx.request({
      url: `${app.globalData.host}/api/wx/orderList`,
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'authorization': 'Bearer ' + app.globalData.token
      },
      data: {
        openid: app.globalData.openid,
        filters: [],
        pageNo: 1,
        pageSize: 10
      },
      success: res => {
        var resData = res.data;
        if (resData.code == 0) {
          var content = resData.data.content;
          content.sort((a, b) => {
            var atime = new Date(a.ctime).getTime();
            var btime = new Date(b.ctime).getTime();
            return btime - atime;
          })
          content.forEach(v => {
            var ctime = new Date(v.ctime).getTime();
            v.ctime = util.formatTime(ctime, 'Y-M-D h:m:s')
          })

          this.setData({
            list: content
          })
        }
      }
    })
  }
})