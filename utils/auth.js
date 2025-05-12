/**
 * 认证相关工具函数
 */

// 检查是否已登录
export function isLoggedIn() {
  return !!wx.getStorageSync('access_token');
}

// 保存登录信息
export function saveLoginInfo(loginData) {
  if (!loginData) return false;
  
  try {
    // 保存token
    if (loginData.access_token) {
      wx.setStorageSync('access_token', loginData.access_token);
    }
    
    if (loginData.refresh_token) {
      wx.setStorageSync('refresh_token', loginData.refresh_token);
    }
    
    // 保存用户信息
    if (loginData.user) {
      wx.setStorageSync('userInfo', loginData.user);
      
      // 更新全局用户信息
      const app = getApp();
      if (app && app.globalData) {
        app.globalData.userInfo = loginData.user;
      }
    }
    
    return true;
  } catch (error) {
    console.error('保存登录信息失败', error);
    return false;
  }
}

// 清除登录信息
export function clearLoginInfo() {
  try {
    wx.removeStorageSync('access_token');
    wx.removeStorageSync('refresh_token');
    wx.removeStorageSync('userInfo');
    
    // 清除全局用户信息
    const app = getApp();
    if (app && app.globalData) {
      app.globalData.userInfo = null;
    }
    
    return true;
  } catch (error) {
    console.error('清除登录信息失败', error);
    return false;
  }
}

// 获取用户信息
export function getUserInfo() {
  try {
    return wx.getStorageSync('userInfo') || null;
  } catch (error) {
    console.error('获取用户信息失败', error);
    return null;
  }
}

// 检查登录并跳转
export function checkLoginAndRedirect(redirectUrl = '/pages/login/wechat-login') {
  if (!isLoggedIn()) {
    wx.navigateTo({
      url: redirectUrl
    });
    return false;
  }
  return true;
}
