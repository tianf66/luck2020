// pages/luckResult/luckResult.js
let luckResultData = require("../../utils/data.js")
console.log(luckResultData);
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // canvas 
    _wrpx: Number,
    _hrpx: Number,
    _width: 0, //手机屏宽
    _height: 0,//手机屏高
    loadImagePath: '',//下载的图片
    imageUrl: 'https://i.opfed.com/luck/prediction_bg_result.png', //主图网络路径
    tianUrl: 'https://i.opfed.com/luck/tian.png',//田字格url
    coderationUrl: 'https://i.opfed.com/luck/code.png',
    userCoverUrl: '',//用户头像
    localImageUrl: '', //绘制的商品图片本地路径
    localTianUrl: '',//绘制的田字格图片本地路径
    localCoderationUrl: '',
    sex: "",
    showTipMove: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getSysInfo();
    this.setData({
      sex: options.sex
    });
    wx.showLoading({
      title: '梗太多,计算中~',
    });
  },

  getSysInfo: function () {
    /*获取手机宽高*/
    let _this = this;
    let imgUrl = this.data.imageUrl;
    let qrcodeUrl = this.data.coderationUrl;
    let userCoverUrl = wx.getStorageSync('userInfo').avatarUrl;
    let tianUrl = this.data.tianUrl;
    wx.getSystemInfo({
      success(res) {
        _this.setData({
          _width: res.windowWidth,
          _height: res.windowHeight,
          _wrpx: res.windowWidth / 828,
          _hrpx: res.windowHeight / 1472
        })
        // 获取图片信息生成canvas
        _this.getImginfo([imgUrl, userCoverUrl, tianUrl, qrcodeUrl], 0);
      }
    })
  },

  // 获取图片信息
  getImginfo: function (urlArr, _type) {
    let that = this;

    wx.getImageInfo({
      src: urlArr[_type],
      success: function (res) {
        //res.path是网络图片的本地地址
        if (_type === 0) {//背景图片
          that.setData({
            localImageUrl: res.path,
          });
          that.getImginfo(urlArr, 1);
        } else if(_type === 1) {
          that.setData({ //用户头像
            userCoverUrl: res.path,
          });
          that.getImginfo(urlArr, 2);
        } else if(_type === 2) {
          that.setData({ //田字格
            localTianUrl: res.path,
          });
          that.getImginfo(urlArr, 3);
        } else if(_type === 3) {
          that.setData({
            localCoderationUrl: res.path,
          });

          // 创建canvas图片
          that.createNewImg(true);
        }
      },
      fail: function (res) {//失败回调
        console.log('错误-res', _type, res)
      }
    });
  },

  //封装绘画圆角矩形
  drawRoundRect: function(cxt, x, y, width, height, radius) {
    cxt.beginPath();
    cxt.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 3 / 2);
    cxt.lineTo(width - radius + x, y);
    cxt.arc(width - radius + x, radius + y, radius, Math.PI * 3 / 2, Math.PI * 2);
    cxt.lineTo(width + x, height + y - radius);
    cxt.arc(width - radius + x, height - radius + y, radius, 0, Math.PI * 1 / 2);
    cxt.lineTo(radius + x, height + y);
    cxt.arc(radius + x, height - radius + y, radius, Math.PI * 1 / 2, Math.PI);
    cxt.closePath();
  },

  //绘制canvas
  createNewImg: function (isShowMove) {
    let randomNumber = Math.floor(Math.random() * (11 - 0 + 1)) + 0;
  
    if(randomNumber == 4 && this.data.sex == 'girl') {
      randomNumber += 1;
    }
    if(randomNumber == 6 && this.data.sex == 'boy') {
      randomNumber += 1;
    }

    let luckItem = luckResultData[randomNumber];
    let ctx = wx.createCanvasContext('myCanvas'),
        _width = this.data._width, //屏幕宽
        _height = this.data._height, //屏幕高
        _wrpx = this.data._wrpx,//根据屏幕分辨率进行单位换算
        _hrpx = this.data._hrpx,
        that = this;

    //绘制背景图片  start
      ctx.drawImage(this.data.localImageUrl, 0, 0, _width, _height);
    // end


    //绘制第一行虚线 start
      ctx.setLineDash([6]);
      ctx.strokeStyle = '#401b0a';
      ctx.beginPath();
      ctx.moveTo(120 * _wrpx, 450 * _hrpx);
      ctx.lineTo(720 * _wrpx, 450 * _hrpx);
      ctx.stroke();
    //end


    // 绘制用户头像 start；
      let avatarurl_width = 85 * _wrpx;    //头像宽度
      let avatarurl_heigth = 85 * _wrpx;   //头像高度
      let avatarurl_x = 120 * _wrpx;   //头像在画布上的x位置
      let avatarurl_y = 330 * _hrpx;   //头像在画布上的y位置
      ctx.save();
      ctx.beginPath(); 
      //先画个圆
      ctx.arc(avatarurl_width / 2 + avatarurl_x, avatarurl_heigth / 2 + avatarurl_y, avatarurl_width / 2, 0, Math.PI * 2, false);
      // 剪切
      ctx.clip();
      //追加图片
      ctx.drawImage(this.data.userCoverUrl, avatarurl_x, avatarurl_y, avatarurl_width, avatarurl_heigth);
      ctx.restore();
    //end


    //绘制用户昵称 start
      let userName = wx.getStorageSync('userInfo').nickName;
      ctx.font = 'normal bold 14px Microsoft YaHei';
      ctx.setFillStyle('#842624');
      ctx.fillText(userName, 230 * _wrpx, 360 * _hrpx);
      ctx.fillText('的鼠年运势', 230 * _wrpx, 400 * _hrpx, 150 * _wrpx);
    //end


    //绘制关键词 start
      //先绘制两个田字格
      let keyWordsList = luckItem.keyWords.split(',');
      if(keyWordsList.length == 1) {
        ctx.drawImage(this.data.localTianUrl, 500 * _wrpx, 325 * _hrpx, 110 * _wrpx, 110 * _wrpx);
        ctx.font = `normal bold ${parseInt(90 * _wrpx)}px 楷体`;
        ctx.setFillStyle('#d90000');
        ctx.fillText(keyWordsList[0], 500 * _wrpx + 12 * _wrpx, 325 * _hrpx + 92 * _wrpx);
      } else {
        ctx.drawImage(this.data.localTianUrl, 450 * _wrpx, 325 * _hrpx, 110 * _wrpx, 110 * _wrpx);
        ctx.font = `normal bold ${parseInt(90 * _wrpx)}px 楷体`;
        ctx.setFillStyle('#d90000');
        ctx.fillText(keyWordsList[0], 450 * _wrpx + 12 * _wrpx, 325 * _hrpx + 92 * _wrpx);
        ctx.drawImage(this.data.localTianUrl, 580 * _wrpx, 325 * _hrpx, 110 * _wrpx, 110 * _wrpx);
        ctx.fillText(keyWordsList[1], 580 * _wrpx + 12 * _wrpx, 325 * _hrpx + 92 * _wrpx);
      }
      
    // end


    //绘制第二行虚线 start
      ctx.setLineDash([6]);
      ctx.strokeStyle = '#401b0a';
      ctx.beginPath();
      ctx.moveTo(120 * _wrpx, 650 * _hrpx);
      ctx.lineTo(720 * _wrpx, 650 * _hrpx);
      ctx.stroke();
    //end

    //绘制宜相关 start
      ctx.font = 'normal bold 20px Microsoft YaHei';
      ctx.setFillStyle('#b30a00');
      ctx.fillText('宜', 130 * _wrpx, 560 * _hrpx, 150 * _wrpx);

      let yiList = luckItem.yiList;
      let constYi_y = 440;
      yiList.forEach((item, index) => {
        constYi_y += 60;
        ctx.setFillStyle('#b30a00');
        ctx.font = `normal bold 18px Microsoft YaHei`;
        ctx.fillText('·', 200 * _wrpx, constYi_y * _hrpx);
        ctx.setFillStyle('#401b0a');
        ctx.font = `normal bold ${parseInt(28 * _wrpx)}px Microsoft YaHei`;
        ctx.fillText(item, 230 * _wrpx, constYi_y * _hrpx);
      });
    //end


    //绘制第三行虚线 start
      ctx.setLineDash([6]);
      ctx.strokeStyle = '#401b0a';
      ctx.beginPath();
      ctx.moveTo(120 * _wrpx, 850 * _hrpx);
      ctx.lineTo(720 * _wrpx, 850 * _hrpx);
      ctx.stroke();
    //end


    //绘制忌相关 start
      ctx.font = 'normal bold 20px Microsoft YaHei';
      ctx.setFillStyle('#b30a00');
      ctx.fillText('忌', 130 * _wrpx, 760 * _hrpx, 150 * _wrpx);

      let jiList = luckItem.jiList;
      let constJi_y = 640;
      jiList.forEach((item, index) => {
        constJi_y += 60;

        ctx.setFillStyle('#b30a00');
        ctx.font = `normal bold 18px Microsoft YaHei`;
        ctx.fillText('·', 200 * _wrpx, constJi_y * _hrpx);

        ctx.setFillStyle('#401b0a');
        ctx.font = `normal bold ${parseInt(28 * _wrpx)}px Microsoft YaHei`;
        ctx.fillText(`${item.key} :`, 230 * _wrpx, constJi_y * _hrpx);

        // ctx.font = `normal ${parseInt(28 * _wrpx)}px Microsoft YaHei`;
        // ctx.fillText('——', 230 * _wrpx, constJi_y * _hrpx);
        ctx.save();
        ctx.setLineDash([0]);
        ctx.beginPath();
        ctx.moveTo(225 * _wrpx, constJi_y * _hrpx - 5);
        ctx.lineTo(290 * _wrpx, constJi_y * _hrpx - 5);
        ctx.stroke();
        ctx.font = `normal bold ${parseInt(28 * _wrpx)}px Microsoft YaHei`;
        ctx.fillText(`${item.text}`, 310 * _wrpx, constJi_y * _hrpx);
      });
    //end


    //绘制第四行虚线 start
      ctx.save();
      ctx.setLineDash([6]);
      ctx.strokeStyle = '#401b0a';
      ctx.beginPath();
      ctx.moveTo(120 * _wrpx, 1150 * _hrpx);
      ctx.lineTo(720 * _wrpx, 1150 * _hrpx);
      ctx.stroke();
    //end

    //绘制第四行中间虚线 start
      ctx.save();
      ctx.setLineDash([6]);
      ctx.strokeStyle = '#401b0a';
      ctx.beginPath();
      ctx.moveTo(419 * _wrpx, 860 * _hrpx);
      ctx.lineTo(419 * _wrpx, 1145 * _hrpx);
      ctx.stroke();
    //end


    //绘制雷达图 start

      //绘制网格  start
      ctx.setLineDash([0]);
      let mCount = 5, //边数
          radioCount = 3,//3个圆
          mCenter = _width / 4.1, /** x中心点 */
          mVertical = _height / 1.47, /** y中心点 */
          mRadius = mCenter - 50, //半径(减去的值用于给绘制的文本留空间)
          mAngle = Math.PI * 2 / mCount,
          constX = + 50 * _wrpx,
          mColorPolygon = '#401b0a'; //多边形颜色

      let mData = luckItem.echarts //数据


      //绘制数据覆盖区域 start
      /**层级关系 先绘制覆盖区域 */
        ctx.save();
        ctx.beginPath();
        for (let i = 0; i < mCount; i++) {
          let x = mCenter + mRadius * Math.cos(mAngle * i) * mData[i][1] / 100;
          let y = mVertical + mRadius * Math.sin(mAngle * i) * mData[i][1] / 100;

          ctx.lineTo(x + constX, y);
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(218,169,113, 0.9)';
        ctx.fill();
        ctx.restore();
      //end

      // 绘制网图 start
        ctx.save();
        ctx.strokeStyle = mColorPolygon;//单位半径
        let r = mRadius / radioCount; 

        for (let i = 0; i < radioCount; i++) {//画3个圈
            ctx.beginPath();
            let currR = r * (i + 1); //当前半径

            for (let j = 0; j < mCount; j++) {//画5条边
              let x = mCenter + currR * Math.cos(mAngle * j);
              let y = mVertical + currR * Math.sin(mAngle * j);
              ctx.lineTo(x + constX, y);
            }
            ctx.closePath();
            ctx.stroke();
        }
        ctx.restore();
      // end

      //连接顶点线 start
        let mColorLines = '#401b0a'; //顶点连线颜色
        ctx.save();
        ctx.strokeStyle = mColorLines;
        ctx.beginPath();
        for (let i = 0; i < mCount; i++) {
          let x = mCenter + mRadius * Math.cos(mAngle * i);
          let y = mVertical + mRadius * Math.sin(mAngle * i);
          ctx.moveTo(mCenter + constX, mVertical);
          ctx.lineTo(x + constX, y);
        }
        ctx.stroke();
        ctx.restore();
      //end

      //绘制数据图 start

        // 绘制 数据图文字 start
        let mColorText = '#401b0a';//数据图文字颜色
        ctx.save();
        ctx.fillStyle = mColorText;

        for (let i = 0; i < mCount; i++) {
          let x = (mCenter + mRadius * Math.cos(mAngle * i)) + constX;
          let y = mVertical + mRadius * Math.sin(mAngle * i);
          //通过不同的位置，调整文本的显示位置
          if (i == 0) {
            //属性 
            ctx.font = `normal 600 ${parseInt(25 * _wrpx)}px Microsoft YaHei`;
            ctx.fillText(mData[i][0], x + 6 * + _wrpx, y + 10 * _hrpx);
            //属性值
            ctx.font = `normal 500 ${parseInt(23 * _wrpx)}px Microsoft YaHei`;
            ctx.fillText(mData[i][1], x + 20 * + _wrpx, y + 40 * _hrpx);
          } else if (i == 1) {
            ctx.font = `normal 600 ${parseInt(25 * _wrpx)}px Microsoft YaHei`;
            ctx.fillText(mData[i][0], x - 20 * _wrpx, y + 30 * _hrpx);
            ctx.font = `normal 500 ${parseInt(23 * _wrpx)}px Microsoft YaHei`;
            ctx.fillText(mData[i][1], x + 40 * + _wrpx, y + 30 * _hrpx);
          } else if (i == 2) {
            ctx.font = `normal 600 ${parseInt(25 * _wrpx)}px Microsoft YaHei`;
            ctx.fillText(mData[i][0], x - 65 * _wrpx, y + 10 * _hrpx);
            ctx.font = `normal 600 ${parseInt(23 * _wrpx)}px Microsoft YaHei`;
            ctx.fillText(mData[i][1], x - 50 * _wrpx, y + 40 * _hrpx);
          } else if (i == 3) {
            ctx.font = `normal 600 ${parseInt(25 * _wrpx)}px Microsoft YaHei`;
            ctx.fillText(mData[i][0], x - 60 * _wrpx, y);
            ctx.font = `normal 600 ${parseInt(23 * _wrpx)}px Microsoft YaHei`;
            ctx.fillText(mData[i][1], x - 50 * _wrpx, y + 30 * _hrpx);
          } else {
            ctx.font = `normal 600 ${parseInt(25 * _wrpx)}px Microsoft YaHei`;
            ctx.fillText(mData[i][0], x - 20 * _wrpx, y - 10 * _hrpx);
            ctx.font = `normal 600 ${parseInt(23 * _wrpx)}px Microsoft YaHei`;
            ctx.fillText(mData[i][1], x + 40 * _wrpx, y - 10 * _hrpx);
          }

        }
        ctx.restore();
        //end
      //end
    

    //end

    //绘制2020年标签 start
      let list = luckItem.label;
      ctx.font = `normal bold ${parseInt(24 * _wrpx)}px Microsoft YaHei`;
      ctx.setFillStyle('#cb4646');
      ctx.fillText('2020年你会发生什么', 460 * _wrpx, 900 * _hrpx);

      ctx.save();
      //ctx,x,y,width,height,radius
      let constLabelX = 0, constLabelY = 0, textLength = 50;
      for (let i = 0; i < list.length; i++) {
        // constLabelX += 10; constLabelY +=10;
        if(i == 0) {
          constLabelX = 445 * _wrpx;
          constLabelY = 930 * _hrpx;

          // if(list[i].length >= 5) {
          //   constLabelY = 920 * _hrpx;
          // }
        } else if(i == 1) {
          constLabelX = 580 * _wrpx;
          constLabelY = 950 * _hrpx;
          // if(list[i].length >= 5) {
          //   constLabelY = 955 * _hrpx;
          // }
        } else if(i == 2) {
          constLabelX = 450 * _wrpx;
          constLabelY = 1000 * _hrpx;
          // if(list[i].length >= 5) {
          //   constLabelX = 430 * _wrpx;
          //   constLabelY = 1000 * _hrpx;
          // }
        } else if(i == 3) {
          constLabelX = 550 * _wrpx;
          constLabelY = 1050 * _hrpx;

          // if(list[i].length >= 6) {
          //   constLabelX = 550 * _wrpx;
          //   constLabelY = 1045 * _hrpx;
          // }
        } else if(i == 4) {
          constLabelX = 480 * _wrpx;
          constLabelY = 1100 * _hrpx;
        }

        if(list[i].length >= 4) {
          textLength = 60;
        }
        if(list[i].length >= 5) {
          textLength = 70;
        }
        if(list[i].length >= 6) {
          textLength = 80;
        }
        if(list[i].length >= 7) {
          textLength = 90;
        }

        // this.drawRoundRect(ctx, constLabelX, constLabelY, textLength, 20, 10);
        // ctx.fillStyle = 'rgba(218,169,113, 1)';
        // ctx.strokeStyle = "#FFF";
        // ctx.fill();
        // ctx.stroke();
        
        ctx.font = `normal bold ${parseInt(25 * _wrpx)}px Microsoft YaHei`;
        ctx.setFillStyle('#401b0a');
        ctx.fillText(list[i], constLabelX + 9, constLabelY + 14);
      }
    //end


    let codeWidth = 230, codeHeight = 60;
    if(_width < 365 || _height < 667)  {
      codeWidth = 190, codeHeight = 50;
    }
    ctx.drawImage(this.data.localCoderationUrl, 190 * _wrpx, 1180 * _hrpx, codeWidth, codeHeight);

    // 显示绘制
    ctx.draw();
    wx.hideLoading();

    
    if(isShowMove) {
      this.setData({
        showTipMove: true
      });
      setTimeout(() => {
        this.setData({
          showTipMove: false
        });
      }, 3000);
    }
    

    //将生成好的图片保存到本地，需要延迟一会，绘制期间耗时
    setTimeout(function () {
      wx.canvasToTempFilePath({
        canvasId: 'myCanvas',
        success: function (res) {
          let tempFilePath = res.tempFilePath;
          that.setData({
            loadImagePath: tempFilePath,
          });
        },
        fail: function (res) {
          console.log(res);
        }
      });
    }, 500);
  },

  changeLuck: function() {
    this.createNewImg(false);
  },

  showAction: function () {
    let _this = this;
    wx.showActionSheet({
      itemList: ['保存图片'],
      success(res) {
        let tapIndex = res.tapIndex;

        if(tapIndex == 0) {
          _this.saveHanlde();
        }
      },
      fail(res) {
        console.log(res.errMsg)
      }
    });
    // this.setData({
    //   actionSheetHidden: false
    // })
  },
  saveHanlde: function() {
    var self = this;
    wx.saveImageToPhotosAlbum({
      filePath: self.data.loadImagePath,
      success(res) {
        wx.showToast({
          title: '保存成功',
          icon: 'success',
          duration: 2000
        });
      }
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '快来预测属于你的鼠年关键字吧~',
      path: `pages/index/index`,
      success: function (res) {
        wx.showToast({
          title: '分享成功',
          icon: 'success',
          duration: 2000
        })
      }
    }
  }
})