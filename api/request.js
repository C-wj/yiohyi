import config from '~/config';
import { MOCK_TO_REAL } from './endpoints';

const { baseUrl } = config;
const delay = config.isMock ? 500 : 0;

/**
 * 处理API路径映射
 * @param {string} url - 原始请求URL
 * @returns {string} - 映射后的URL
 */
function mapApiPath(url) {
  // 如果已经是以/api/v1开头，则不进行映射
  if (url.startsWith('/api/v1/')) {
    return url;
  }
  
  // 检查是否有对应的映射
  const mappedUrl = MOCK_TO_REAL[url];
  if (mappedUrl) {
    return mappedUrl;
  }
  
  // 没有映射，返回原始URL
  return url;
}

/**
 * 处理API响应
 * @param {Object} res - 原始响应
 * @returns {Object} - 处理后的响应
 */
function processResponse(res) {
  // 构造符合前端期望格式的响应
  return {
    code: res.statusCode,
    data: {
      data: res.data
    },
    statusCode: res.statusCode,
    originalResponse: res
  };
}

/**
 * 发送请求
 * @param {string} url - API路径
 * @param {string} method - 请求方法
 * @param {Object} data - 请求数据
 * @returns {Promise} - 请求Promise
 */
function request(url, method = 'GET', data = {}) {
  const header = {
    'content-type': 'application/json',
    // 有其他content-type需求加点逻辑判断处理即可
  };
  
  // 获取token，有就丢进请求头
  const tokenString = wx.getStorageSync('access_token');
  if (tokenString) {
    header.Authorization = `Bearer ${tokenString}`;
  }
  
  // 映射API路径
  const mappedUrl = mapApiPath(url);
  
  return new Promise((resolve, reject) => {
    wx.request({
      url: baseUrl + mappedUrl,
      method,
      data,
      dataType: 'json', // 微信官方文档中介绍会对数据进行一次JSON.parse
      header,
      success(res) {
        setTimeout(() => {
          // FastAPI返回的状态码在res.statusCode中
          if (res.statusCode >= 200 && res.statusCode < 300) {
            // 处理响应格式，使其符合前端期望
            resolve(processResponse(res));
          } else {
            // 处理错误
            reject(processResponse(res));
          }
        }, delay);
      },
      fail(err) {
        setTimeout(() => {
          // 断网、服务器挂了都会fail回调，直接reject即可
          reject(err);
        }, delay);
      },
    });
  });
}

// 导出请求和服务地址
export default request;
