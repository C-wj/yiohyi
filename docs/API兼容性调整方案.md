# API兼容性调整方案

## 问题背景

后端API使用RESTful设计风格，部分接口使用GET请求，而前端在之前的调整中将所有请求默认修改为POST方法，导致部分接口出现405错误。

## API标准化方案

为解决当前兼容性问题并提高前端代码的可维护性，我们实施了以下标准化方案：

### 1. 创建统一API端点配置

新增 `yiohyi/api/endpoints.js` 文件，集中定义所有API端点配置：

```javascript
export const ApiEndpoints = {
  // 认证相关
  AUTH: {
    LOGIN: { path: '/auth/login', method: 'post' },
    // ...其他认证接口
  },
  
  // 用户相关
  USER: {
    PROFILE: { path: '/users/profile', method: 'get' },
    // ...其他用户接口
  },
  
  // 首页相关
  HOME: {
    CARDS: { path: '/home/cards', method: 'get' },
    SWIPERS: { path: '/home/swipers', method: 'get' },
    // ...其他首页接口
  },
  
  // ...其他模块接口
};
```

### 2. 增强请求工具函数

在 `yiohyi/api/request.js` 中新增基于端点的请求方法：

```javascript
export function requestByEndpoint(endpoint, data = {}, pathParams = {}) {
  const config = getApiConfig(endpoint);
  const path = getApiPath(endpoint, pathParams);
  return request(path, config.method, data);
}
```

### 3. 更新API函数

为每个模块创建新的API函数，使用统一的端点配置：

```javascript
// auth.js 示例
export function getUserProfile() {
  return requestByEndpoint('USER.PROFILE');
}
```

### 4. 兼容性过渡方案

为确保现有代码平稳过渡，我们采取以下策略：

1. **兼容函数**：保留原有API函数，添加Compat后缀
   ```javascript
   // 原有函数
   export function getUserProfileCompat() {
     return request('/users/profile', 'get', {});
   }
   
   // 新函数
   export function getUserProfile() {
     return requestByEndpoint('USER.PROFILE');
   }
   ```

2. **逐步迁移**：分阶段更新各页面代码，从使用旧API函数迁移到新API函数

3. **统一响应处理**：使用 `handleApiResponse` 函数处理所有API响应

## 当前已完成工作

1. 创建API端点配置文件 `endpoints.js`
2. 增强请求工具函数，支持基于端点配置发起请求
3. 更新了认证、用户和首页相关API函数
4. 更新了首页的API调用，使用新的API函数

## 待完成工作

1. 更新其他页面的API调用，使用新的API函数
2. 定期检查API调用日志，确保不再出现405错误
3. 完成所有页面迁移后，考虑移除兼容性函数

## 开发指南

### 添加新API

1. 在 `endpoints.js` 中添加新的端点配置
2. 在对应模块的API文件中添加新函数，使用 `requestByEndpoint` 方法

### 调用API

```javascript
import { getUserProfile } from '~/api/auth';
import { handleApiResponse } from '~/utils/apiUtil';

async function fetchUserData() {
  try {
    const res = await getUserProfile();
    
    handleApiResponse(res, 
      (data) => {
        // 成功处理
        this.setData({ userInfo: data });
      },
      (error) => {
        // 错误处理
        console.error('获取用户信息失败', error);
      }
    );
  } catch (error) {
    showApiError(error);
  }
}
``` 