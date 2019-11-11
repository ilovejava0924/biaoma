var app = getApp();
var md5 = require('../../utils/md5.js');
Page({
  data: {
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
    types: '',
    state: "",
    city: "",
    district: "",
    country: "无",
    orderVisible: false,
    scene: {},
    address: '',
    choosed_address: false,
    data: {},
    showsd: 0,
    showss: true
  },

  onLoad: function(query) {
    // 获取页面传过来的数据
    let message = JSON.parse(query.scene)
    console.log('message', message)
    let allnum = []
    message.forEach(item => {
      allnum.push(item.quantity)
    })
    this.data.showsd = allnum.reduce((pre, cur) => pre + cur)
    if (this.data.showsd > 1) {
      this.setData({
        showss: false
      })
    }

    console.log('this.data.showss', this.data.showss)
    let id = query.agentId
    let arr = []
    if (query.cart == "1") {
      message.forEach(item => {
        let obj = {
          id: item._id,
          quantity: item.quantity
        }
        arr.push(obj)
      })

    }
    let cart = +query.cart
    this.setData({
      scene: message,
      types: cart,
      data: arr,
      agentId: id
    })


    if (this.data.choosed_address) {
      // 如果已经选择了地址，则变成可编辑框
      return
    }

    // 获取常用地址
    wx.chooseAddress({
      success: res => {
        console.log(res)
        this.data.address = `${res.provinceName}${res.cityName}${res.countyName}${res.detailInfo}`
        this.setData({
          address: this.data.address,
          choosed_address: true,
          // 如果用户收货地址里有手机号和姓名，使用选择的内容覆盖当前内容
          name: res.userName,
          tel: res.telNumber,
          region: [res.provinceName, res.cityName, res.countyName],
          city: res.cityName,
          district: res.countyName,
          state: res.provinceName
        })
      },
      fail: res => {
        this.setData({
          choosed_address: true
        })
      },
    })

  },



  //点击购买按钮
  handleBuy: function() {
    if (!this.checkTel(this.data.tel)) {
      return;
    }
    if (this.data.types == 0) {
      wx.request({
        url: `${app.globalData.host}/api/wx/createOrder`,
        method: 'POST',
        header: {
          'content-type': 'application/json',
          'authorization': 'Bearer ' + app.globalData.token
        },
        data: {
          body: "小程序支付",
          agentId: this.data.scene.agentId,
          isFromShoppingCart: this.data.types, //判断是购物车还是立即购买
          goods: [{
            id: this.data.scene.goodsId,
            quantity: this.data.goodsQuanity
          }],
          goodsQuanity: this.data.goodsQuanity,
          consignee: this.data.name,
          country: this.data.country,
          state: this.data.state,
          city: this.data.city,
          district: this.data.district,
          address: this.data.address,
          mobile: this.data.tel,
          openid: app.globalData.openid
        },
        success: res => {
          console.log("payRequestOrder: ", res)
          var resData = res.data;
          if (resData.code == 0) {
            var orderId = resData.data.orderId || "";
            var obj = resData.data.requestPayment;
            obj.success = function(res) {
              console.log("pay success: ", res)
              wx.showToast({
                title: '支付成功',
                icon: 'success',
                duration: 1000
              })

              //支付成功后调用查询订单接口
              wx.request({
                url: `${app.globalData.host}/api/wx/orderquery`,
                method: 'POST',
                header: {
                  'content-type': 'application/json',
                  'authorization': 'Bearer ' + app.globalData.token
                },
                data: {
                  id: orderId
                },
                success: res => {
                  console.log("orderQuery success: ", res)
                }
              })
            }

            //支付失败后提示
            obj.fail = function(res) {
              console.log("pay fail:", res)
              wx.showToast({
                title: '支付失败',
                icon: 'none'
              })
            }

            obj.complete = function(res) {
              console.log("pay complete:", res)
            }


            console.log("obj:", obj)
            wx.requestPayment(
              obj
            )
          } else {
            wx.showToast({
              title: "拉取支付失败，请检查输入的信息是否正确",
              icon: 'none'
            })
          }
        }
      })
    } else {
      wx.request({
        url: `${app.globalData.host}/api/wx/createOrder`,
        method: 'POST',
        header: {
          'content-type': 'application/json',
          'authorization': 'Bearer ' + app.globalData.token
        },
        data: {
          body: "小程序支付",
          agentId: this.data.agentId,
          isFromShoppingCart: this.data.types, //判断是购物车还是立即购买
          goods: this.data.data,
          goodsQuanity: this.data.goodsQuanity,
          consignee: this.data.name,
          country: this.data.country,
          state: this.data.state,
          city: this.data.city,
          district: this.data.district,
          address: this.data.address,
          mobile: this.data.tel,
          openid: app.globalData.openid
        },
        success: res => {
          console.log("payRequestOrder: ", res)
          var resData = res.data;
          if (resData.code == 0) {
            var orderId = resData.data.orderId || "";
            var obj = resData.data.requestPayment;
            obj.success = function(res) {
              console.log("pay success: ", res)
              wx.showToast({
                title: '支付成功',
                icon: 'success',
                duration: 1000
              })

              //支付成功后调用查询订单接口
              wx.request({
                url: `${app.globalData.host}/api/wx/orderquery`,
                method: 'POST',
                header: {
                  'content-type': 'application/json',
                  'authorization': 'Bearer ' + app.globalData.token
                },
                data: {
                  id: orderId
                },
                success: res => {
                  console.log("orderQuery success: ", res)
                }
              })
            }

            //支付失败后提示
            obj.fail = function(res) {
              console.log("pay fail:", res)
              wx.showToast({
                title: '支付失败',
                icon: 'none'
              })
            }

            obj.complete = function(res) {
              console.log("pay complete:", res)
            }


            console.log("obj:", obj)
            wx.requestPayment(
              obj
            )
          } else {
            wx.showToast({
              title: "拉取支付失败，请检查输入的信息是否正确",
              icon: 'none'
            })
          }
        }
      })
    }

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

  //监听地区选择的值的变化
  bindRegionChange: function(e) {
    console.log(e)
    var selectedRegion = e.detail.value;
    // var changMssage=selectedRegion
    if (selectedRegion) {
      this.setData({
        address: ''
      })
    }
    this.setData({
      region: selectedRegion,
      state: selectedRegion[0],
      city: selectedRegion[1],
      district: selectedRegion[2]
    })
  },

  //校验手机号的格式
  checkTel: function(tel) {
    var str = /^1\d{10}$/
    if (str.test(tel)) {
      return true
    } else {
      wx.showToast({
        title: '手机号格式不正确',
        icon: 'none'
      })
      return false
    }
  },

  handleClose: function() {
    this.setData({
      orderVisible: false
    })
  }
})