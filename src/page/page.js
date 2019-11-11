var app = getApp();
var md5 = require('../../utils/md5.js');
Page({
  data: {
    // 详情图片
    detailImage: [],
    background: [],
    indicatorDots: true,
    vertical: false,
    autoplay: true,
    circular: true,
    interval: 2000,
    duration: 500,
    previousMargin: 0,
    nextMargin: 0,
    goodsId: "",
    price: 0,
    goodsName: "",
    goodsTitle: "",
    goodsQuanity: 1,
    discountValue: 0,
    name: "",
    tel: "",
    region: ["省", "市", "区"],
    state: "",
    city: "",
    district: "",
    country: "无",
    address: "",
    orderVisible: false,
    scene: {},
    todayBrowse: '',
    totalBuyAmount: '',
    hotText: '', //热点标题
    shipmentsText: '', //发货标题字段
    virtualTodayBrowse: '', //虚拟预览人数
    virtualTotalBuyAmount: '', //虚拟商品总成交数量,
    desc: '',
    openid: '',
    commodityMessage: {},
    spinShow: false, // 遮罩层，
    service: false, //客服模态框
    serviceWxh1:'' , //客服微信号
    serviceWxh2: '' //客服微信号
  },

  onLoad: function(query) {
    var self = this;
    const scene = decodeURIComponent(query.scene || "p=5dbaaef31017f42368da87f0");
    const params = scene.split('=')[1]; //提取id
    console.log("params: ", params)
    app.wxLogin().then(function(loginRes) {
      console.log("onLoad wxLogin", loginRes);
      app.getToken().then(function(res) {
        console.log("onLoad getToken", res);
        self.getScene(params);
      })
    });

  },

  getScene: function(params) {
    wx.request({
      url: `${app.globalData.host}/api/wx/getWxXcxParam`,
      method: 'POST',
      header: {
        'content-type': 'application/json',
        "Authorization": "Bearer " + app.globalData.token
      },
      data: {
        id: params || "",
        openid: app.globalData.openid
      },
      success: res => {
        console.log("getScene success: ", res, params)
        if (res.data.code == 0) {
          var paramsObj = {};
          const resData = res.data.data.params.split("&")
          resData.map(v => {
            var str = v.split("=");
            if (str.length == 2) {
              paramsObj[str[0]] = str[1];
            }
          })
          this.setData({
            scene: paramsObj,
          })
          console.log('goodsId', this.data.scene)

          this.getGoodsDetail(true);
        } else {
          this.getGoodsDetail(false);
        }
      }
    })
  },

  // 轮播图点击事件
  previewImage: function(e) {
    console.log(this.data.background)
    var current = e.target.dataset.src;
    //图片预览
    wx.previewImage({
      current: current, // 当前显示图片的http链接
      urls: this.data.background // 需要预览的图片http链接列表
    })
  },


  //获取商品的详情
  getGoodsDetail: function(notEmpty) {
    if (notEmpty) {
      wx.request({
        url: `${app.globalData.host}/api/goods/${this.data.scene.goodsId}`,
        method: 'GET',
        header: {
          'content-type': 'application/json',
          "Authorization": "Bearer " + app.globalData.token
        },
        dataType: 'json',
        success: res => {
          console.log("goods: ", res)
          var content = res.data.data;
          var commodityMessage = res.data.data
          var background = content.image.map(v => {
            return v;
          })
          var detailimg = content.detailImage.map(v => {
            return v;
          })
          this.setData({
            detailImage: detailimg,
            background: background,
            goodsId: content._id,
            price: content.price,
            goodsName: content.name,
            goodsTitle: content.title,
            discountValue: content.discountValue,
            todayBrowse: content.todayBrowse,
            totalBuyAmount: content.totalBuyAmount,
            hotText: content.hotText,
            shipmentsText: content.shipmentsText,
            virtualTodayBrowse: content.virtualTodayBrowse,
            virtualTotalBuyAmount: content.virtualTotalBuyAmount,
            desc: content.desc,
            commodityMessage: commodityMessage
          });
        }
      })
    } else {
      wx.request({
        url: `${app.globalData.host}/api/goods`,
        method: 'GET',
        header: {
          'content-type': 'application/json',
          "Authorization": "Bearer " + app.globalData.token
        },
        dataType: 'json',
        success: res => {
          console.log("goods: ", res)
          var content = res.data.data.content[0];
          var background = content.image.map(v => {
            return v;
          })
          this.setData({
            background: background,
            goodsId: content._id,
            price: content.price,
            goodsName: content.name,
            goodsTitle: content.title,
            discountValue: content.discountValue,

          });
        }
      })
    }

  },

  //点击购买按钮
  handleBuy: function() {
    wx.navigateTo({
      url: '/src/shopping/shopping?scene=' + JSON.stringify(this.data.scene) + '&cart=' + 0
    })
  },

  // 添加购物车
  goShoppingCart: function() {
    this.setData({
      spinShow: true
    })
    wx.request({
      url: `${app.globalData.host}/api/shoppingCartItem`,
      method: 'POST',
      header: {
        'content-type': 'application/json',
        "Authorization": "Bearer " + app.globalData.token
      },
      data: {
        openId: app.globalData.openid,
        goods: [{
          goodsId: this.data.goodsId,
          quantity: 1
        }]
      },
      success: res => {
        console.log(res.data.code)
        if (res.data.code == 0) {
          this.setData({
            spinShow: false
          })
          wx.navigateTo({
            url: '/src/shoppingCart/shoppingCart?scene2=' + JSON.stringify(this.data.scene)
          })
        }
      }
    })


  },


  // 客服
  service: function() {
    wx.request({
      url: `${app.globalData.host}/api/kefu`,
      method: 'GET',
      header: {
        'content-type': 'application/json',
        "Authorization": "Bearer " + app.globalData.token
      },
      dataType: 'json',
      success: res => {

        if (res.data.code == 0) {
          let arr = res.data.data.kefu.split(',')
          let wxh1 = arr[0]
          let wxh2 = arr[1]
          this.setData({
            serviceWxh1: wxh1,
            serviceWxh2: wxh2,
          })

          console.log('kekefuuf', wxh1)
          console.log('kekefuuf', wxh2)
        }
      }
    })
    this.setData({
      service: true
    });
  },


  // 微信客服1点击复制
  serviceWxh1: function() {
    wx.setClipboardData({
      data: this.data.serviceWxh1,
      success: function(res) {
      }
    })
  },
    // 微信客服2点击复制
  serviceWxh2: function () {
    wx.setClipboardData({
      data: this.data.serviceWxh2,
      success: function (res) {
      }
    })
  },

  handleClose1() {
    this.setData({
      service: false
    });
  },


  handleOrder: function() {
    wx.navigateTo({
      url: '/src/orderList/orderList'
    })
  },

  quanityChange: function({
    detail
  }) {
    this.setData({
      goodsQuanity: detail.value
    })
  },

  changeName: function(e) {
    var inputValue = e.detail.detail.value;
    this.setData({
      name: inputValue
    })
  },

  changeTel: function(e) {
    var inputValue = e.detail.detail.value;
    if (inputValue.length == 11) {
      if (!this.checkTel(inputValue)) {
        wx.showToast({
          title: '手机号格式不正确',
          icon: 'none'
        })
      }
    }
    this.setData({
      tel: inputValue
    })
  },

  changeAddress: function(e) {
    var inputValue = e.detail.detail.value;
    this.setData({
      address: inputValue
    })
  },

})