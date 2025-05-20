// pages/login/login.js

const app = getApp()

Page({
  data: {
    currentTab: 'password', // 当前选中的标签页 'password' 或 'code'
    phoneNumber: '',
    password: '',
    code: '',
    isShowPassword: false,
    isCheck: false,
    submitDisabled: true,
    countdown: 0,
    timer: null,
  },

  onLoad: function (options) {
    
  },

  // 切换标签页
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      currentTab: tab
    });
    this.changeSubmit();
  },

  // 输入手机号
  inputPhone(e) {
    this.setData({
      phoneNumber: e.detail.value
    });
    this.changeSubmit();
  },

  // 输入密码
  inputPassword(e) {
    this.setData({
      password: e.detail.value
    });
    this.changeSubmit();
  },

  // 输入验证码
  inputCode(e) {
    this.setData({
      code: e.detail.value
    });
    this.changeSubmit();
  },

  // 切换密码显示状态
  togglePasswordVisibility() {
    this.setData({
      isShowPassword: !this.data.isShowPassword
    });
  },

  // 协议同意变更
  onCheckboxChange(e) {
    this.setData({
      isCheck: !this.data.isCheck
    });
    this.changeSubmit();
  },

  // 改变提交按钮状态
  changeSubmit() {
    let isDisabled = true;
    
    if (this.data.currentTab === 'password') {
      // 密码登录验证
      const isValidPhone = /^1[3-9]\d{9}$/.test(this.data.phoneNumber);
      const isValidPassword = this.data.password.length >= 6;
      
      isDisabled = !(isValidPhone && isValidPassword && this.data.isCheck);
    } else {
      // 验证码登录验证
      const isValidPhone = /^1[3-9]\d{9}$/.test(this.data.phoneNumber);
      const isValidCode = /^\d{6}$/.test(this.data.code);
      
      isDisabled = !(isValidPhone && isValidCode && this.data.isCheck);
    }
    
    this.setData({
      submitDisabled: isDisabled
    });
  },

  // 发送验证码
  sendCode() {
    if (this.data.countdown > 0) return;
    
    const isValidPhone = /^1[3-9]\d{9}$/.test(this.data.phoneNumber);
    if (!isValidPhone) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }
    
    // 模拟发送验证码
    wx.showToast({
      title: '验证码已发送',
      icon: 'success'
    });
    
    // 开始倒计时
    this.setData({
      countdown: 60
    });
    
    this.data.timer = setInterval(() => {
      if (this.data.countdown <= 1) {
        clearInterval(this.data.timer);
        this.setData({
          countdown: 0
        });
      } else {
        this.setData({
          countdown: this.data.countdown - 1
        });
      }
    }, 1000);
  },

  // 表单提交
  formSubmit() {
    if (this.data.submitDisabled) return;
    
    if (this.data.currentTab === 'password') {
      // 密码登录
      console.log('密码登录:', {
        phone: this.data.phoneNumber,
        password: this.data.password
      });
      
      // 模拟登录成功
      wx.showLoading({
        title: '登录中...',
      });
      
      setTimeout(() => {
        wx.hideLoading();
        // 登录成功后跳转
        wx.switchTab({
          url: '/pages/index/index'
        });
      }, 1500);
      
    } else {
      // 验证码登录
      console.log('验证码登录:', {
        phone: this.data.phoneNumber,
        code: this.data.code
      });
      
      // 模拟登录成功
      wx.showLoading({
        title: '登录中...',
      });
      
      setTimeout(() => {
        wx.hideLoading();
        // 登录成功后跳转
        wx.switchTab({
          url: '/pages/index/index'
        });
      }, 1500);
    }
  },

  // 忘记密码
  forgetPassword() {
    wx.navigateTo({
      url: '/pages/password/reset'
    });
  },

  // 切换到注册页面
  goToRegister() {
    wx.navigateTo({
      url: '/pages/register/register'
    });
  },

  onUnload() {
    // 清除定时器
    if (this.data.timer) {
      clearInterval(this.data.timer);
    }
  }
}) 