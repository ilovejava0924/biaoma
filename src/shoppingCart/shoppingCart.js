var app = getApp();
Page({
  data: {
    goodsId: '',
    data: [], //商品详情源
    number: [], //商品数量
    checkeds: false,
    totalPrice: 0, //总价
    agentId: '',
    spinShow: false, // 遮罩层
    isShow: true,
    num: 0 //被选中商品的数量
  },
  onLoad: function(options) {
    let goodsId = JSON.parse(options.scene2)
    this.setData({
      goodsId: goodsId.goodsId,
      agentId: goodsId.agentId
    })
    this.getShowList()
  },

  onShow() {
    wx.showToast({
      title: '加载中',
      icon: "loading",
      duration: 1000
    })
    // 价格方法
    this.count_price();
  },

  getShowList() {
    wx.request({
      url: `${app.globalData.host}/api/shoppingCartItem`,
      method: 'GET',
      header: {
        'content-type': 'application/json',
        "Authorization": "Bearer " + app.globalData.token
      },
      dataType: 'json',
      data: {
        query: {
          filters: {
            openId: {
              EQ: app.globalData.openid
            }
          },
          pageNo: 1,
          pageSize: 10,
        }

      },
      success: res => {
        if (res.data.code == 0) {
          this.setData({
            data: res.data.data.content.map(d => {
              d.checked = false;
              return d
            })
          }, () => {
            this.updateTotalPrice()
          });
        }
      }
    })
  },

  // 选中商品事件
  onChange(event) {
    const data = [].concat(this.data.data);
    let arr = []
    data.some((item, idx) => {
      if (item._id === event.currentTarget.dataset.id) {
        item.checked = event.detail;
      };
    });
    data.forEach(item => {
      if (item.checked == true) {
        arr.push(item.checked)
      }
    })
    this.setData({
      data,
      num: arr.length,
      checkeds: this.data.data.every(item => item.checked == true)
    });
    this.count_price();
  },

  // 商品数量事件
  numberchange(event) {
    console.log('event', event)
    console.log('this.data.goodsId', this.data.goodsId)
    this.setData({
      spinShow: true
    })
    var that = this;
    const data = [].concat(this.data.data);
    data.some((item, idx) => {
      if (item.goodsId === event.currentTarget.dataset.id) {
        item.quantity = event.detail.value;
        if (item.quantity > 0) {
          // 创建订单接口
          wx.request({
            url: `${app.globalData.host}/api/shoppingCartItem/updateQuantity`,
            method: 'POST',
            header: {
              'content-type': 'application/json',
              'authorization': 'Bearer ' + app.globalData.token
            },
            data: {
              goods: [{
                goodsId: event.currentTarget.dataset.id,
                quantity: item.quantity,
              }],
              openId: app.globalData.openid
            },
            success: res => {
              // this.getShowList()
              that.setData({
                spinShow: false
              })
            }
          })
        }
      };
    });
    this.setData({
      data
    });
    this.count_price();
  },

  // 全选事件
  clickAll(event) {
    this.setData({
      data: this.data.data.map(d => {
        d.checked = event.detail;
        return d
      })
    })

    this.checkAll()
    this.count_price();
  },
  // 全选事件逻辑
  checkAll() {
    this.setData({
      checkeds: !this.data.data.some(d => !d.checked)
    })
    if (this.data.checkeds == true) {
      console.log(this.data.data)
      this.setData({
        num: this.data.data.length,
      })
    } else {
      this.setData({
        num: 0,

      })
    }
    console.log(this.data.checkeds)
    this.count_price();
  },

  updateTotalPrice() {
    this.data.data.filter(d => d.checked).reduce((pre, current) => {
      const price = current.price * current.quantity;
      pre += price;
      return pre;
    }, 0)

  },

  // 总价格函数
  count_price() {
    // 获取商品列表数据
    let list = this.data.data;
    // 声明一个变量接收数组列表price
    let total = 0;
    // 循环列表得到每个数据
    for (let i = 0; i < list.length; i++) {
      // 判断选中计算价格
      if (list[i].checked == true) {
        // 所有价格加起来 count_money
        total += list[i].quantity * list[i].price - list[i].discountValue;
      }
    }
    // 最后赋值到data中渲染到页面
    this.setData({
      data: list,
      totalPrice: total.toFixed(2)
    });
  },

  // 提交订单
  onClickButton() {
    if (this.data.totalPrice != 0) {
      let datas = this.data.data.filter((item) => {
        return item.checked == true
      })

      wx.navigateTo({
        url: '/src/shopping/shopping?scene=' + JSON.stringify(datas) + '&cart=' + 1 + '&agentId=' + this.data.agentId
      })
    } else {
      wx.showToast({
        title: '请先选择一个商品',
        icon: 'none',
        duration: 1000
      })
    }

  },

  //编辑或完成
  adminTap: function() {
    this.setData({
      isShow: !this.data.isShow
    })
  },

  // 删除
  deleteBtn: function() {
    let that = this
    let datas = this.data.data.filter(item => {
      return item.checked == true
    })
    let arr = []
    datas.forEach(item => {
      let obj = {
        goodsId: item.goodsId,
        quantity: 0
      }
      arr.push(obj)
    })
    wx.showModal({
      title: '提示',
      content: '确定要删除该商品吗',
      success: function(res) {
        if (res.cancel) {
          //点击取消,默认隐藏弹框
        } else {
          //点击确定
          wx.request({
            url: `${app.globalData.host}/api/shoppingCartItem/updateQuantity`,
            method: 'POST',
            header: {
              'content-type': 'application/json',
              'authorization': 'Bearer ' + app.globalData.token
            },
            data: {
              goods: arr,
              openId: app.globalData.openid
            },
            success: res => {

              console.log(res)
              that.getShowList()
              that.setData({
                totalPrice: 0
              })
            },
            fail: function(res) {
              console.log(111)
              that.getShowList()
            },
          })
        }
      },
    })
  }
})