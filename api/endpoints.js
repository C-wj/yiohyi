/**
 * API端点映射配置
 * 将前端原有的API路径映射到后端实际的API路径
 */

// 用户认证相关
export const AUTH = {
  LOGIN: '/auth/login',                // 登录
  REFRESH: '/auth/refresh',            // 刷新token
  PROFILE: '/users/profile',           // 获取用户信息
};

// 菜谱相关
export const RECIPES = {
  LIST: '/recipes',                    // 获取菜谱列表
  DETAIL: '/recipes/',                 // 获取菜谱详情 + id
  CREATE: '/recipes',                  // 创建菜谱
  UPDATE: '/recipes/',                 // 更新菜谱 + id
  FAVORITE: '/recipes/',               // 收藏菜谱 + id + /favorite
  MY_RECIPES: '/recipes/mine',         // 我的菜谱
  FAVORITES: '/recipes/favorites',     // 收藏的菜谱
  SEARCH: '/recipes/search',           // 搜索菜谱
  BY_CATEGORY: '/recipes/by-category/', // 按分类获取菜谱 + category_id
};

// 家庭相关
export const FAMILIES = {
  LIST: '/families/mine',              // 获取我的家庭
  CREATE: '/families',                 // 创建家庭
  DETAIL: '/families/',                // 获取家庭详情 + id
  UPDATE: '/families/',                // 更新家庭 + id
  MEMBERS: '/families/',               // 家庭成员 + id + /members
  INVITATION: '/families/',            // 家庭邀请 + id + /invitation
};

// 菜单计划相关
export const MENU_PLANS = {
  LIST: '/menu-plans/mine',            // 获取我的菜单计划
  CREATE: '/menu-plans',               // 创建菜单计划
  DETAIL: '/menu-plans/',              // 获取菜单计划详情 + id
  UPDATE: '/menu-plans/',              // 更新菜单计划 + id
  DISHES: '/menu-plans/',              // 菜单中的菜品 + id + /dishes
  BY_FAMILY: '/menu-plans/by-family/', // 按家庭获取菜单计划 + family_id
};

// 购物清单相关
export const SHOPPING_LISTS = {
  LIST: '/shopping-lists/mine',        // 我的购物清单
  CREATE: '/shopping-lists/generate',  // 生成购物清单
  DETAIL: '/shopping-lists/',          // 购物清单详情 + id
  UPDATE: '/shopping-lists/',          // 更新购物清单 + id
  ITEMS: '/shopping-lists/',           // 购物清单项目 + id + /items
  SHARE: '/shopping-lists/',           // 分享购物清单 + id + /share
  EXPORT: '/shopping-lists/',          // 导出购物清单 + id + /export
};

// 食材相关
export const INGREDIENTS = {
  RECOGNIZE: '/ingredients/recognize', // 食材智能识别
  DETAIL: '/ingredients/',             // 食材详情 + id
  CONVERT: '/ingredients/convert-unit',// 食材单位换算
  SEARCH: '/ingredients/search',       // 搜索食材
  MERGE: '/ingredients/merge-preview', // 食材合并预览
  CATEGORIES: '/ingredients/categories',// 食材分类
  SUBSTITUTES: '/ingredients/',        // 食材替代品 + id + /substitutes
};

// 其他辅助接口
export const OTHERS = {
  UPLOAD: '/uploads',                  // 文件上传
  TAGS: '/tags',                       // 系统标签
  SEASONAL: '/seasonal-recommendations',// 季节性推荐
  ANALYTICS: '/analytics/meals',       // 家宴统计分析
  FEEDBACK: '/feedback',               // 用户反馈
  CONFIG: '/config',                   // 系统配置
  WXACODE: '/wxacode/generate',        // 小程序码生成
  SHARE: '/share',                     // 内容分享
};

// Mock API映射到真实API
export const MOCK_TO_REAL = {
  // 首页相关
  '/home/cards': RECIPES.LIST,
  '/home/swipers': OTHERS.CONFIG + '?type=swipers',
  
  // 用户相关
  '/api/genPersonalInfo': AUTH.PROFILE,
  '/api/getServiceList': OTHERS.CONFIG + '?type=services',
  
  // 搜索相关
  '/api/searchHistory': '/users/search-history',
  '/api/searchPopular': '/recipes/popular-searches',
  
  // 登录相关
  '/login/postCodeVerify': AUTH.LOGIN,
}; 