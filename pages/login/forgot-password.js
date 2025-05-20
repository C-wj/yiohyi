import request from '~/api/request';

Page({
  data: {
    currentTab: 'phone', // 'phone' 或 'email'
    isSubmit: false,
    sendCodeCount: 0, // 手机验证码倒计时
    sendEmailCodeCount: 0, // 邮箱验证码倒计时
    phoneInfo: {
      phone: '',
      code: '',
      password: '',
      confirmPassword: ''
    },
    emailInfo: {
      email: '',
      code: '',
      password: '',
      confirmPassword: ''
    }
  },

  // 切换到手机找回
  switchToPhone() {
    this.setData({ currentTab: 'phone' });
    this.checkSubmitState();
  },

  // 切换到邮箱找回
  switchToEmail() {
    this.setData({ currentTab: 'email' });
    this.checkSubmitState();
  },

  // 检查提交按钮状态
  checkSubmitState() {
    if (this.data.currentTab === 'phone') {
      const { phone, code, password, confirmPassword } = this.data.phoneInfo;
      this.setData({
        isSubmit: phone && code && password && confirmPassword && password === confirmPassword
      });
    } else {
      const { email, code, password, confirmPassword } = this.data.emailInfo;
      this.setData({
        isSubmit: email && code && password && confirmPassword && password === confirmPassword
      });
    }
  },

  // 手机号表单变更
  onPhoneChange(e) {
    this.setData({ phoneInfo: { ...this.data.phoneInfo, phone: e.detail.value } });
    this.checkSubmitState();
  },

  onCodeChange(e) {
    this.setData({ phoneInfo: { ...this.data.phoneInfo, code: e.detail.value } });
    this.checkSubmitState();
  },

  onPhonePasswordChange(e) {
    this.setData({ phoneInfo: { ...this.data.phoneInfo, password: e.detail.value } });
    this.checkSubmitState();
  },

  onPhoneConfirmPasswordChange(e) {
    this.setData({ phoneInfo: { ...this.data.phoneInfo, confirmPassword: e.detail.value } });
    this.checkSubmitState();
  },

  // 邮箱表单变更
  onEmailChange(e) {
    this.setData({ emailInfo: { ...this.data.emailInfo, email: e.detail.value } });
    this.checkSubmitState();
  },

  onEmailCodeChange(e) {
    this.setData({ emailInfo: { ...this.data.emailInfo, code: e.detail.value } });
    this.checkSubmitState();
  },

  onEmailPasswordChange(e) {
    this.setData({ emailInfo: { ...this.data.emailInfo, password: e.detail.value } });
    this.checkSubmitState();
  },

  onEmailConfirmPasswordChange(e) {
    this.setData({ emailInfo: { ...this.data.emailInfo, confirmPassword: e.detail.value } });
    this.checkSubmitState();
  },

  // 发送手机验证码
  sendPhoneCode() {
    const { phone } = this.data.phoneInfo;
    
    if (!phone) {
      wx.showToast({
        title: '请输入手机号',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      wx.showToast({
        title: '手机号格式错误',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    // 发送验证码
    request('/auth/send-reset-code', 'post', { phone }).then(() => {
      // 开始倒计时
      this.setData({ sendCodeCount: 60 });
      
      const timer = setInterval(() => {
        if (this.data.sendCodeCount <= 1) {
          clearInterval(timer);
          this.setData({ sendCodeCount: 0 });
        } else {
          this.setData({ sendCodeCount: this.data.sendCodeCount - 1 });
        }
      }, 1000);
      
      wx.showToast({
        title: '验证码已发送',
        icon: 'success',
        duration: 2000
      });
    }).catch(error => {
      wx.showToast({
        title: error.msg || '发送失败',
        icon: 'none',
        duration: 2000
      });
    });
  },

  // 发送邮箱验证码
  sendEmailCode() {
    const { email } = this.data.emailInfo;
    
    if (!email) {
      wx.showToast({
        title: '请输入邮箱',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    // 验证邮箱格式
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      wx.showToast({
        title: '邮箱格式错误',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    // 发送验证码
    request('/auth/send-email-reset-code', 'post', { email }).then(() => {
      // 开始倒计时
      this.setData({ sendEmailCodeCount: 60 });
      
      const timer = setInterval(() => {
        if (this.data.sendEmailCodeCount <= 1) {
          clearInterval(timer);
          this.setData({ sendEmailCodeCount: 0 });
        } else {
          this.setData({ sendEmailCodeCount: this.data.sendEmailCodeCount - 1 });
        }
      }, 1000);
      
      wx.showToast({
        title: '验证码已发送',
        icon: 'success',
        duration: 2000
      });
    }).catch(error => {
      wx.showToast({
        title: error.msg || '发送失败',
        icon: 'none',
        duration: 2000
      });
    });
  },

  // 重置密码
  resetPassword() {
    // 检查密码强度
    let password = '';
    let confirmPassword = '';
    let resetData = {};
    
    if (this.data.currentTab === 'phone') {
      password = this.data.phoneInfo.password;
      confirmPassword = this.data.phoneInfo.confirmPassword;
      
      if (password !== confirmPassword) {
        wx.showToast({
          title: '两次密码不一致',
          icon: 'error',
          duration: 2000
        });
        return;
      }
      
      resetData = {
        phone: this.data.phoneInfo.phone,
        code: this.data.phoneInfo.code,
        newPassword: password
      };
    } else {
      password = this.data.emailInfo.password;
      confirmPassword = this.data.emailInfo.confirmPassword;
      
      if (password !== confirmPassword) {
        wx.showToast({
          title: '两次密码不一致',
          icon: 'error',
          duration: 2000
        });
        return;
      }
      
      resetData = {
        email: this.data.emailInfo.email,
        code: this.data.emailInfo.code,
        newPassword: password
      };
    }
    
    // 检查密码强度
    if (password.length < 8 || 
        !/[a-zA-Z]/.test(password) || 
        !/\d/.test(password)) {
      wx.showToast({
        title: '密码强度不足',
        icon: 'error',
        duration: 2000
      });
      return;
    }
    
    // 发送重置密码请求
    request('/auth/reset-password', 'post', resetData).then(() => {
      wx.showToast({
        title: '密码重置成功',
        icon: 'success',
        duration: 2000,
        success: () => {
          setTimeout(() => {
            wx.navigateBack();
          }, 2000);
        }
      });
    }).catch(error => {
      wx.showToast({
        title: error.msg || '重置失败',
        icon: 'error',
        duration: 2000
      });
    });
  }
}); 