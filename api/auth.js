import request, { requestByEndpoint } from './request';
import { ApiEndpoints } from './endpoints';

// 微信登录
export function wechatLogin(code, userInfo = null) {
  return requestByEndpoint('AUTH.WECHAT_LOGIN', {
    code,
    user_info: userInfo
  });
}

// 普通登录
export function login(username, password) {
  return requestByEndpoint('AUTH.LOGIN', {
    username,
    password
  });
}

// 注册
export function register(userData) {
  return requestByEndpoint('AUTH.REGISTER', userData);
}

// 刷新令牌
export function refreshToken(refreshToken) {
  return requestByEndpoint('AUTH.REFRESH', {
    refresh_token: refreshToken
  });
}

// 获取用户信息
export function getUserProfile() {
  return requestByEndpoint('USER.PROFILE');
}

// 更新用户信息
export function updateUserProfile(profileData) {
  return requestByEndpoint('USER.UPDATE_PROFILE', profileData);
}

// 退出登录
export function logout() {
  return requestByEndpoint('AUTH.LOGOUT');
}

// 兼容性API - 使用传统request方法
// 这些函数将在过渡期内保留，以便与现有代码兼容
// 之后将逐步迁移到endpoints系统

// 微信登录 - 兼容版
export function wechatLoginCompat(code, userInfo = null) {
  return request('/auth/wechat-login', 'post', {
    code,
    user_info: userInfo
  });
}

// 获取用户信息 - 兼容版
export function getUserProfileCompat() {
  return request('/users/profile', 'get', {});
}

// 更新用户信息 - 兼容版
export function updateUserProfileCompat(profileData) {
  return request('/users/profile', 'post', profileData);
}

// 退出登录 - 兼容版
export function logoutCompat() {
  return request('/auth/logout', 'post', {});
}

// 刷新令牌 - 兼容版
export function refreshTokenCompat(refreshToken) {
  return request('/auth/refresh', 'post', {
    refresh_token: refreshToken
  });
}
