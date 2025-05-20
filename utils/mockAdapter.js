/**
 * 模拟数据适配器
 * 确保所有模拟数据也符合统一的API响应格式 {code: 0, data: object, msg: ''}
 */

/**
 * 转换模拟数据为标准API响应格式
 * @param {any} mockData - 原始模拟数据
 * @returns {Object} 标准格式的响应 {code: 0, data: object, msg: ''}
 */
export function adaptMockResponse(mockData) {
  // 已经符合标准格式
  if (mockData && typeof mockData.code !== 'undefined' && mockData.data !== undefined) {
    return mockData;
  }
  
  // 符合旧的格式 { status: 'success', data: {} }
  if (mockData && mockData.status === 'success' && mockData.data !== undefined) {
    return {
      code: 0,
      data: mockData.data,
      msg: mockData.message || 'success'
    };
  }
  
  // 符合旧的格式 { message: '', data: {} }
  if (mockData && mockData.message !== undefined && mockData.data !== undefined) {
    return {
      code: 0,
      data: mockData.data,
      msg: mockData.message
    };
  }
  
  // 其他格式，直接将整个数据作为data返回
  return {
    code: 0,
    data: mockData,
    msg: 'success'
  };
}

/**
 * 创建标准格式的成功响应
 * @param {any} data - 响应数据
 * @param {string} msg - 成功消息
 * @returns {Object} 标准格式的成功响应
 */
export function createSuccessResponse(data, msg = 'success') {
  return {
    code: 0,
    data: data || null,
    msg
  };
}

/**
 * 创建标准格式的错误响应
 * @param {string} msg - 错误消息
 * @param {number} code - 错误码，默认为500
 * @param {any} data - 错误相关的数据
 * @returns {Object} 标准格式的错误响应
 */
export function createErrorResponse(msg, code = 500, data = null) {
  return {
    code,
    data,
    msg: msg || '操作失败'
  };
}

/**
 * 创建需要登录的响应
 * @param {string} msg - 错误消息
 * @returns {Object} 标准格式的需要登录响应
 */
export function createUnauthorizedResponse(msg = '请先登录') {
  return createErrorResponse(msg, 401);
}

export default {
  adaptMockResponse,
  createSuccessResponse,
  createErrorResponse,
  createUnauthorizedResponse
}; 