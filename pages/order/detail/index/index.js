import Toast from 'tdesign-miniprogram/toast/index';

Page({
  data: {
    // 订单ID
    orderId: '',
    
    // 订单日期
    orderDate: '',
    formatDate: '',
    
    // 订单菜品数据
    orderData: {
      breakfast: [],
      lunch: [],
      dinner: []
    },
    
    // 食材总数
    totalIngredients: 0,
    
    // 总烹饪时间(分钟)
    totalCookTime: 0,
    
    // 选项卡当前值
    tabValue: 0,
    
    // 是否显示删除确认对话框
    showDeleteConfirm: false,
    
    // 下拉菜单选项
    menuOptions: [
      { label: '编辑订单', value: 'edit' },
      { label: '分享订单', value: 'share' },
      { label: '删除订单', value: 'delete' }
    ]
  },
  
  onLoad(options) {
    if (options.id) {
      this.setData({
        orderId: options.id
      });
      this.loadOrderData(options.id);
    } else if (options.date) {
      const date = parseInt(options.date);
      this.setData({
        orderDate: date
      });
      this.loadOrderDataByDate(date);
    } else {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '参数错误',
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },
  
  // 根据订单ID加载数据
  loadOrderData(orderId) {
    // 从本地存储加载订单数据
    const orders = wx.getStorageSync('orders') || [];
    const order = orders.find(o => o.id === orderId);
    
    if (order) {
      this.setData({
        orderDate: order.date,
        orderData: {
          breakfast: order.breakfast || [],
          lunch: order.lunch || [],
          dinner: order.dinner || []
        }
      });
      
      this.updateFormatDate();
      this.calculateTotalIngredients();
      this.calculateTotalCookTime();
    } else {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '未找到订单',
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },
  
  // 根据日期加载数据
  loadOrderDataByDate(date) {
    // 从本地存储加载订单数据
    const orders = wx.getStorageSync('orders') || [];
    const order = orders.find(o => o.date === date);
    
    if (order) {
      this.setData({
        orderId: order.id,
        orderData: {
          breakfast: order.breakfast || [],
          lunch: order.lunch || [],
          dinner: order.dinner || []
        }
      });
    } else {
      // 如果没有找到订单，可能是新建的，使用临时菜单数据
      const tempMenu = wx.getStorageSync('tempMenu') || {
        breakfast: [],
        lunch: [],
        dinner: []
      };
      
      this.setData({
        orderData: tempMenu
      });
    }
    
    this.updateFormatDate();
    this.calculateTotalIngredients();
    this.calculateTotalCookTime();
  },
  
  // 更新格式化日期显示
  updateFormatDate() {
    const date = new Date(this.data.orderDate);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekday = weekdays[date.getDay()];
    
    const formatDate = `${year}-${month}-${day} 星期${weekday}`;
    this.setData({ formatDate });
  },
  
  // 计算食材总数
  calculateTotalIngredients() {
    const { orderData } = this.data;
    const allIngredients = new Set();
    
    // 遍历所有餐次的菜品
    Object.values(orderData).forEach(mealDishes => {
      mealDishes.forEach(dish => {
        dish.ingredients.forEach(ingredient => {
          allIngredients.add(ingredient.name);
        });
      });
    });
    
    this.setData({
      totalIngredients: allIngredients.size
    });
  },
  
  // 计算总烹饪时间
  calculateTotalCookTime() {
    const { orderData } = this.data;
    let totalTime = 0;
    
    // 遍历所有餐次的菜品
    Object.values(orderData).forEach(mealDishes => {
      mealDishes.forEach(dish => {
        totalTime += dish.cookTime || 0;
      });
    });
    
    this.setData({
      totalCookTime: totalTime
    });
  },
  
  // 切换选项卡
  onTabChange(e) {
    this.setData({
      tabValue: e.detail.value
    });
  },
  
  // 返回上一页
  onBack() {
    wx.navigateBack();
  },
  
  // 菜单选择
  onMenuSelect(e) {
    const { value } = e.detail;
    
    switch (value) {
      case 'edit':
        this.onEditOrder();
        break;
      case 'share':
        this.onShareOrder();
        break;
      case 'delete':
        this.onDeleteTap();
        break;
    }
  },
  
  // 编辑订单
  onEditOrder() {
    wx.navigateTo({
      url: `/pages/order/index/index?date=${this.data.orderDate}`
    });
  },
  
  // 生成购物清单
  onGenerateShoppingList() {
    const { orderData } = this.data;
    const allIngredients = this.generateShoppingList(orderData);
    
    // 保存到临时存储，供购物清单页面使用
    wx.setStorageSync('shoppingListDraft', allIngredients);
    
    // 跳转到购物清单页面
    wx.navigateTo({
      url: '/pages/shopping/list/index/index?from=order'
    });
  },
  
  // 生成购物清单数据
  generateShoppingList(orderData) {
    const ingredientsMap = new Map();
    
    // 遍历所有餐次的菜品
    Object.values(orderData).forEach(mealDishes => {
      mealDishes.forEach(dish => {
        // 根据份数调整食材用量
        const servings = dish.servings || 1;
        
        dish.ingredients.forEach(ingredient => {
          const { name, amount, unit } = ingredient;
          const key = `${name}:${unit}`;
          
          if (ingredientsMap.has(key)) {
            // 已存在该食材，累加数量
            const existingAmount = ingredientsMap.get(key).amount;
            ingredientsMap.set(key, {
              name,
              amount: existingAmount + (amount * servings),
              unit
            });
          } else {
            // 新食材，添加到Map
            ingredientsMap.set(key, {
              name,
              amount: amount * servings,
              unit
            });
          }
        });
      });
    });
    
    // 转换为数组并按名称排序
    return Array.from(ingredientsMap.values())
      .sort((a, b) => a.name.localeCompare(b.name, 'zh'));
  },
  
  // 分享订单
  onShareOrder() {
    // 微信小程序的分享功能
  },
  
  // 删除订单
  onDeleteTap() {
    this.setData({
      showDeleteConfirm: true
    });
  },
  
  // 取消删除
  onCancelDelete() {
    this.setData({
      showDeleteConfirm: false
    });
  },
  
  // 确认删除
  onConfirmDelete() {
    const { orderId } = this.data;
    
    // 从本地存储中删除订单
    const orders = wx.getStorageSync('orders') || [];
    const updatedOrders = orders.filter(o => o.id !== orderId);
    
    wx.setStorageSync('orders', updatedOrders);
    
    Toast({
      context: this,
      selector: '#t-toast',
      message: '已删除订单',
    });
    
    this.setData({
      showDeleteConfirm: false
    });
    
    // 返回上一页
    setTimeout(() => {
      wx.navigateBack();
    }, 1000);
  },
  
  // 页面分享
  onShareAppMessage() {
    return {
      title: `家宴菜谱 ${this.data.formatDate}`,
      path: `/pages/order/detail/index?id=${this.data.orderId}`
    };
  }
}); 