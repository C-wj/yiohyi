import config from '~/config';

const { baseUrl } = config;
const delay = config.isMock ? 500 : 0;
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
  return new Promise((resolve, reject) => {
    wx.request({
      url: baseUrl + url,
      method,
      data,
      dataType: 'json', // 微信官方文档中介绍会对数据进行一次JSON.parse
      header,
      success(res) {
        setTimeout(() => {
          // 处理HTTP状态码为200的情况
          if (res.statusCode === 200) {
            // 支持两种响应格式：
            // 1. 标准格式：{code: 200, msg: "xxx", data: xxx}
            // 2. 数组直接返回格式：[...]
            // 3. 其他直接返回格式
            
            // 如果响应包含code字段且code为200，使用标准格式处理
            if (res.data && res.data.code === 200) {
              resolve(res.data);
            } 
            // 如果响应是数组或其他格式，包装为标准格式
            else {
              resolve({
                code: 200,
                msg: "success",
                data: res.data
              });
            }
          } else {
            // 状态码非200视为失败
            reject(res);
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
