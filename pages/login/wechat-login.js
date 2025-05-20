import request from '~/api/request';

Page({
  data: {
    isLoading: false,
    errorMessage: '',
  },

  onLoad() {
    // 页面加载时检查是否已登录
    const token = wx.getStorageSync('access_token');
    if (token) {
      // 已登录，跳转到首页
      wx.switchTab({
        url: '/pages/home/index',
      });
    }
  },

  // 微信登录
  handleWechatLogin() {
    this.setData({
      isLoading: true,
      errorMessage: '',
    });

    // 调用微信登录接口
    wx.login({
      success: (res) => {
        if (res.code) {
          // 获取到登录凭证code，调用后端接口
          this.loginWithCode(res.code);
        } else {
          this.setData({
            isLoading: false,
            errorMessage: '微信登录失败: ' + res.errMsg,
          });
        }
      },
      fail: (err) => {
        this.setData({
          isLoading: false,
          errorMessage: '微信登录失败: ' + err.errMsg,
        });
      }
    });
  },

  // 使用code调用后端登录接口
  async loginWithCode(code) {
    try {
      // 调用后端微信登录接口
      const res = await request('/auth/wechat-login', 'post', {
        code: code,
        user_info: null // 可以在用户授权后获取更多信息
      });

      if (res.code === 200) {
        // 登录成功，保存token和用户信息
        wx.setStorageSync('access_token', res.data.access_token);
        wx.setStorageSync('refresh_token', res.data.refresh_token);
        wx.setStorageSync('userInfo', res.data.user);
        
        // 更新全局用户信息
        const app = getApp();
        app.globalData.userInfo = res.data.user;
        
        // 跳转到首页
        wx.switchTab({
          url: '/pages/my/index',
        });
      } else {
        this.setData({
          isLoading: false,
          errorMessage: res.msg || '登录失败，请重试',
        });
      }
    } catch (error) {
      console.error('登录请求失败', error);
      let errorMsg = '登录请求失败，请检查网络连接';
      if (error.data && error.data.detail) {
        errorMsg = error.data.detail;
      }
      this.setData({
        isLoading: false,
        errorMessage: errorMsg,
      });
    }
  },

  // 返回上一页
  handleBack() {
    wx.navigateBack();
  }
});
