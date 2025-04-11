import Toast from 'tdesign-miniprogram/toast/index';
import ActionSheet from 'tdesign-miniprogram/action-sheet/index';
import request from '~/api/request';

Page({
  data: {
    // 选项卡
    activeTab: 'all',
    
    // 菜谱列表
    recipes: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    
    // 搜索
    searchValue: '',
    
    // 当前长按选中的菜谱
    currentRecipeIndex: -1,
  },
  
  // 生命周期函数
  onLoad() {
    this.loadRecipes();
  },
  
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        value: 'my-recipes'
      });
    }
  },
  
  onReachBottom() {
    if (this.data.hasMore) {
      this.loadMoreRecipes();
    }
  },
  
  onPullDownRefresh() {
    this.refreshData();
  },
  
  // 刷新数据
  refreshData() {
    this.setData({
      page: 1,
      hasMore: true
    });
    
    this.loadRecipes().then(() => {
      wx.stopPullDownRefresh();
    });
  },
  
  // 加载菜谱数据
  async loadRecipes() {
    wx.showLoading({
      title: '加载中...',
    });
    
    try {
      // 调用 API 获取菜谱数据
      const response = await request('/home/cards');
      
      // 根据当前选项卡过滤数据
      const recipesData = this.processRecipeData(response.data.data);
      const filteredRecipes = this.filterRecipesByTab(recipesData);
      
      this.setData({
        recipes: filteredRecipes,
        hasMore: filteredRecipes.length >= this.data.pageSize
      });
      
    } catch (error) {
      console.error('加载菜谱失败', error);
      Toast({
        context: this,
        selector: '#t-toast',
        message: '加载菜谱失败，请重试',
      });
    } finally {
      wx.hideLoading();
    }
  },
  
  // 加载更多菜谱
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
      const recipesData = this.processRecipeData(response.data.data);
      const filteredRecipes = this.filterRecipesByTab(recipesData);
      
      this.setData({
        recipes: [...this.data.recipes, ...filteredRecipes],
        hasMore: filteredRecipes.length >= this.data.pageSize
      });
      
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
  
  // 处理菜谱数据
  processRecipeData(data) {
    return data.map(item => ({
      id: Math.random().toString(36).substr(2, 9),
      title: `私房${item.desc.substring(0, 10)}`,
      image: item.url,
      author: {
        name: '我',
        avatar: '/static/avatar1.png'
      },
      likes: Math.floor(Math.random() * 100),
      isLiked: Math.random() > 0.5,
      isFavorite: this.data.activeTab === 'favorite' || Math.random() > 0.7,
      cookTime: Math.floor(Math.random() * 60) + 10,
      difficulty: ['简单', '普通', '困难'][Math.floor(Math.random() * 3)],
      isCreatedByMe: this.data.activeTab === 'created' || Math.random() > 0.5,
      tags: item.tags,
      createTime: new Date(Date.now() - Math.random() * 10000000000).toISOString()
    }));
  },
  
  // 根据选项卡过滤菜谱
  filterRecipesByTab(recipes) {
    const { activeTab } = this.data;
    
    if (activeTab === 'all') {
      return recipes;
    } else if (activeTab === 'created') {
      return recipes.filter(recipe => recipe.isCreatedByMe);
    } else if (activeTab === 'favorite') {
      return recipes.filter(recipe => recipe.isFavorite);
    }
    
    return recipes;
  },
  
  // 点击标签页
  onTabChange(e) {
    const activeTab = e.detail.value;
    
    this.setData({
      activeTab,
      page: 1,
      recipes: [],
      hasMore: true
    });
    
    this.loadRecipes();
  },
  
  // 搜索菜谱
  onSearchSubmit(e) {
    const value = e.detail.value;
    this.setData({ searchValue: value });
    
    // TODO: 实现搜索功能
    Toast({
      context: this,
      selector: '#t-toast',
      message: `搜索: ${value}`,
    });
  },
  
  // 获取焦点时触发
  onSearchFocus() {
    wx.navigateTo({
      url: `/pages/search/index?from=my-recipes`
    });
  },
  
  // 点击筛选按钮
  onSortTap() {
    ActionSheet.show({
      context: this,
      selector: '#t-action-sheet',
      items: [
        { label: '创建时间（最新）', value: 'time-desc' },
        { label: '创建时间（最早）', value: 'time-asc' },
        { label: '点赞数（从高到低）', value: 'likes-desc' },
        { label: '难度（从易到难）', value: 'difficulty-asc' }
      ],
      onSelect: this.handleSortSelect
    });
  },
  
  // 处理排序选择
  handleSortSelect(e) {
    const { value } = e.detail;
    
    // 复制当前菜谱列表
    let recipes = [...this.data.recipes];
    
    // 根据选择的排序方式进行排序
    switch (value) {
      case 'time-desc':
        recipes.sort((a, b) => new Date(b.createTime) - new Date(a.createTime));
        break;
      case 'time-asc':
        recipes.sort((a, b) => new Date(a.createTime) - new Date(b.createTime));
        break;
      case 'likes-desc':
        recipes.sort((a, b) => b.likes - a.likes);
        break;
      case 'difficulty-asc':
        const difficultyOrder = { '简单': 0, '普通': 1, '困难': 2 };
        recipes.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
        break;
      default:
        break;
    }
    
    this.setData({ recipes });
    
    Toast({
      context: this,
      selector: '#t-toast',
      message: '排序成功',
    });
  },
  
  // 创建新菜谱
  onCreateRecipe() {
    wx.navigateTo({
      url: '/pages/recipe/create/index'
    });
  },
  
  // 点击菜谱
  onRecipeTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/recipe/detail/index?id=${id}`
    });
  },
  
  // 长按菜谱
  onRecipeLongPress(e) {
    const index = e.currentTarget.dataset.index;
    const recipe = this.data.recipes[index];
    
    this.setData({ currentRecipeIndex: index });
    
    // 显示操作菜单
    const items = [];
    
    if (recipe.isCreatedByMe) {
      items.push({ label: '编辑', value: 'edit' });
    }
    
    items.push(
      { label: '分享', value: 'share' },
      { label: recipe.isFavorite ? '取消收藏' : '收藏', value: 'favorite' }
    );
    
    if (recipe.isCreatedByMe) {
      items.push({ label: '删除', value: 'delete', style: 'destructive' });
    }
    
    ActionSheet.show({
      context: this,
      selector: '#t-action-sheet',
      items,
      onSelect: this.handleRecipeAction
    });
  },
  
  // 处理菜谱操作
  handleRecipeAction(e) {
    const { value } = e.detail;
    const index = this.data.currentRecipeIndex;
    const recipe = this.data.recipes[index];
    
    if (index < 0) return;
    
    switch (value) {
      case 'edit':
        wx.navigateTo({
          url: `/pages/recipe/edit/index?id=${recipe.id}`
        });
        break;
      case 'share':
        // 实现分享功能（使用小程序自带的分享功能）
        wx.showShareMenu({
          withShareTicket: true,
          menus: ['shareAppMessage', 'shareTimeline']
        });
        break;
      case 'favorite':
        this.toggleFavorite(index);
        break;
      case 'delete':
        this.deleteRecipe(index);
        break;
      default:
        break;
    }
    
    this.setData({ currentRecipeIndex: -1 });
  },
  
  // 收藏/取消收藏菜谱
  toggleFavorite(index) {
    const recipes = [...this.data.recipes];
    const recipe = recipes[index];
    
    recipe.isFavorite = !recipe.isFavorite;
    
    this.setData({ recipes });
    
    Toast({
      context: this,
      selector: '#t-toast',
      message: recipe.isFavorite ? '已收藏' : '已取消收藏',
    });
    
    // 如果是在"收藏"标签页并且取消了收藏，则从列表中移除
    if (this.data.activeTab === 'favorite' && !recipe.isFavorite) {
      setTimeout(() => {
        recipes.splice(index, 1);
        this.setData({ recipes });
      }, 500);
    }
  },
  
  // 删除菜谱
  deleteRecipe(index) {
    wx.showModal({
      title: '删除菜谱',
      content: '确定要删除这个菜谱吗？删除后无法恢复。',
      success: (res) => {
        if (res.confirm) {
          const recipes = [...this.data.recipes];
          recipes.splice(index, 1);
          
          this.setData({ recipes });
          
          Toast({
            context: this,
            selector: '#t-toast',
            message: '删除成功',
          });
        }
      }
    });
  },
  
  // 点赞菜谱
  onLikeRecipe(e) {
    const { id, isLiked } = e.detail;
    
    // 更新菜谱列表
    const recipes = this.data.recipes.map(recipe => {
      if (recipe.id === id) {
        return {
          ...recipe,
          isLiked: !isLiked,
          likes: isLiked ? recipe.likes - 1 : recipe.likes + 1
        };
      }
      return recipe;
    });
    
    this.setData({ recipes });
  },
  
  // 收藏菜谱
  onFavoriteRecipe(e) {
    const { id, isFavorite } = e.detail;
    
    // 找到菜谱在列表中的索引
    const index = this.data.recipes.findIndex(recipe => recipe.id === id);
    
    if (index !== -1) {
      this.toggleFavorite(index);
    }
  }
}); 