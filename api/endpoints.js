/**
 * API端点配置
 * 集中管理API路径和HTTP方法
 */

export const ApiEndpoints = {
  // 认证相关
  AUTH: {
    LOGIN: { path: '/auth/login', method: 'post' },
    REGISTER: { path: '/auth/register', method: 'post' },
    LOGOUT: { path: '/auth/logout', method: 'post' },
    REFRESH: { path: '/auth/refresh', method: 'post' },
    WECHAT_LOGIN: { path: '/auth/wechat-login', method: 'post' },
  },
  
  // 用户相关
  USER: {
    PROFILE: { path: '/users/profile', method: 'get' },
    UPDATE_PROFILE: { path: '/users/profile', method: 'put' }, 
    PREFERENCES: { path: '/users/preferences', method: 'put' },
    NOTIFICATIONS: { path: '/users/notifications', method: 'put' },
  },
  
  // 首页相关
  HOME: {
    CARDS: { path: '/home/cards', method: 'get' },
    SWIPERS: { path: '/home/swipers', method: 'get' },
    RECOMMENDED: { path: '/home/recommended', method: 'get' },
    SEASONAL: { path: '/home/seasonal', method: 'get' },
  },
  
  // 菜谱相关
  RECIPE: {
    LIST: { path: '/recipes', method: 'get' },
    DETAIL: { path: '/recipes/:id', method: 'get' },
    CREATE: { path: '/recipes', method: 'post' },
    UPDATE: { path: '/recipes/:id', method: 'put' },
    DELETE: { path: '/recipes/:id', method: 'delete' },
    FAVORITE: { path: '/recipes/:id/favorite', method: 'post' },
    UNFAVORITE: { path: '/recipes/:id/unfavorite', method: 'post' },
    LIKE: { path: '/recipes/:id/like', method: 'post' },
    UNLIKE: { path: '/recipes/:id/unlike', method: 'post' },
    COMMENT: { path: '/recipes/:id/comments', method: 'post' },
  },
  
  // 购物清单相关
  SHOPPING: {
    LIST: { path: '/shopping-lists', method: 'get' },
    CREATE: { path: '/shopping-lists', method: 'post' },
    UPDATE: { path: '/shopping-lists/:id', method: 'put' },
    DELETE: { path: '/shopping-lists/:id', method: 'delete' },
    ADD_ITEM: { path: '/shopping-lists/:id/items', method: 'post' },
    UPDATE_ITEM: { path: '/shopping-lists/:id/items/:itemId', method: 'put' },
    DELETE_ITEM: { path: '/shopping-lists/:id/items/:itemId', method: 'delete' },
  },
  
  // 家庭成员相关
  FAMILY: {
    MEMBERS: { path: '/families/members', method: 'get' },
    ADD_MEMBER: { path: '/families/members', method: 'post' },
    UPDATE_MEMBER: { path: '/families/members/:id', method: 'put' },
    DELETE_MEMBER: { path: '/families/members/:id', method: 'delete' },
  },
};

/**
 * 获取API配置
 * @param {String} endpoint - 端点路径，例如: "AUTH.LOGIN"
 * @returns {Object} 包含path和method的对象
 */
export function getApiConfig(endpoint) {
  const parts = endpoint.split('.');
  if (parts.length !== 2) {
    throw new Error(`无效的端点路径: ${endpoint}`);
  }
  
  const [category, action] = parts;
  if (!ApiEndpoints[category] || !ApiEndpoints[category][action]) {
    throw new Error(`未找到API端点: ${endpoint}`);
  }
  
  return ApiEndpoints[category][action];
}

/**
 * 获取API路径
 * @param {String} endpoint - 端点路径，例如: "AUTH.LOGIN"
 * @param {Object} params - 路径参数，例如: {id: 123}
 * @returns {String} 完整的API路径
 */
export function getApiPath(endpoint, params = {}) {
  const config = getApiConfig(endpoint);
  let path = config.path;
  
  // 替换路径参数
  Object.keys(params).forEach(key => {
    path = path.replace(`:${key}`, params[key]);
  });
  
  return path;
}

export default {
  ApiEndpoints,
  getApiConfig,
  getApiPath
}; 