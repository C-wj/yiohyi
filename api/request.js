import config from '~/config';
import { getApiConfig, getApiPath } from './endpoints';

const { baseUrl } = config;
const delay = config.isMock ? 500 : 0;

/**
 * 发起网络请求
 * @param {String} url 请求路径
 * @param {String} method 请求方法，默认为'POST'
 * @param {Object} data 请求数据
 * @returns {Promise} 请求Promise
 */
function request(url, method = 'POST', data = {}) {
  const header = {
    'content-type': 'application/json',
    // 有其他content-type需求加点逻辑判断处理即可
  };
  // 获取token，有就丢进请求头
  const tokenString = wx.getStorageSync('access_token');
  if (tokenString) {
    header.Authorization = `Bearer ${tokenString}`;
    header.auth = tokenString; // 根据API规则，添加auth头
  }
  
  // 确保data不为空
  if (!data || Object.keys(data).length === 0) {
    data = {};
  }
  
  // 打印请求信息
  console.log(`请求: ${method} ${baseUrl + url}`, { data, headers: header });
  
  return new Promise((resolve, reject) => {
    wx.request({
      url: baseUrl + url,
      method,
      data,
      dataType: 'json', // 微信官方文档中介绍会对数据进行一次JSON.parse
      header,
      success(res) {
        setTimeout(() => {
          console.log(`响应: ${method} ${url}`, res.statusCode, res.data);
          
          // 处理HTTP状态码为200的情况
          if (res.statusCode === 200) {
            const responseData = res.data;
            
            // 处理API标准格式 {code: 0, data: object, msg: ''}
            if (responseData && responseData.code !== undefined) {
              // 直接返回标准格式的响应
              resolve(responseData);
            } else if (responseData && responseData.code === undefined) {
              // 非标准格式，转换为标准格式
              // 兼容旧后端返回 {message: '', data: {}} 格式
              if (responseData.message !== undefined && responseData.data !== undefined) {
                resolve({
                  code: 0,
                  data: responseData.data,
                  msg: responseData.message || 'success'
                });
              } 
              // 兼容旧后端返回 {status: 'success', data: {}} 格式
              else if (responseData.status === 'success' && responseData.data !== undefined) {
                resolve({
                  code: 0,
                  data: responseData.data,
                  msg: 'success'
                });
              }
              // 兼容旧后端返回 {status: 'error', message: ''} 格式
              else if (responseData.status === 'error' && responseData.message !== undefined) {
                reject({
                  code: 500,
                  data: null,
                  msg: responseData.message || '操作失败'
                });
              }
              // 兼容原始数据作为data返回
              else {
                resolve({
                  code: 0,
                  data: responseData,
                  msg: 'success'
                });
              }
            }
          } else {
            console.error(`请求失败: ${method} ${url}`, res.statusCode, res.data);
            // 状态码非200视为失败
            reject({
              code: res.statusCode,
              msg: res.data?.msg || res.data?.message || '请求失败',
              data: null
            });
          }
        }, delay);
      },
      fail(err) {
        setTimeout(() => {
          console.error(`请求错误: ${method} ${url}`, err);
          // 断网、服务器挂了都会fail回调，直接reject即可
          reject({
            code: 500,
            msg: err.errMsg || '网络异常',
            data: null
          });
        }, delay);
      }
    });
  });
}

/**
 * 通过API端点配置发起请求
 * @param {String} endpoint 端点配置键，例如: "USER.PROFILE"
 * @param {Object} data 请求数据
 * @param {Object} pathParams 路径参数，例如: {id: 123}
 * @returns {Promise} 请求Promise
 */
export function requestByEndpoint(endpoint, data = {}, pathParams = {}) {
  try {
    const config = getApiConfig(endpoint);
    const path = getApiPath(endpoint, pathParams);
    return request(path, config.method, data);
  } catch (error) {
    console.error(`请求端点错误:`, error);
    return Promise.reject({
      code: 500,
      msg: error.message || '请求配置错误',
      data: null
    });
  }
}

// 导出请求和服务地址
export default request;
