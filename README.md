# 家宴菜谱小程序

基于 TDesign 打造的家宴菜谱小程序，包含菜谱管理、家宴点菜系统、购物清单生成等功能，帮助家庭轻松规划和管理日常饮食。

## 功能预览

### 首页（社区菜谱）

<div style="display: flex">
  <img width="375" alt="image" src="https://tdesign.gtimg.com/miniprogram/template/home-1.png">
  <img width="375" alt="image" src="https://tdesign.gtimg.com/miniprogram/template/home-2.png">
</div>

### 我的菜谱

<img width="375" alt="image" src="https://tdesign.gtimg.com/miniprogram/template/publish-1.png">

### 家宴点菜系统

<div style="display: flex">
  <img width="375" alt="image" src="https://tdesign.gtimg.com/miniprogram/template/search-1.png">
  <img width="375" alt="image" src="https://tdesign.gtimg.com/miniprogram/template/setting-1.png">
</div>

### 个人中心
<div style="display: flex">
  <img width="375" alt="image" src="https://tdesign.gtimg.com/miniprogram/template/user-1.png">
  <img width="375" alt="image" src="https://tdesign.gtimg.com/miniprogram/template/user-2.png">
</div>

## 核心功能介绍

### 1. 家宴点菜系统

全新的家宴点菜系统采用餐厅点菜的交互模式，让家庭成员通过小程序为每日三餐"点菜"：

- **分类菜单展示**：菜品按照分类清晰展示，支持快速浏览和选择
- **家庭成员协作**：多个家庭成员可同时参与点菜过程
- **灵活的用餐计划**：支持为多天的早、中、晚餐分别安排不同菜品
- **份量自定义**：可根据实际用餐人数调整菜品份量
- **一键确认**：确认后生成完整的点菜订单

### 2. 智能购物清单

基于点菜订单自动生成购物清单，帮助家庭合理采购食材：

- **食材智能合并**：自动识别不同菜品中的相同食材，合并计算总量
- **分类展示**：食材按照肉类、蔬菜、调味料等分类展示
- **采购状态管理**：可标记已购买的食材，随时掌握采购进度
- **一键分享**：支持将购物清单分享给家人

### 3. 个人菜谱管理

强大的个人菜谱库让烹饪更有条理：

- **创建个人菜谱**：记录家庭独有的菜谱配方和烹饪技巧
- **从社区导入**：可将社区中喜欢的菜谱一键保存到个人菜谱库
- **编辑与分享**：随时编辑个人菜谱，也可分享到社区
- **智能搜索**：根据食材、口味等快速查找菜谱

## 开发者指南

### 目录结构
```
家宴小程序/
├── api/                     # API请求模块
├── components/              # 公共组件
├── pages/                   # 页面目录
│   ├── home/                # 首页(社区菜谱)
│   ├── my-recipes/          # 我的菜谱页
│   ├── recipe/              # 菜谱详情页
│   ├── order/               # 点菜系统页
│   ├── shopping/            # 购物清单页
│   ├── family/              # 家庭管理页
│   └── my/                  # 个人中心页
├── utils/                   # 公共工具函数
└── app.js                   # 应用入口
```

### 在开发者工具中预览

```bash
# 安装项目依赖
npm install
```

打开[微信开发者工具](https://mp.weixin.qq.com/debug/wxadoc/dev/devtools/download.html)，导入整个项目，构建 npm 包，就可以预览示例了。

### 基础库版本

最低基础库版本`^2.6.5`

## 反馈

有任何问题，建议通过 [Github issues](https://github.com/TDesignOteam/tdesign-miniprogram-starter/issues) 反馈。

## 开源协议

TDesign 遵循 [MIT 协议](https://github.com/TDesignOteam/tdesign-miniprogram-starter/blob/main/LICENSE)。
