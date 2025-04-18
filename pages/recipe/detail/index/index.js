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
      const response = await request(`/recipes/${this.data.recipeId}`, 'GET');
      
      if (response.code === 200) {
        // 检查是否是菜谱作者
        const isOwner = this.data.userInfo && 
          this.data.userInfo.id === response.data.creator.userId;
        
        this.setData({
          recipe: response.data,
          loading: false,
          isOwner,
          isLiked: response.data.isLiked || false,
          isFavorite: response.data.isFavorite || false,
          originalServings: response.data.servings,
          servings: response.data.servings
        });
      } else {
        throw new Error(response.msg || '获取菜谱数据失败');
      }
      
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
      const response = await request(`/recipes/${this.data.recipeId}/reviews`, 'GET', {
        page: 1,
        limit: 10
      });
      
      if (response.code === 200) {
        this.setData({ comments: response.data.comments });
      } else {
        console.error('获取评论失败', response.msg);
      }
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
  async onLikeRecipe() {
    const { isLiked, recipe } = this.data;
    
    try {
      // 调用后端API更新点赞状态
      const response = await request(`/recipes/${this.data.recipeId}/like`, 'POST');
      
      if (response.code === 200) {
        this.setData({
          isLiked: !isLiked,
          'recipe.stats.likeCount': isLiked ? recipe.stats.likeCount - 1 : recipe.stats.likeCount + 1
        });
        
        Toast({
          context: this,
          selector: '#t-toast',
          message: isLiked ? '已取消点赞' : '已点赞',
        });
      } else {
        throw new Error(response.msg || '操作失败');
      }
    } catch (error) {
      console.error('点赞操作失败', error);
      Toast({
        context: this,
        selector: '#t-toast',
        message: '操作失败，请重试',
      });
    }
  },
  
  // 收藏菜谱
  async onFavoriteRecipe() {
    if (!this.data.userInfo) {
      // 提示用户登录
      Dialog.confirm({
        context: this,
        title: '提示',
        content: '请先登录后再收藏菜谱',
        confirmBtn: '去登录',
        cancelBtn: '取消'
      }).then(() => {
        wx.navigateTo({
          url: '/pages/login/login'
        });
      });
      return;
    }
    
    try {
      const result = await request(`/recipes/${this.data.recipeId}/favorite`, 'POST');
      
      if (result.code === 200) {
        const isFavorite = result.data.is_favorite;
        this.setData({ isFavorite });
        
        Toast({
          context: this,
          selector: '#t-toast',
          message: isFavorite ? '收藏成功' : '已取消收藏'
        });
      } else {
        throw new Error(result.msg || '操作失败');
      }
    } catch (error) {
      console.error('收藏操作失败', error);
      Toast({
        context: this,
        selector: '#t-toast',
        message: '收藏操作失败，请重试'
      });
    }
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
  async onSubmitComment() {
    if (!this.data.commentContent.trim()) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '评论内容不能为空'
      });
      return;
    }
    
    if (!this.data.userInfo) {
      Dialog.confirm({
        context: this,
        title: '提示',
        content: '请先登录后再评论',
        confirmBtn: '去登录',
        cancelBtn: '取消'
      }).then(() => {
        wx.navigateTo({
          url: '/pages/login/login'
        });
      });
      return;
    }
    
    try {
      const response = await request(`/recipes/${this.data.recipeId}/reviews`, 'POST', {
        content: this.data.commentContent,
        rating: 5,  // 默认5星评分
        images: []  // 暂不支持图片
      });
      
      if (response.code === 200) {
        Toast({
          context: this,
          selector: '#t-toast',
          message: '评论发布成功'
        });
        
        // 清空评论并隐藏输入框
        this.setData({
          commentContent: '',
          showCommentInput: false
        });
        
        // 刷新评论列表
        this.fetchComments();
      } else {
        throw new Error(response.msg || '发布评论失败');
      }
    } catch (error) {
      console.error('发布评论失败', error);
      Toast({
        context: this,
        selector: '#t-toast',
        message: '发布评论失败，请重试'
      });
    }
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