import request from '~/api/request';

Page({
  data: {
    isCheck: false,
    isSubmit: false,
    showRegister: true,
    isRegister: false,
    passwordInfo: {
      account: '',
      password: '',
    },
    registerInfo: {
      username: '',
      nickname: '',
      password: '',
      confirmPassword: '',
      email: '',
      phone: '',
    },
    radioValue: '',
  },

  /* 自定义功能函数 */
  changeSubmit() {
    if (this.data.isRegister) {
      if (
        this.data.registerInfo.username !== '' &&
        this.data.registerInfo.nickname !== '' &&
        this.data.registerInfo.password !== '' &&
        this.data.registerInfo.confirmPassword !== '' &&
        this.data.registerInfo.password === this.data.registerInfo.confirmPassword &&
        this.data.isCheck
      ) {
        this.setData({ isSubmit: true });
      } else {
        this.setData({ isSubmit: false });
      }
    } else if (this.data.passwordInfo.account !== '' && this.data.passwordInfo.password !== '' && this.data.isCheck) {
      this.setData({ isSubmit: true });
    } else {
      this.setData({ isSubmit: false });
    }
  },

  // 用户协议选择变更
  onCheckChange(e) {
    const { value } = e.detail;
    this.setData({
      radioValue: value,
      isCheck: value === 'agree',
    });
    this.changeSubmit();
  },

  // 登录表单输入变更
  onAccountChange(e) {
    this.setData({ passwordInfo: { ...this.data.passwordInfo, account: e.detail.value } });
    this.changeSubmit();
  },

  onPasswordChange(e) {
    this.setData({ passwordInfo: { ...this.data.passwordInfo, password: e.detail.value } });
    this.changeSubmit();
  },

  // 注册表单输入变更
  onRegisterUsernameChange(e) {
    this.setData({ registerInfo: { ...this.data.registerInfo, username: e.detail.value } });
    this.changeSubmit();
  },

  onRegisterNicknameChange(e) {
    this.setData({ registerInfo: { ...this.data.registerInfo, nickname: e.detail.value } });
    this.changeSubmit();
  },

  onRegisterPasswordChange(e) {
    this.setData({ registerInfo: { ...this.data.registerInfo, password: e.detail.value } });
    this.changeSubmit();
  },

  onRegisterConfirmPasswordChange(e) {
    this.setData({ registerInfo: { ...this.data.registerInfo, confirmPassword: e.detail.value } });
    this.changeSubmit();
  },

  // 显示注册表单
  showRegisterForm() {
    this.setData({ 
      isRegister: true,
      showRegister: false,
      isSubmit: false 
    });
  },

  // 显示登录表单
  showLoginForm() {
    this.setData({ 
      isRegister: false,
      showRegister: true,
      isSubmit: false 
    });
  },

  // 账号密码登录
  async login() {
    try {
      // 直接发送passwordInfo对象，不再包装到data字段中
      const res = await request('/auth/login', 'post', this.data.passwordInfo);
      
      if (res.code === 200) {
        await wx.setStorageSync('access_token', res.data.access_token);
        await wx.setStorageSync('refresh_token', res.data.refresh_token);
        
        wx.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 2000,
          success: () => {
            wx.switchTab({
              url: `/pages/my/index`,
            });
          }
        });
      } else {
        wx.showToast({
          title: res.msg || '登录失败',
          icon: 'error',
          duration: 2000
        });
      }
    } catch (error) {
      console.error('登录失败:', error);
      let errorMsg = '登录失败';
      if (error.data && error.data.detail) {
        errorMsg = error.data.detail;
      }
      wx.showToast({
        title: errorMsg,
        icon: 'error',
        duration: 2000
      });
    }
  },

  // 注册新用户
  async register() {
    // 检查密码是否一致
    if (this.data.registerInfo.password !== this.data.registerInfo.confirmPassword) {
      wx.showToast({
        title: '两次密码不一致',
        icon: 'error',
        duration: 2000
      });
      return;
    }

    try {
      // 构建注册数据
      const registerData = {
        username: this.data.registerInfo.username,
        password: this.data.registerInfo.password,
        nickname: this.data.registerInfo.nickname,
        email: this.data.registerInfo.email || undefined,
        phone: this.data.registerInfo.phone || undefined
      };

      const res = await request('/auth/register', 'post', registerData);
      
      // 存储令牌
      await wx.setStorageSync('access_token', res.data.access_token);
      await wx.setStorageSync('refresh_token', res.data.refresh_token);
      
      wx.showToast({
        title: '注册成功',
        icon: 'success',
        duration: 2000,
        success: () => {
          wx.switchTab({
            url: `/pages/my/index`,
          });
        }
      });
    } catch (error) {
      console.error('注册失败:', error);
      wx.showToast({
        title: error.msg || '注册失败',
        icon: 'error',
        duration: 2000
      });
    }
  },

  // 微信一键登录
  wechatLogin() {
    wx.navigateTo({
      url: '/pages/login/wechat-login',
    });
  }
});
