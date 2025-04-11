// 获取全局实例
const app = getApp();
import Toast from 'tdesign-miniprogram/toast/index';

Page({
  data: {
    // 菜谱数据
    recipes: [],
    allRecipes: [],
    loading: true,
    
    // 搜索状态
    searchValue: '',
    
    // 当前激活的标签
    activeTab: 'my'
  },
  
  onLoad() {
    // 加载页面时获取菜谱数据
    this.loadRecipes();
  },
  
  // 加载菜谱数据
  loadRecipes() {
    this.setData({ loading: true });
    
    // 模拟从服务器获取数据
    // 实际项目中应从API获取
    setTimeout(() => {
      // 模拟数据，实际项目中应替换为真实数据
      const mockRecipes = [
        {
          id: '1',
          title: '红烧排骨',
          image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288',
          author: { name: '张厨师' },
          description: '经典家常菜，肉质鲜嫩，口感香甜',
          tags: ['家常菜', '肉类'],
          likes: 256,
          createTime: '2023-05-20',
          ingredients: [
            { name: '排骨', amount: '500', unit: 'g' },
            { name: '生姜', amount: '2', unit: '片' },
            { name: '大蒜', amount: '3', unit: '瓣' },
            { name: '酱油', amount: '2', unit: '勺' },
            { name: '料酒', amount: '1', unit: '勺' },
            { name: '白糖', amount: '1', unit: '勺' }
          ]
        },
        {
          id: '2',
          title: '清蒸鱼',
          image: 'https://images.unsplash.com/photo-1535400255456-54c32ff67ece',
          author: { name: '李师傅' },
          description: '鲜美可口，肉质细嫩',
          tags: ['海鲜', '蒸菜'],
          likes: 198,
          createTime: '2023-05-18',
          ingredients: [
            { name: '鲈鱼', amount: '1', unit: '条' },
            { name: '葱', amount: '2', unit: '根' },
            { name: '姜', amount: '5', unit: '片' },
            { name: '蒸鱼豉油', amount: '2', unit: '勺' },
            { name: '料酒', amount: '1', unit: '勺' }
          ]
        },
        {
          id: '3',
          title: '糖醋里脊',
          image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1',
          author: { name: '王师傅' },
          description: '酸甜可口，外酥里嫩',
          tags: ['家常菜', '肉类'],
          likes: 220,
          createTime: '2023-05-15',
          ingredients: [
            { name: '猪里脊肉', amount: '300', unit: 'g' },
            { name: '淀粉', amount: '2', unit: '勺' },
            { name: '白糖', amount: '2', unit: '勺' },
            { name: '醋', amount: '1', unit: '勺' },
            { name: '番茄酱', amount: '1', unit: '勺' }
          ]
        }
      ];
      
      this.setData({
        recipes: mockRecipes,
        allRecipes: mockRecipes,
        loading: false
      });
    }, 1000);
  },
  
  // 搜索提交处理
  onSearchSubmit(e) {
    const searchValue = e.detail.value;
    this.searchRecipes(searchValue);
  },
  
  // 清除搜索
  onSearchClear() {
    this.setData({
      searchValue: '',
      recipes: this.data.allRecipes
    });
  },
  
  // 搜索菜谱
  searchRecipes(keyword) {
    if (!keyword.trim()) {
      this.setData({
        recipes: this.data.allRecipes,
        searchValue: ''
      });
      return;
    }
    
    const filteredRecipes = this.data.allRecipes.filter(recipe => {
      return recipe.title.includes(keyword) || 
        recipe.description.includes(keyword) ||
        recipe.tags.some(tag => tag.includes(keyword));
    });
    
    this.setData({
      recipes: filteredRecipes,
      searchValue: keyword
    });
  },
  
  // 标签页切换
  onTabChange(e) {
    const activeTab = e.detail.value;
    
    this.setData({ activeTab });
    
    // 根据标签筛选菜谱
    // 实际项目中应根据标签从服务器获取不同数据
    if (activeTab === 'my') {
      // 获取"我的菜谱"数据
      this.loadMyRecipes();
    } else if (activeTab === 'favorite') {
      // 获取"收藏菜谱"数据
      this.loadFavoriteRecipes();
    }
  },
  
  // 加载我的菜谱
  loadMyRecipes() {
    this.setData({ loading: true });
    
    // 实际项目中应从API获取
    setTimeout(() => {
      // 使用相同的模拟数据，实际项目中应替换为真实数据
      const mockRecipes = this.data.allRecipes;
      
      this.setData({
        recipes: mockRecipes,
        loading: false
      });
    }, 500);
  },
  
  // 加载收藏菜谱
  loadFavoriteRecipes() {
    this.setData({ loading: true });
    
    // 实际项目中应从API获取
    setTimeout(() => {
      // 简单筛选一些数据模拟收藏菜谱
      const favoriteRecipes = this.data.allRecipes.filter((_, index) => index % 2 === 0);
      
      this.setData({
        recipes: favoriteRecipes,
        loading: false
      });
    }, 500);
  },
  
  // 菜谱点击处理
  onRecipeTap(e) {
    const { id } = e.currentTarget.dataset;
    const recipe = this.data.recipes.find(item => item.id === id);
    
    if (!recipe) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '菜谱不存在'
      });
      return;
    }
    
    // 确认选择此菜谱
    wx.showModal({
      title: '确认选择',
      content: `确定将《${recipe.title}》的食材添加到购物清单吗？`,
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 获取页面实例
          const pages = getCurrentPages();
          const prePage = pages[pages.length - 2];
          
          // 触发上一页面的事件，传递菜谱数据
          if (prePage && prePage.getOpenerEventChannel) {
            const eventChannel = prePage.getOpenerEventChannel();
            eventChannel.emit('selectRecipe', recipe);
          }
          
          // 返回上一页
          wx.navigateBack();
          
          Toast({
            context: this,
            selector: '#t-toast',
            message: '已添加食材到购物清单',
            theme: 'success'
          });
        }
      }
    });
  }
}); 