import Toast from 'tdesign-miniprogram/toast/index';
import Dialog from 'tdesign-miniprogram/dialog/index';
import request from '~/api/request';

Page({
  data: {
    // 表单数据
    form: {
      title: '',
      description: '',
      image: '',
      cookTime: 30,
      prepTime: 10,
      difficulty: '中等',
      servings: 4,
      ingredients: [],
      steps: [],
      tags: [],
      tips: ''
    },
    
    // 上传图片相关
    uploadPath: '',
    uploadType: '',
    
    // 步骤预览
    previewStepIndex: -1,
    
    // 难度选项
    difficultyOptions: [
      { label: '简单', value: '简单' },
      { label: '中等', value: '中等' },
      { label: '困难', value: '困难' }
    ],
    
    // 常用单位
    unitOptions: [
      { label: '克', value: 'g' },
      { label: '毫升', value: 'ml' },
      { label: '个', value: '个' },
      { label: '勺', value: '勺' },
      { label: '适量', value: '适量' }
    ],
    
    // 常用标签
    commonTags: ['家常菜', '快手菜', '下饭菜', '早餐', '午餐', '晚餐', '汤羹', '主食', '小吃', '素食', '荤菜', '凉菜', '热菜', '烘焙', '甜点'],
    
    // 表单验证
    errors: {
      title: '',
      image: '',
      ingredients: [],
      steps: []
    },
    
    // 页面状态
    isSubmitting: false,
    showTagSelector: false
  },
  
  onLoad() {
    // 生成初始 ID
    this.formInit();
  },
  
  // 表单初始化
  formInit() {
    const form = {
      ...this.data.form,
      ingredients: [
        { id: this.generateId(), name: '', amount: null, unit: 'g' }
      ],
      steps: [
        { id: this.generateId(), description: '', image: '', tip: '' }
      ]
    };
    
    this.setData({ form });
  },
  
  // 生成唯一ID
  generateId() {
    return Math.random().toString(36).substr(2, 9);
  },
  
  // 返回上一页
  onBack() {
    if (this.hasFormChanged()) {
      Dialog.confirm({
        context: this,
        title: '提示',
        content: '表单已修改，确定要返回吗？未保存的内容将丢失。',
        confirmBtn: {
          content: '确定',
          variant: 'base'
        },
        cancelBtn: {
          content: '取消',
          variant: 'outline'
        },
      }).then(() => {
        wx.navigateBack();
      }).catch(() => {
        // 用户取消
      });
    } else {
      wx.navigateBack();
    }
  },
  
  // 检查表单是否有变动
  hasFormChanged() {
    const { form } = this.data;
    
    // 检查标题、描述等基本信息
    if (form.title || form.description || form.image || form.tips) return true;
    
    // 检查食材
    if (form.ingredients.length > 1) return true;
    if (form.ingredients.length === 1 && (form.ingredients[0].name || form.ingredients[0].amount)) return true;
    
    // 检查步骤
    if (form.steps.length > 1) return true;
    if (form.steps.length === 1 && (form.steps[0].description || form.steps[0].image || form.steps[0].tip)) return true;
    
    // 检查标签
    if (form.tags.length > 0) return true;
    
    return false;
  },
  
  // 输入标题
  onTitleInput(e) {
    this.setData({
      'form.title': e.detail.value,
      'errors.title': ''
    });
  },
  
  // 输入描述
  onDescriptionInput(e) {
    this.setData({
      'form.description': e.detail.value
    });
  },
  
  // 选择封面图片
  onChooseCoverImage() {
    this.setData({
      uploadType: 'cover'
    });
    
    this.chooseImage();
  },
  
  // 选择难度
  onSelectDifficulty(e) {
    this.setData({
      'form.difficulty': e.detail.value
    });
  },
  
  // 修改烹饪时间
  onCookTimeChange(e) {
    this.setData({
      'form.cookTime': e.detail.value
    });
  },
  
  // 修改准备时间
  onPrepTimeChange(e) {
    this.setData({
      'form.prepTime': e.detail.value
    });
  },
  
  // 修改份数
  onServingsChange(e) {
    this.setData({
      'form.servings': e.detail.value
    });
  },
  
  // 食材名称输入
  onIngredientNameInput(e) {
    const index = e.currentTarget.dataset.index;
    const value = e.detail.value;
    
    this.setData({
      [`form.ingredients[${index}].name`]: value,
      [`errors.ingredients[${index}]`]: ''
    });
  },
  
  // 食材用量输入
  onIngredientAmountInput(e) {
    const index = e.currentTarget.dataset.index;
    const value = e.detail.value;
    
    this.setData({
      [`form.ingredients[${index}].amount`]: value ? parseFloat(value) : null
    });
  },
  
  // 选择食材单位
  onSelectUnit(e) {
    const index = e.currentTarget.dataset.index;
    
    this.setData({
      [`form.ingredients[${index}].unit`]: e.detail.value
    });
  },
  
  // 添加食材
  onAddIngredient() {
    const ingredients = [...this.data.form.ingredients];
    ingredients.push({
      id: this.generateId(),
      name: '',
      amount: null,
      unit: 'g'
    });
    
    this.setData({
      'form.ingredients': ingredients
    });
  },
  
  // 删除食材
  onDeleteIngredient(e) {
    const index = e.currentTarget.dataset.index;
    const ingredients = [...this.data.form.ingredients];
    
    if (ingredients.length === 1) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '至少需要一项食材',
      });
      return;
    }
    
    ingredients.splice(index, 1);
    
    this.setData({
      'form.ingredients': ingredients
    });
  },
  
  // 步骤描述输入
  onStepDescriptionInput(e) {
    const index = e.currentTarget.dataset.index;
    const value = e.detail.value;
    
    this.setData({
      [`form.steps[${index}].description`]: value,
      [`errors.steps[${index}]`]: ''
    });
  },
  
  // 步骤提示输入
  onStepTipInput(e) {
    const index = e.currentTarget.dataset.index;
    const value = e.detail.value;
    
    this.setData({
      [`form.steps[${index}].tip`]: value
    });
  },
  
  // 选择步骤图片
  onChooseStepImage(e) {
    const index = e.currentTarget.dataset.index;
    
    this.setData({
      uploadType: 'step',
      uploadPath: `form.steps[${index}].image`
    });
    
    this.chooseImage();
  },
  
  // 预览步骤图片
  onPreviewStepImage(e) {
    const index = e.currentTarget.dataset.index;
    const image = this.data.form.steps[index].image;
    
    if (!image) return;
    
    wx.previewImage({
      urls: [image],
      current: image
    });
  },
  
  // 添加步骤
  onAddStep() {
    const steps = [...this.data.form.steps];
    steps.push({
      id: this.generateId(),
      description: '',
      image: '',
      tip: ''
    });
    
    this.setData({
      'form.steps': steps
    });
  },
  
  // 删除步骤
  onDeleteStep(e) {
    const index = e.currentTarget.dataset.index;
    const steps = [...this.data.form.steps];
    
    if (steps.length === 1) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '至少需要一个步骤',
      });
      return;
    }
    
    steps.splice(index, 1);
    
    this.setData({
      'form.steps': steps
    });
  },
  
  // 移动步骤（上移）
  onMoveStepUp(e) {
    const index = e.currentTarget.dataset.index;
    if (index === 0) return;
    
    const steps = [...this.data.form.steps];
    const temp = steps[index];
    steps[index] = steps[index - 1];
    steps[index - 1] = temp;
    
    this.setData({
      'form.steps': steps
    });
  },
  
  // 移动步骤（下移）
  onMoveStepDown(e) {
    const index = e.currentTarget.dataset.index;
    const steps = [...this.data.form.steps];
    
    if (index === steps.length - 1) return;
    
    const temp = steps[index];
    steps[index] = steps[index + 1];
    steps[index + 1] = temp;
    
    this.setData({
      'form.steps': steps
    });
  },
  
  // 小贴士输入
  onTipsInput(e) {
    this.setData({
      'form.tips': e.detail.value
    });
  },
  
  // 打开标签选择器
  onOpenTagSelector() {
    this.setData({
      showTagSelector: true
    });
  },
  
  // 关闭标签选择器
  onCloseTagSelector() {
    this.setData({
      showTagSelector: false
    });
  },
  
  // 选择/取消选择标签
  onToggleTag(e) {
    const tag = e.currentTarget.dataset.tag;
    const tags = [...this.data.form.tags];
    
    const index = tags.indexOf(tag);
    if (index === -1) {
      // 添加标签
      if (tags.length >= 5) {
        Toast({
          context: this,
          selector: '#t-toast',
          message: '最多选择5个标签',
        });
        return;
      }
      tags.push(tag);
    } else {
      // 移除标签
      tags.splice(index, 1);
    }
    
    this.setData({
      'form.tags': tags
    });
  },
  
  // 选择图片通用方法
  chooseImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        // 模拟上传
        this.simulateImageUpload(res.tempFilePaths[0]);
      }
    });
  },
  
  // 模拟图片上传（实际项目中这里应当调用真实的上传接口）
  simulateImageUpload(tempPath) {
    Toast({
      context: this,
      selector: '#t-toast',
      message: '上传中...',
      duration: 1000
    });
    
    // 模拟上传延迟
    setTimeout(() => {
      // 确定上传的是哪种图片
      if (this.data.uploadType === 'cover') {
        this.setData({
          'form.image': tempPath,
          'errors.image': ''
        });
      } else if (this.data.uploadType === 'step') {
        this.setData({
          [this.data.uploadPath]: tempPath
        });
      }
      
      Toast({
        context: this,
        selector: '#t-toast',
        message: '上传成功',
        theme: 'success',
        duration: 1000
      });
    }, 1000);
  },
  
  // 表单验证
  validateForm() {
    const { form } = this.data;
    let isValid = true;
    const errors = {
      title: '',
      image: '',
      ingredients: [],
      steps: []
    };
    
    // 标题验证
    if (!form.title.trim()) {
      errors.title = '请输入菜谱标题';
      isValid = false;
    }
    
    // 封面图验证
    if (!form.image) {
      errors.image = '请上传封面图';
      isValid = false;
    }
    
    // 食材验证
    form.ingredients.forEach((ingredient, index) => {
      if (!ingredient.name.trim()) {
        errors.ingredients[index] = '请输入食材名称';
        isValid = false;
      } else {
        errors.ingredients[index] = '';
      }
    });
    
    // 步骤验证
    form.steps.forEach((step, index) => {
      if (!step.description.trim()) {
        errors.steps[index] = '请输入步骤描述';
        isValid = false;
      } else {
        errors.steps[index] = '';
      }
    });
    
    this.setData({ errors });
    return isValid;
  },
  
  // 提交表单
  onSubmit() {
    // 表单验证
    if (!this.validateForm()) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '请完善表单信息',
        theme: 'error',
      });
      return;
    }
    
    // 设置提交状态
    this.setData({ isSubmitting: true });
    
    // 模拟提交成功
    setTimeout(() => {
      // 在实际项目中，这里应当调用API提交表单
      const app = getApp();
      const recipe = {
        ...this.data.form,
        id: this.generateId(),
        author: {
          id: app.globalData.userInfo?.id || 'user1',
          name: app.globalData.userInfo?.nickName || '用户',
          avatar: app.globalData.userInfo?.avatarUrl || '/static/default-avatar.png'
        },
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString(),
        viewCount: 0,
        likes: 0,
        isCreatedByMe: true
      };
      
      // 将创建的菜谱保存到全局数据
      app.setCurrentRecipe(recipe);
      
      // 清除提交状态
      this.setData({ isSubmitting: false });
      
      Toast({
        context: this,
        selector: '#t-toast',
        message: '创建成功',
        theme: 'success',
      });
      
      // 创建成功后跳转到菜谱详情页
      setTimeout(() => {
        wx.redirectTo({
          url: `/pages/recipe/detail/index?id=${recipe.id}`
        });
      }, 1500);
    }, 1500);
  }
}); 