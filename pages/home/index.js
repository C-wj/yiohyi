import Message from 'tdesign-miniprogram/message/index';
import request from '~/api/request';
import Toast from 'tdesign-miniprogram/toast/index';

// 获取应用实例
// const app = getApp()

Page({
  data: {
    enable: false,
    swiperList: [],
    cardInfo: [],
    // 发布
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName'), // 如需尝试获取用户信息可改为false
    swiperCurrent: 0,
    categories: [
      { id: 0, name: '推荐' },
      { id: 1, name: '家常菜' },
      { id: 2, name: '川菜' },
      { id: 3, name: '粤菜' },
      { id: 4, name: '早餐' },
      { id: 5, name: '午餐' },
      { id: 6, name: '晚餐' },
      { id: 7, name: '快手菜' },
      { id: 8, name: '素食' },
      { id: 9, name: '凉菜' },
      { id: 10, name: '汤羹' }
    ],
    currentCategory: 0,
    recipeList: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    refreshing: false,
    searchValue: '',
    recommended: [],
    hasRecommendation: false,
    recommendationLoading: false,
    
    // 应季食材
    seasonalIngredients: [],
    seasonLoaded: false
  },
  // 生命周期
  async onReady() {
    const [cardRes, swiperRes] = await Promise.all([
      request('/home/cards').then((res) => res.data),
      request('/home/swipers').then((res) => res.data),
    ]);

    this.setData({
      cardInfo: cardRes.data,
      focusCardInfo: cardRes.data.slice(0, 3),
      swiperList: swiperRes.data,
    });
  },
  onLoad(option) {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true,
      });
    }
    if (option.oper) {
      let content = '';
      if (option.oper === 'release') {
        content = '发布成功';
      } else if (option.oper === 'save') {
        content = '保存成功';
      }
      this.showOperMsg(content);
    }
    this.initData();
    this.getRecommendedRecipes();
    this.getSeasonalIngredients();
  },
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        value: 'home'
      });
    }
  },
  onReachBottom() {
    // 此处不再需要，改用scroll-view组件处理
  },
  onRefresh() {
    this.setData({ refreshing: true });
    this.initData().then(() => {
      this.setData({ refreshing: false });
    });
  },
  // 下拉刷新处理函数
  onPulling() {
    // 下拉中的处理逻辑
  },
  // 加载更多数据
  loadMore() {
    if (this.data.hasMore) {
      this.loadMoreRecipes();
    }
  },
  async initData() {
    wx.showLoading({
      title: '加载中...',
    });
    
    try {
      // 获取轮播图数据
      const swipersRes = await request('/home/swipers');
      
      // 获取菜谱列表
      const recipesRes = await request('/home/cards');
      
      // 确保有数据返回
      if (swipersRes.data && recipesRes.data) {
        // 更新数据
        this.setData({
          swiperList: Array.isArray(swipersRes.data) ? swipersRes.data.map(item => ({
            image: item.image_url || item.image,
            key: item.id || Math.random().toString(36).substring(2)
          })) : [],
          recipeList: this.processRecipeData(recipesRes.data),
          hasMore: Array.isArray(recipesRes.data) && recipesRes.data.length >= this.data.pageSize,
          page: 1
        });
      }
    } catch (error) {
      console.error('加载数据失败', error);
      Toast({
        context: this,
        selector: '#t-toast',
        message: '数据加载失败，请重试',
      });
    } finally {
      wx.hideLoading();
    }
  },
  async loadMoreRecipes() {
    if (!this.data.hasMore) return;
    
    this.setData({
      page: this.data.page + 1
    });
    
    wx.showLoading({
      title: '加载中...',
    });
    
    try {
      const response = await request('/home/cards');
      
      if (response.data) {
        const newRecipes = this.processRecipeData(response.data);
        
        // 更新列表数据
        this.setData({
          recipeList: [...this.data.recipeList, ...newRecipes],
          hasMore: Array.isArray(response.data) && response.data.length >= this.data.pageSize
        });
      }
    } catch (error) {
      console.error('加载更多失败', error);
      Toast({
        context: this,
        selector: '#t-toast',
        message: '加载更多失败，请重试',
      });
    } finally {
      wx.hideLoading();
    }
  },
  processRecipeData(data) {
    if (!Array.isArray(data)) {
      console.warn('处理的数据不是数组格式', data);
      return [];
    }
    
    return data.map(item => ({
      id: item.id || Math.random().toString(36).substr(2, 9),
      title: item.title || `美味${(item.description || item.desc || '').substring(0, 10)}`,
      image: item.image_url || item.image || item.url,
      author: {
        name: '厨艺达人',
        avatar: '/static/avatar1.png'
      },
      likes: Math.floor(Math.random() * 1000),
      isLiked: false,
      isFavorite: false,
      cookTime: Math.floor(Math.random() * 60) + 10,
      difficulty: ['简单', '普通', '困难'][Math.floor(Math.random() * 3)],
      tags: item.tags || []
    }));
  },
  showOperMsg(content) {
    Message.success({
      context: this,
      offset: [120, 32],
      duration: 4000,
      content,
    });
  },
  goRelease(e) {
    wx.navigateTo({
      url: '/pages/recipe/create/index/index',
    });
  },
  onTabsChange(e) {
    const currentCategory = e.detail.value;
    this.setData({ currentCategory });
    
    // 切换分类时重新加载数据
    this.initData();
  },
  onSwiperChange(e) {
    this.setData({
      swiperCurrent: e.detail.current
    });
  },
  onRecipeTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/recipe/detail/index/index?id=${id}`
    });
  },
  onFavoriteRecipe(e) {
    const { id, isFavorite } = e.detail;
    
    // 找到对应的菜谱并更新
    const recipeList = this.data.recipeList.map(recipe => {
      if (recipe.id === id) {
        return {
          ...recipe,
          isFavorite: !isFavorite
        };
      }
      return recipe;
    });
    
    this.setData({ recipeList });
    
    // 显示提示
    Toast({
      context: this,
      selector: '#t-toast',
      message: !isFavorite ? '已收藏' : '已取消收藏',
    });
  },
  onLikeRecipe(e) {
    const { id, isLiked } = e.detail;
    
    // 找到对应的菜谱并更新
    const recipeList = this.data.recipeList.map(recipe => {
      if (recipe.id === id) {
        return {
          ...recipe,
          isLiked: !isLiked,
          likes: isLiked ? recipe.likes - 1 : recipe.likes + 1
        };
      }
      return recipe;
    });
    
    this.setData({ recipeList });
  },
  // 获取推荐菜谱
  getRecommendedRecipes() {
    this.setData({ recommendationLoading: true });
    
    // 从本地存储获取用户历史数据
    const orders = wx.getStorageSync('orders') || [];
    const myRecipes = wx.getStorageSync('myRecipes') || [];
    
    // 基于历史点菜记录和创建的菜谱进行推荐
    // 这里使用简单算法：最近创建的+最常点的菜谱
    let recommendPool = [];
    
    // 添加用户自己创建的菜谱
    if (myRecipes.length > 0) {
      recommendPool = recommendPool.concat(myRecipes);
    }
    
    // 添加历史点过的菜谱
    if (orders.length > 0) {
      // 统计各菜品的点菜次数
      const dishCounter = {};
      
      orders.forEach(order => {
        ['breakfast', 'lunch', 'dinner'].forEach(meal => {
          if (order[meal] && order[meal].length) {
            order[meal].forEach(dish => {
              if (!dishCounter[dish.id]) {
                dishCounter[dish.id] = {
                  count: 0,
                  dish: dish
                };
              }
              dishCounter[dish.id].count += 1;
            });
          }
        });
      });
      
      // 转换为数组并按点菜次数排序
      const popularDishes = Object.values(dishCounter)
        .sort((a, b) => b.count - a.count)
        .map(item => item.dish);
      
      recommendPool = recommendPool.concat(popularDishes);
    }
    
    // 去重
    const seen = new Set();
    const uniqueRecommended = recommendPool.filter(recipe => {
      const duplicate = seen.has(recipe.id);
      seen.add(recipe.id);
      return !duplicate;
    });
    
    // 最多取5个推荐
    const recommended = uniqueRecommended.slice(0, 5);
    
    this.setData({ 
      recommended,
      hasRecommendation: recommended.length > 0,
      recommendationLoading: false
    });
  },
  
  // 查看推荐菜谱详情
  onTapRecommendation(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/recipe/detail/index/index?id=${id}`
    });
  },

  // 获取应季食材
  getSeasonalIngredients() {
    // 获取当前月份
    const currentMonth = new Date().getMonth() + 1; // 0-11 转为 1-12
    
    // 定义每月的应季食材
    const seasonalMap = {
      // 春季
      3: ['菠菜', '春笋', '荠菜', '韭菜', '香椿', '豌豆', '蚕豆', '草莓'],
      4: ['芦笋', '春笋', '香椿', '豌豆', '蚕豆', '樱桃', '草莓', '杏子'],
      5: ['芦笋', '豌豆', '蚕豆', '樱桃', '杏子', '李子', '青梅', '杨梅'],
      
      // 夏季
      6: ['黄瓜', '丝瓜', '苦瓜', '冬瓜', '西红柿', '茄子', '杨梅', '桃子', '李子'],
      7: ['黄瓜', '丝瓜', '苦瓜', '冬瓜', '西红柿', '茄子', '西瓜', '桃子', '李子', '杏鲍菇'],
      8: ['黄瓜', '丝瓜', '苦瓜', '冬瓜', '西红柿', '茄子', '西瓜', '葡萄', '桃子', '梨'],
      
      // 秋季
      9: ['南瓜', '葫芦', '西兰花', '花菜', '菠菜', '葡萄', '梨', '石榴', '柿子'],
      10: ['南瓜', '冬瓜', '萝卜', '白菜', '菠菜', '梨', '柿子', '猕猴桃', '柚子'],
      11: ['白菜', '萝卜', '山药', '土豆', '胡萝卜', '菠菜', '柑橘', '柚子', '苹果'],
      
      // 冬季
      12: ['白菜', '萝卜', '山药', '土豆', '胡萝卜', '菠菜', '大葱', '柑橘', '苹果'],
      1: ['白菜', '萝卜', '菜花', '山药', '土豆', '胡萝卜', '菠菜', '大葱', '柑橘', '苹果'],
      2: ['白菜', '萝卜', '菜花', '山药', '土豆', '胡萝卜', '菠菜', '大葱', '柑橘', '苹果']
    };
    
    // 获取当月应季食材
    let seasonalIngredients = seasonalMap[currentMonth] || [];
    
    // 如果当前月份没有定义，使用相邻月份的数据
    if (seasonalIngredients.length === 0) {
      const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
      seasonalIngredients = [...(seasonalMap[prevMonth] || []), ...(seasonalMap[nextMonth] || [])];
      
      // 去重
      seasonalIngredients = [...new Set(seasonalIngredients)];
    }
    
    // 随机打乱顺序
    seasonalIngredients.sort(() => Math.random() - 0.5);
    
    // 最多显示8个
    seasonalIngredients = seasonalIngredients.slice(0, 8);
    
    this.setData({
      seasonalIngredients,
      seasonLoaded: true
    });
  },
  
  // 点击应季食材，跳转到相关菜谱搜索
  onTapSeasonalIngredient(e) {
    const { ingredient } = e.currentTarget.dataset;
    
    wx.navigateTo({
      url: `/pages/search/index?keyword=${ingredient}`
    });
  },
  
  // 查看更多应季食材
  onMoreSeasonalIngredients() {
    // 获取当前月份
    const currentMonth = new Date().getMonth() + 1;
    const season = this.getCurrentSeason(currentMonth);
    
    // 根据季节显示不同的标题
    wx.showModal({
      title: `${season}季时令食材`,
      content: this.data.seasonalIngredients.join('、'),
      showCancel: false,
      confirmText: '知道了'
    });
  },
  
  // 获取当前季节
  getCurrentSeason(month) {
    if (month >= 3 && month <= 5) {
      return '春';
    } else if (month >= 6 && month <= 8) {
      return '夏';
    } else if (month >= 9 && month <= 11) {
      return '秋';
    } else {
      return '冬';
    }
  }
});
