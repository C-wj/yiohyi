import request from '~/api/request';
import { handleApiResponse, showApiError } from '~/utils/apiUtil';

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
      console.log('登录响应:', res);
      
      handleApiResponse(res, (tokenData) => {
        // 登录成功处理
        if (tokenData.access_token) {
          // 存储令牌
          wx.setStorageSync('access_token', tokenData.access_token);
          if (tokenData.refresh_token) {
            wx.setStorageSync('refresh_token', tokenData.refresh_token);
          }
          
          // 如果响应中包含用户信息，则存储
          if (tokenData.user || tokenData.profile) {
            const userInfo = tokenData.user || tokenData.profile || {};
            // 存储用户基本信息，便于快速获取
            if (userInfo.nickname || userInfo.profile?.nickname) {
              wx.setStorageSync('userNickname', userInfo.nickname || userInfo.profile?.nickname);
            }
            if (userInfo.avatar || userInfo.profile?.avatar) {
              wx.setStorageSync('userAvatar', userInfo.avatar || userInfo.profile?.avatar);
            }
          }
          
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
            title: '登录成功但未获取到令牌',
            icon: 'none',
            duration: 2000
          });
        }
      });
    } catch (error) {
      console.error('登录失败:', error);
      showApiError(error);
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
        email: this.data.registerInfo.email || '',
        phone: this.data.registerInfo.phone || ''
      };

      const res = await request('/auth/register', 'post', registerData);
      console.log('注册响应:', res);
      
      handleApiResponse(res, (userData) => {
        // 注册成功处理
        
        // 如果返回了token
        if (userData.access_token) {
          wx.setStorageSync('access_token', userData.access_token);
          if (userData.refresh_token) {
            wx.setStorageSync('refresh_token', userData.refresh_token);
          }
        }
        
        // 将注册时输入的昵称保存到storage中
        wx.setStorageSync('userNickname', this.data.registerInfo.nickname);
        
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
      });
    } catch (error) {
      console.error('注册失败:', error);
      showApiError(error);
    }
  },

  // 微信一键登录
  wechatLogin() {
    wx.navigateTo({
      url: '/pages/login/wechat-login',
    });
  }
});
