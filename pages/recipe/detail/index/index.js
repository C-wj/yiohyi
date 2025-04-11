import Toast from 'tdesign-miniprogram/toast/index';
import Dialog from 'tdesign-miniprogram/dialog/index';
import request from '~/api/request';

Page({
  data: {
    // 菜谱信息
    recipeId: '',
    recipe: null,
    
    // 加载状态
    loading: true,
    
    // 操作相关
    isOwner: false,
    isLiked: false,
    isFavorite: false,
    
    // 步骤展示
    currentStep: 0,
    
    // 分享弹窗
    showShareDialog: false,
    
    // 用户
    userInfo: null,
    
    // 食材计算
    servings: 4,
    originalServings: 4,
    
    // 评论
    comments: [],
    showCommentInput: false,
    commentContent: '',
    
    // 相关推荐
    recommendedRecipes: []
  },
  
  onLoad(options) {
    const { id } = options;
    
    if (!id) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '菜谱ID不存在',
      });
      
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      
      return;
    }
    
    this.setData({
      recipeId: id,
      userInfo: getApp().globalData.userInfo
    });
    
    this.fetchRecipeDetail();
    this.fetchComments();
    this.fetchRecommendedRecipes();
  },
  
  onShow() {
    // 检查缓存中是否有更新的菜谱信息（从编辑页面返回可能会用到）
    const app = getApp();
    const currentRecipe = app.getCurrentRecipe();
    
    if (currentRecipe && currentRecipe.id === this.data.recipeId) {
      this.setData({
        recipe: currentRecipe,
        loading: false
      });
      
      app.setCurrentRecipe(null); // 使用后清空
    }
  },
  
  onShareAppMessage() {
    const { recipe } = this.data;
    
    return {
      title: recipe ? recipe.title : '家宴菜谱分享',
      path: `/pages/recipe/detail/index?id=${this.data.recipeId}`,
      imageUrl: recipe ? recipe.image : '/static/share-default.png'
    };
  },
  
  // 获取菜谱详情
  async fetchRecipeDetail() {
    this.setData({ loading: true });
    
    try {
      // 在真实项目中，这里应该是从API获取菜谱详情
      // 这里使用模拟数据
      const response = await this.getMockRecipeDetail(this.data.recipeId);
      
      // 检查是否是菜谱作者
      const isOwner = this.data.userInfo && 
        this.data.userInfo.id === response.author.id;
      
      this.setData({
        recipe: response,
        loading: false,
        isOwner,
        isLiked: response.isLiked || false,
        isFavorite: response.isFavorite || false,
        originalServings: response.servings,
        servings: response.servings
      });
      
    } catch (error) {
      console.error('获取菜谱详情失败', error);
      Toast({
        context: this,
        selector: '#t-toast',
        message: '获取菜谱详情失败，请重试',
      });
      
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },
  
  // 获取评论
  async fetchComments() {
    try {
      // 模拟评论数据
      const comments = [
        {
          id: '1',
          user: {
            id: '101',
            name: '张三',
            avatar: '/static/avatar1.png'
          },
          content: '这道菜我做过，很好吃，家人都很喜欢！',
          createTime: '2023-06-10 15:23',
          likes: 8
        },
        {
          id: '2',
          user: {
            id: '102',
            name: '李四',
            avatar: '/static/avatar2.png'
          },
          content: '请问第三步里的调料是放多少呢？',
          createTime: '2023-06-09 18:45',
          likes: 2
        },
        {
          id: '3',
          user: {
            id: '103',
            name: '王五',
            avatar: '/static/avatar3.png'
          },
          content: '我按照你的方法做了，但是味道好像不太一样，是不是火候的问题？',
          createTime: '2023-06-08 20:19',
          likes: 5
        }
      ];
      
      this.setData({ comments });
      
    } catch (error) {
      console.error('获取评论失败', error);
      Toast({
        context: this,
        selector: '#t-toast',
        message: '获取评论失败',
      });
    }
  },
  
  // 获取推荐菜谱
  async fetchRecommendedRecipes() {
    try {
      // 模拟推荐菜谱数据
      const recommendedRecipes = [
        {
          id: 'rec1',
          title: '红烧排骨',
          image: '/static/home/card0.png',
          cookTime: 40,
          difficulty: '中等',
          likes: 156
        },
        {
          id: 'rec2',
          title: '清蒸鲈鱼',
          image: '/static/home/card1.png',
          cookTime: 30,
          difficulty: '简单',
          likes: 98
        },
        {
          id: 'rec3',
          title: '宫保鸡丁',
          image: '/static/home/card2.png',
          cookTime: 25,
          difficulty: '中等',
          likes: 205
        }
      ];
      
      this.setData({ recommendedRecipes });
      
    } catch (error) {
      console.error('获取推荐菜谱失败', error);
    }
  },
  
  // 处理份数变化
  onServingsChange(e) {
    const servings = e.detail.value;
    this.setData({ servings });
  },
  
  // 计算调整后的食材用量
  getAdjustedAmount(amount) {
    if (!amount) return '适量';
    
    const { servings, originalServings } = this.data;
    
    // 如果原始份数为0，直接返回原始值
    if (originalServings === 0) return amount;
    
    // 计算调整后的值
    const ratio = servings / originalServings;
    const adjustedAmount = amount * ratio;
    
    // 保留一位小数，并移除末尾的0
    return parseFloat(adjustedAmount.toFixed(1)).toString();
  },
  
  // 切换步骤
  onStepChange(e) {
    const currentStep = e.detail.current;
    this.setData({ currentStep });
  },
  
  // 前往下一步
  onNextStep() {
    const { currentStep, recipe } = this.data;
    if (currentStep < recipe.steps.length - 1) {
      this.setData({
        currentStep: currentStep + 1
      });
    }
  },
  
  // 前往上一步
  onPrevStep() {
    const { currentStep } = this.data;
    if (currentStep > 0) {
      this.setData({
        currentStep: currentStep - 1
      });
    }
  },
  
  // 点赞菜谱
  onLikeRecipe() {
    const { isLiked, recipe } = this.data;
    
    // 更新点赞状态
    this.setData({
      isLiked: !isLiked,
      'recipe.likes': isLiked ? recipe.likes - 1 : recipe.likes + 1
    });
    
    Toast({
      context: this,
      selector: '#t-toast',
      message: isLiked ? '已取消点赞' : '已点赞',
    });
    
    // 在实际应用中，这里需要调用API更新点赞状态
  },
  
  // 收藏菜谱
  onFavoriteRecipe() {
    const { isFavorite } = this.data;
    
    this.setData({
      isFavorite: !isFavorite
    });
    
    Toast({
      context: this,
      selector: '#t-toast',
      message: isFavorite ? '已取消收藏' : '已收藏',
    });
    
    // 在实际应用中，这里需要调用API更新收藏状态
  },
  
  // 分享菜谱
  onShareRecipe() {
    this.setData({
      showShareDialog: true
    });
  },
  
  // 关闭分享弹窗
  onCloseShareDialog() {
    this.setData({
      showShareDialog: false
    });
  },
  
  // 加入点菜单
  onAddToOrder() {
    wx.navigateTo({
      url: `/pages/order/add-dish/index?recipeId=${this.data.recipeId}`
    });
  },
  
  // 编辑菜谱
  onEditRecipe() {
    wx.navigateTo({
      url: `/pages/recipe/edit/index?id=${this.data.recipeId}`
    });
  },
  
  // 删除菜谱
  onDeleteRecipe() {
    Dialog.confirm({
      context: this,
      title: '删除菜谱',
      content: '确定要删除这个菜谱吗？删除后无法恢复',
      confirmBtn: {
        content: '删除',
        variant: 'danger'
      },
      cancelBtn: {
        content: '取消'
      }
    }).then(() => {
      // 用户点击了确定
      Toast({
        context: this,
        selector: '#t-toast',
        message: '菜谱已删除',
      });
      
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      
      // 在实际应用中，这里需要调用API删除菜谱
    }).catch(() => {
      // 用户点击了取消
    });
  },
  
  // 打开评论输入框
  onShowCommentInput() {
    this.setData({
      showCommentInput: true
    });
  },
  
  // 关闭评论输入框
  onHideCommentInput() {
    this.setData({
      showCommentInput: false,
      commentContent: ''
    });
  },
  
  // 输入评论内容
  onCommentInput(e) {
    this.setData({
      commentContent: e.detail.value
    });
  },
  
  // 提交评论
  onSubmitComment() {
    const { commentContent, comments, userInfo } = this.data;
    
    if (!commentContent.trim()) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '请输入评论内容',
      });
      return;
    }
    
    // 创建新评论对象
    const newComment = {
      id: `temp-${Date.now()}`,
      user: {
        id: userInfo.id,
        name: userInfo.nickName,
        avatar: userInfo.avatarUrl || '/static/default-avatar.png'
      },
      content: commentContent,
      createTime: '刚刚',
      likes: 0
    };
    
    // 添加到评论列表
    this.setData({
      comments: [newComment, ...comments],
      showCommentInput: false,
      commentContent: ''
    });
    
    Toast({
      context: this,
      selector: '#t-toast',
      message: '评论已发布',
    });
    
    // 在实际应用中，这里需要调用API提交评论
  },
  
  // 点击推荐菜谱
  onRecommendedRecipeTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/recipe/detail/index?id=${id}`
    });
  },
  
  // 模拟获取菜谱详情数据
  getMockRecipeDetail(id) {
    return new Promise((resolve) => {
      // 模拟数据
      const recipeDetail = {
        id,
        title: '红烧肉',
        description: '经典家常菜，肥而不腻，色香味俱全，是家庭聚餐的必备佳肴。',
        image: '/static/home/card0.png',
        cookTime: 60,
        prepTime: 20,
        difficulty: '中等',
        servings: 4,
        calories: 350,
        author: {
          id: 'author1',
          name: '厨艺达人',
          avatar: '/static/avatar1.png'
        },
        createTime: '2023-06-01 10:23',
        updateTime: '2023-06-05 16:45',
        viewCount: 1250,
        likes: 168,
        isLiked: false,
        isFavorite: false,
        ingredients: [
          { name: '五花肉', amount: 500, unit: 'g' },
          { name: '生姜', amount: 20, unit: 'g' },
          { name: '大蒜', amount: 15, unit: 'g' },
          { name: '八角', amount: 2, unit: '个' },
          { name: '桂皮', amount: 1, unit: '块' },
          { name: '酱油', amount: 30, unit: 'ml' },
          { name: '料酒', amount: 20, unit: 'ml' },
          { name: '冰糖', amount: 20, unit: 'g' },
          { name: '盐', amount: 5, unit: 'g' }
        ],
        steps: [
          {
            id: 'step1',
            description: '五花肉洗净切成2厘米见方的块。',
            image: '/static/steps/step1.png',
            tip: '切肉块时尽量大小均匀，以保证受热均匀。'
          },
          {
            id: 'step2',
            description: '锅中倒入少量油，放入肉块小火煸炒，煸出肉块的油脂。',
            image: '/static/steps/step2.png',
            tip: '小火慢煸，让肉块均匀出油。'
          },
          {
            id: 'step3',
            description: '加入姜片、蒜末、八角、桂皮等香料爆香。',
            image: '/static/steps/step3.png'
          },
          {
            id: 'step4',
            description: '加入酱油、料酒、冰糖，翻炒均匀。',
            image: '/static/steps/step4.png',
            tip: '冰糖可以使红烧肉色泽更加红亮。'
          },
          {
            id: 'step5',
            description: '加入没过肉块的热水，大火烧开后转小火慢炖40分钟。',
            image: '/static/steps/step5.png'
          },
          {
            id: 'step6',
            description: '汤汁收至粘稠，加盐调味即可。',
            image: '/static/steps/step6.png',
            tip: '收汁时可以转大火，但要注意不停翻动，防止糊锅。'
          }
        ],
        tags: ['家常菜', '红烧', '肉类', '下饭菜'],
        tips: '1. 肉块最好选择肥瘦相间的五花肉，这样炖出来的肉才会香而不腻。\n2. 焯水可以去除血水和异味，但也可以省略这一步。\n3. 收汁时火候要控制好，太急容易糊锅。',
        nutrition: {
          calories: 350,
          protein: 12,
          fat: 28,
          carbs: 8
        }
      };
      
      // 延迟返回数据，模拟网络请求
      setTimeout(() => {
        resolve(recipeDetail);
      }, 500);
    });
  }
}); 