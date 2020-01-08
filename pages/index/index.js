//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    genderList: [
      { name: 'girl', value: '女', className: 'radio-girl'},
      { name: 'boy', value: '男', className: 'radio-boy', checked: 'true'}
    ],
    genderValue: 'boy',
    ballot_result: false,
  },
  
  subButton: function(res) {
    let userInfo = res.detail.userInfo;
    if(userInfo) {
      wx.setStorageSync('userInfo', userInfo);
      this.setData({
        ballot_result: true
      });

      setTimeout(() => {
        wx.navigateTo({
          url: `../luckResult/luckResult?sex=${this.data.genderValue}`
        });
      }, 1000);
    }
  },

  gennderChange(e) {
    this.setData({
      genderValue: e.detail.value
    });
    console.log(e);
  },
  onLoad: function () {
    
  },
  onShow: function() {
    this.setData({
      ballot_result: false
    });
  }
})
