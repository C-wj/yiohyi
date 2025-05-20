/**
 * API工具函数 - 处理API响应
 * 根据@api.mdc规则，标准化后端返回
 */

/**
 * 处理API响应
 * @param {Object} response - API返回的原始响应，格式为 {code: number, data: object, msg: string}
 * @param {Function} successCallback - 成功时的回调函数
 * @param {Function} errorCallback - 错误时的回调函数
 * @returns {boolean} 处理结果是否成功
 */
export function handleApiResponse(response, successCallback, errorCallback) {
  // 判断是否为有效响应对象
  if (!response) {
    wx.showToast({
      title: '响应数据为空',
      icon: 'none',
      duration: 2000
    });
    
    if (errorCallback && typeof errorCallback === 'function') {
      errorCallback({ code: 500, msg: '响应数据为空', data: null });
    }
    return false;
  }

  // 判断是否为标准API响应
  if (typeof response.code !== 'undefined') {
    // code=0表示成功
    if (response.code === 0) {
      if (successCallback && typeof successCallback === 'function') {
        successCallback(response.data);
      }
      return true;
    } 
    // code=401表示需要登录
    else if (response.code === 401) {
      console.error('登录状态已失效，请重新登录');
      wx.removeStorageSync('access_token');
      wx.removeStorageSync('refresh_token');
      
      wx.showToast({
        title: response.msg || '请先登录',
        icon: 'none',
        duration: 2000,
        complete: () => {
          setTimeout(() => {
            wx.navigateTo({
              url: '/pages/login/login'
            });
          }, 2000);
        }
      });
    }
    // code=500表示系统异常
    else if (response.code === 500) {
      wx.showToast({
        title: '系统异常，请稍后重试',
        icon: 'none',
        duration: 2000
      });
    }
    // 其他code值表示业务异常
    else {
      wx.showToast({
        title: response.msg || '操作失败',
        icon: 'none',
        duration: 2000
      });
    }
    
    // 调用错误回调
    if (errorCallback && typeof errorCallback === 'function') {
      errorCallback(response);
    }
    return false;
  }
  
  // 非标准响应，提示错误
  wx.showToast({
    title: '返回数据格式错误',
    icon: 'none',
    duration: 2000
  });
  
  if (errorCallback && typeof errorCallback === 'function') {
    errorCallback({
      code: 500,
      msg: '返回数据格式错误',
      data: response
    });
  }
  return false;
}

/**
 * 展示API请求错误
 * @param {Object} error - 错误对象，格式为 {code: number, msg: string, data: any}
 */
export function showApiError(error) {
  let message = '操作失败';
  let code = 500;
  
  if (error) {
    if (typeof error.code !== 'undefined') {
      code = error.code;
    }
    
    if (error.msg) {
      message = error.msg;
    } else if (error.message) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }
  }
  
  // 根据错误码处理特殊情况
  if (code === 401) {
    // 401错误已在handleApiResponse中处理，这里不重复处理
    return;
  }
  
  wx.showToast({
    title: message,
    icon: 'none',
    duration: 2000
  });
}

/**
 * 格式化API响应为标准格式
 * @param {any} data - 响应数据
 * @param {string} msg - 响应消息
 * @param {number} code - 响应码，默认为0（成功）
 * @returns {Object} 标准格式的响应 {code, data, msg}
 */
export function formatApiResponse(data, msg = 'success', code = 0) {
  return {
    code,
    data,
    msg
  };
}

/**
 * API响应码常量
 */
export const ApiCode = {
  SUCCESS: 0,          // 成功
  UNAUTHORIZED: 401,   // 需要登录
  FORBIDDEN: 403,      // 权限不足
  NOT_FOUND: 404,      // 资源不存在
  VALIDATION_ERROR: 422, // 数据验证错误
  SERVER_ERROR: 500,   // 服务器错误
  BUSINESS_ERROR: 1000  // 业务错误基础码
};

export default {
  handleApiResponse,
  showApiError,
  formatApiResponse,
  ApiCode
}; 