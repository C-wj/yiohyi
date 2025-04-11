// 菜谱编辑页面
Page({
  data: {
    recipeId: '',
    isLoading: true,
    recipe: {
      name: '',
      description: '',
      cookTime: 30,
      servings: 2,
      ingredients: [],
      steps: []
    }
  },
  
  onLoad(options) {
    if (options.id) {
      this.setData({
        recipeId: options.id
      });
      // 加载菜谱数据
      wx.showToast({
        title: '页面开发中...',
        icon: 'none',
        duration: 2000
      });
      
      setTimeout(() => {
        wx.navigateBack();
      }, 2000);
    } else {
      wx.showToast({
        title: '参数错误',
        icon: 'error',
        duration: 2000
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 2000);
    }
  }
}); 