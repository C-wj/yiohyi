import request from '~/api/request';

Page({
  data: {
    phoneNumber: '',
    sendCodeCount: 60,
    verifyCode: '',
  },

  timer: null,

  onLoad(options) {
    const { phoneNumber } = options;
    if (phoneNumber) {
      this.setData({ phoneNumber });
    }
    this.countDown();
  },

  onVerifycodeChange(e) {
    this.setData({
      verifyCode: e.detail.value,
    });
  },

  countDown() {
    this.setData({ sendCodeCount: 60 });
    this.timer = setInterval(() => {
      if (this.data.sendCodeCount <= 0) {
        this.setData({ isSend: false, sendCodeCount: 0 });
        clearInterval(this.timer);
      } else {
        this.setData({ sendCodeCount: this.data.sendCodeCount - 1 });
      }
    }, 1000);
  },

  sendCode() {
    if (this.data.sendCodeCount === 0) {
      this.countDown();
    }
  },

  async login() {
    try {
      // 调用微信登录获取code
      const wxLoginRes = await this.wxLogin();
      
      // 调用后端登录接口
      const loginParams = {
        code: wxLoginRes.code,
        verify_code: this.data.verifyCode,
        phone_number: this.data.phoneNumber
      };
      
      const res = await request('/auth/login', 'POST', loginParams);
      
      if (res.code >= 200 && res.code < 300) {
        // 保存token
        await wx.setStorageSync('access_token', res.data.data.token);
        
        // 返回到个人中心
        wx.switchTab({
          url: `/pages/my/index`,
        });
      } else {
        wx.showToast({
          title: '登录失败，请重试',
          icon: 'none'
        });
      }
    } catch (error) {
      console.error('登录失败', error);
      wx.showToast({
        title: '登录失败，请重试',
        icon: 'none'
      });
    }
  },
  
  // 调用微信登录
  wxLogin() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: resolve,
        fail: reject
      });
    });
  }
});
