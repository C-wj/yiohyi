// 获取全局实例
const app = getApp();
import Toast from 'tdesign-miniprogram/toast/index';

Page({
  data: {
    // 菜品数据
    dish: {
      type: 'recipe', // 默认从菜谱选择
      name: '',
      description: '',
      price: '',
      quantity: 1,
      category: 'main', // 默认为主菜
      notes: ''
    },
    
    // 选中的菜谱
    selectedRecipe: null,
    
    // 上传文件列表
    fileList: [],
    
    // 订单ID（如果是从订单页面跳转过来）
    orderId: null
  },
  
  onLoad(options) {
    // 如果有传入订单ID，保存起来
    if (options.orderId) {
      this.setData({
        orderId: options.orderId
      });
    }
  },
  
  // 切换菜品类型
  onTypeChange(e) {
    const type = e.detail.value;
    
    this.setData({
      'dish.type': type
    });
    
    // 如果切换到自定义，清空已选菜谱
    if (type === 'custom') {
      this.setData({
        selectedRecipe: null
      });
    }
  },
  
  // 选择菜谱
  selectRecipe() {
    wx.navigateTo({
      url: '/pages/recipe/list/index/index',
      events: {
        // 接收从菜谱选择页面返回的数据
        selectRecipe: (recipe) => {
          if (recipe) {
            this.setData({
              selectedRecipe: recipe,
              'dish.name': recipe.title,
              'dish.description': recipe.description
            });
          }
        }
      }
    });
  },
  
  // 更新菜品名称
  onNameChange(e) {
    this.setData({
      'dish.name': e.detail.value
    });
  },
  
  // 更新菜品描述
  onDescriptionChange(e) {
    this.setData({
      'dish.description': e.detail.value
    });
  },
  
  // 更新菜品价格
  onPriceChange(e) {
    this.setData({
      'dish.price': e.detail.value
    });
  },
  
  // 更新菜品数量
  onQuantityChange(e) {
    this.setData({
      'dish.quantity': e.detail.value
    });
  },
  
  // 更新菜品分类
  onCategoryChange(e) {
    this.setData({
      'dish.category': e.detail.value
    });
  },
  
  // 更新备注
  onNotesChange(e) {
    this.setData({
      'dish.notes': e.detail.value
    });
  },
  
  // 图片上传成功
  onUploadSuccess(e) {
    const { files } = e.detail;
    this.setData({
      fileList: files
    });
  },
  
  // 移除上传图片
  onUploadRemove() {
    this.setData({
      fileList: []
    });
  },
  
  // 取消
  onCancel() {
    wx.navigateBack();
  },
  
  // 提交表单
  onSubmit() {
    const { dish, selectedRecipe, fileList } = this.data;
    
    // 验证表单
    if (dish.type === 'recipe' && !selectedRecipe) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '请选择菜谱'
      });
      return;
    }
    
    if (dish.type === 'custom' && !dish.name.trim()) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '请输入菜品名称'
      });
      return;
    }
    
    if (!dish.price) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '请输入菜品价格'
      });
      return;
    }
    
    // 构建菜品数据
    const newDish = {
      id: Date.now().toString(),
      type: dish.type,
      name: dish.name,
      description: dish.description,
      price: parseFloat(dish.price),
      quantity: dish.quantity,
      category: dish.category,
      notes: dish.notes,
      createTime: new Date().toISOString()
    };
    
    // 添加图片
    if (dish.type === 'recipe' && selectedRecipe) {
      newDish.image = selectedRecipe.image;
      newDish.recipeId = selectedRecipe.id;
      newDish.recipe = selectedRecipe;
    } else if (dish.type === 'custom' && fileList.length > 0) {
      newDish.image = fileList[0].url;
    }
    
    // 保存到本地或发送到服务器
    this.saveDish(newDish);
  },
  
  // 保存菜品到订单
  saveDish(dish) {
    try {
      // 获取当前订单菜品列表
      const { orderId } = this.data;
      
      if (orderId) {
        // 如果有订单ID，将菜品添加到指定订单
        const orders = wx.getStorageSync('orders') || [];
        const orderIndex = orders.findIndex(order => order.id === orderId);
        
        if (orderIndex !== -1) {
          // 找到订单，添加菜品
          const order = orders[orderIndex];
          const dishes = order.dishes || [];
          dishes.push(dish);
          
          // 更新订单总价
          order.dishes = dishes;
          order.totalPrice = this.calculateTotalPrice(dishes);
          
          // 更新本地存储
          orders[orderIndex] = order;
          wx.setStorageSync('orders', orders);
          
          Toast({
            context: this,
            selector: '#t-toast',
            message: '添加菜品成功',
            theme: 'success'
          });
          
          // 返回上一页
          setTimeout(() => {
            wx.navigateBack();
          }, 1000);
        } else {
          throw new Error('找不到指定订单');
        }
      } else {
        // 如果没有订单ID，添加到临时菜单
        const tempMenu = wx.getStorageSync('tempMenu') || [];
        tempMenu.push(dish);
        wx.setStorageSync('tempMenu', tempMenu);
        
        Toast({
          context: this,
          selector: '#t-toast',
          message: '添加菜品成功',
          theme: 'success'
        });
        
        // 返回上一页
        setTimeout(() => {
          wx.navigateBack();
        }, 1000);
      }
    } catch (error) {
      console.error('保存菜品失败:', error);
      Toast({
        context: this,
        selector: '#t-toast',
        message: '添加菜品失败'
      });
    }
  },
  
  // 计算订单总价
  calculateTotalPrice(dishes) {
    return dishes.reduce((total, dish) => {
      return total + (dish.price * dish.quantity);
    }, 0);
  }
}); 