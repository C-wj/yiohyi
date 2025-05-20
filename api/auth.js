import request from './request';

// 微信登录
export function wechatLogin(code, userInfo = null) {
  return request('/auth/wechat-login', 'post', {
    code,
    user_info: userInfo
  });
}

// 刷新令牌
export function refreshToken(refreshToken) {
  return request('/auth/refresh', 'post', {
    refresh_token: refreshToken
  });
}

// 获取用户信息
export function getUserProfile() {
  return request('/users/profile', 'get');
}

// 更新用户信息
export function updateUserProfile(profileData) {
  return request('/users/profile', 'put', profileData);
}

// 退出登录
export function logout() {
  return request('/auth/logout', 'post');
}
