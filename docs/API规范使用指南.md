# API规范使用指南（前端）

## 标准API响应格式

根据规范，所有API响应都遵循统一的格式：

```javascript
{
  "code": 0,       // 状态码，0表示成功
  "data": object,  // 业务数据，可以是任意JSON支持的数据类型
  "msg": ""        // 消息说明
}
```

## 响应码常量

为了代码的可读性和维护性，我们提供了API响应码常量：

```javascript
import { ApiCode } from '~/utils/apiUtil';

// 使用常量进行判断
if (response.code === ApiCode.SUCCESS) {
  // 处理成功响应
} else if (response.code === ApiCode.UNAUTHORIZED) {
  // 处理未授权情况
}
```

## 使用API工具函数

### 处理API响应

`handleApiResponse` 函数用于统一处理API响应：

```javascript
import { handleApiResponse } from '~/utils/apiUtil';

// 调用API
const response = await someApi();

// 处理响应
handleApiResponse(response, 
  (data) => {
    // 成功回调，data为response.data
    console.log('成功获取数据', data);
    // 更新页面数据
    this.setData({ 
      items: data.list,
      total: data.total
    });
  },
  (error) => {
    // 错误回调，error为完整错误响应
    console.error('获取数据失败', error);
  }
);
```

### 显示API错误

`showApiError` 函数用于显示API错误信息：

```javascript
import { showApiError } from '~/utils/apiUtil';

try {
  // 尝试调用API
  await someApi();
} catch (error) {
  // 显示错误信息
  showApiError(error);
}
```

### 创建标准格式响应

`formatApiResponse` 函数用于创建标准格式的响应（主要用于Mock数据）：

```javascript
import { formatApiResponse } from '~/utils/apiUtil';

// 创建成功响应
const successResponse = formatApiResponse(
  { id: 1, name: "示例" }, // data
  "操作成功" // msg
);

// 创建错误响应
const errorResponse = formatApiResponse(
  null, // data
  "操作失败", // msg
  500 // code
);
```

## 最佳实践

### API调用模式

推荐的API调用模式：

```javascript
import { handleApiResponse, showApiError } from '~/utils/apiUtil';

// 在页面方法中
async somePageMethod() {
  try {
    wx.showLoading({ title: '加载中' });
    
    const response = await api.someFunction();
    
    handleApiResponse(response, 
      (data) => {
        // 成功处理
        this.setData({ /* 更新数据 */ });
      }
    );
  } catch (error) {
    // 异常处理
    showApiError(error);
  } finally {
    wx.hideLoading();
  }
}
```

### 处理可能的格式差异

在与后端接口对接过程中，可能存在格式差异，建议：

1. 后端应修改接口返回格式，符合API规范
2. 如果后端暂时无法修改，可以在前端进行格式转换：

```javascript
const rawResponse = await api.someOldApi();

// 转换为标准格式
const standardResponse = {
  code: rawResponse.status === 'success' ? 0 : 500,
  data: rawResponse.data || null,
  msg: rawResponse.message || (rawResponse.status === 'success' ? 'success' : 'error')
};

// 然后正常处理
handleApiResponse(standardResponse, ...);
```

## 常见问题

### Q: 响应中缺少code字段怎么办？

A: 可能是后端API未按规范返回，可以：
- 修改后端API返回格式
- 使用上面提到的格式转换方法

### Q: handleApiResponse已经处理了错误，为什么还需要try/catch？

A: handleApiResponse处理的是API正常返回的错误码，而try/catch处理的是网络错误或其他运行时异常。两者结合使用可以全面处理各种错误情况。 