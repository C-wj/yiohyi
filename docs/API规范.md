# API规范

## 响应格式标准化

根据规范，所有API响应必须遵循统一的返回格式：

```javascript
{
  "code": 0,       // 状态码，0表示成功
  "data": object,  // 业务数据，可以是任意JSON支持的数据类型
  "msg": ""        // 消息说明
}
```

## 状态码含义

响应状态码含义如下：

- `code = 0`: 成功，前端可以正常处理返回的数据
- `code = 401`: 需要登录，前端需要清除登录状态并引导用户去登录页
- `code = 500`: 系统异常，前端需要提示用户系统异常
- 其他非零值: 业务异常，前端需要显示`msg`字段内容

## 前端处理方式

### 请求封装

前端使用统一的请求工具进行API调用，已经在`request.js`中处理了各种响应格式，确保返回统一标准格式。

### 响应处理

使用`apiUtil.js`中提供的`handleApiResponse`函数处理所有API响应：

```javascript
import { handleApiResponse } from '~/utils/apiUtil';

// 调用API获取数据
const response = await someApiFunction();

// 处理响应
handleApiResponse(response, 
  (data) => {
    // 成功回调，data就是response.data
    console.log('操作成功', data);
  },
  (error) => {
    // 失败回调，error是完整的错误响应对象
    console.error('操作失败', error);
  }
);
```

### 错误处理

使用`apiUtil.js`中提供的`showApiError`函数显示API错误：

```javascript
import { showApiError } from '~/utils/apiUtil';

try {
  // 调用API操作
  await someApiFunction();
} catch (error) {
  // 显示错误提示
  showApiError(error);
}
```

## 模拟数据适配

为了确保开发环境中的模拟数据也符合API规范，使用`mockAdapter.js`中的工具函数处理模拟数据：

```javascript
import { adaptMockResponse } from '~/utils/mockAdapter';

// 将原始模拟数据转换为标准API响应格式
const standardResponse = adaptMockResponse(originalMockData);
```

## 开发指南

### 添加新API

1. 确保新API遵循标准响应格式
2. 在API处理函数中使用`handleApiResponse`处理响应

### 处理旧格式API

如果需要对接不符合标准格式的旧API，可以：

1. 在API调用后手动转换为标准格式
2. 修改后端API使其符合标准格式(推荐)

### 测试API响应

在开发阶段，可以使用以下方法测试API响应：

```javascript
// 测试成功响应
const successResponse = {
  code: 0,
  data: { test: 'data' },
  msg: 'success'
};

// 测试错误响应
const errorResponse = {
  code: 500,
  data: null,
  msg: '系统异常'
};

// 测试未授权响应
const unauthorizedResponse = {
  code: 401,
  data: null,
  msg: '请先登录'
};
``` 