import Toast from 'tdesign-miniprogram/toast/index';
import request from '~/api/request';

Page({
  data: {
    // 日期相关
    selectedDate: new Date().getTime(),
    showCalendar: false,
    formatDate: '',
    minDate: new Date(new Date().setDate(new Date().getDate() - 7)).getTime(),
    maxDate: new Date(new Date().setDate(new Date().getDate() + 30)).getTime(),
    
    // 餐次
    activeMeal: 'breakfast', // breakfast, lunch, dinner
    
    // 已选菜品
    selectedDishes: {
      breakfast: [],
      lunch: [],
      dinner: []
    },
    
    // 食材总数
    totalIngredients: 0,
    
    // 是否为空
    isListEmpty: true
  },
  
  // 生命周期函数
  onLoad(options) {
    // 如果有日期参数，使用传入的日期
    if (options && options.date) {
      this.setData({
        selectedDate: parseInt(options.date)
      });
    }
    
    this.updateFormatDate();
    this.calculateTotalIngredients();
    this.checkIfEmpty();
    
    // 模拟初始数据
    this.setData({
      'selectedDishes.lunch': [
        {
          id: '1',
          name: '番茄炒蛋',
          image: '/static/home/card0.png',
          cookTime: 15,
          servings: 2,
          ingredients: [
            { name: '西红柿', amount: 200, unit: 'g' },
            { name: '鸡蛋', amount: 3, unit: '个' },
            { name: '葱', amount: 10, unit: 'g' },
            { name: '盐', amount: 5, unit: 'g' }
          ]
        },
        {
          id: '2',
          name: '糖醋排骨',
          image: '/static/home/card1.png',
          cookTime: 45,
          servings: 3,
          ingredients: [
            { name: '排骨', amount: 500, unit: 'g' },
            { name: '醋', amount: 30, unit: 'ml' },
            { name: '白糖', amount: 40, unit: 'g' },
            { name: '生姜', amount: 20, unit: 'g' },
            { name: '葱', amount: 10, unit: 'g' }
          ]
        }
      ]
    });
    
    this.calculateTotalIngredients();
    this.checkIfEmpty();
  },
  
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        value: 'order'
      });
    }
  },
  
  // 更新格式化日期显示
  updateFormatDate() {
    const date = new Date(this.data.selectedDate);
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
    const { selectedDishes } = this.data;
    const allIngredients = new Set();
    
    // 遍历所有餐次的菜品
    Object.values(selectedDishes).forEach(mealDishes => {
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
  
  // 检查是否为空
  checkIfEmpty() {
    const { selectedDishes } = this.data;
    const isEmpty = Object.values(selectedDishes).every(dishes => dishes.length === 0);
    
    this.setData({ isListEmpty: isEmpty });
  },
  
  // 切换到前一天
  onPrevDate() {
    const prevDate = new Date(this.data.selectedDate - 24 * 60 * 60 * 1000).getTime();
    
    if (prevDate < this.data.minDate) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '已经是最早日期了',
      });
      return;
    }
    
    this.setData({
      selectedDate: prevDate
    });
    
    this.updateFormatDate();
    // 在实际应用中，这里还应该加载当天的点菜数据
  },
  
  // 切换到后一天
  onNextDate() {
    const nextDate = new Date(this.data.selectedDate + 24 * 60 * 60 * 1000).getTime();
    
    if (nextDate > this.data.maxDate) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '已经是最晚日期了',
      });
      return;
    }
    
    this.setData({
      selectedDate: nextDate
    });
    
    this.updateFormatDate();
    // 在实际应用中，这里还应该加载当天的点菜数据
  },
  
  // 点击日期，打开日历选择器
  onDateTap() {
    this.setData({
      showCalendar: true
    });
  },
  
  // 日历选择完成
  onCalendarConfirm(e) {
    this.setData({
      selectedDate: e.detail,
      showCalendar: false
    });
    
    this.updateFormatDate();
    // 在实际应用中，这里还应该加载当天的点菜数据
  },
  
  // 日历关闭
  onCalendarClose() {
    this.setData({
      showCalendar: false
    });
  },
  
  // 餐次切换
  onMealChange(e) {
    this.setData({
      activeMeal: e.detail.value
    });
  },
  
  // 修改份数
  onServingsChange(e) {
    const id = e.currentTarget.dataset.id;
    const { value } = e.detail;
    const { activeMeal, selectedDishes } = this.data;
    
    // 找到对应菜品并更新份数
    const updatedDishes = selectedDishes[activeMeal].map(dish => {
      if (dish.id === id) {
        return { ...dish, servings: value };
      }
      return dish;
    });
    
    this.setData({
      [`selectedDishes.${activeMeal}`]: updatedDishes
    });
    
    this.calculateTotalIngredients();
  },
  
  // 删除菜品
  onDeleteDish(e) {
    const id = e.currentTarget.dataset.id;
    const { activeMeal, selectedDishes } = this.data;
    
    // 找到要删除的菜品索引
    const index = selectedDishes[activeMeal].findIndex(dish => dish.id === id);
    
    if (index !== -1) {
      // 从数组中删除
      const updatedDishes = [...selectedDishes[activeMeal]];
      updatedDishes.splice(index, 1);
      
      this.setData({
        [`selectedDishes.${activeMeal}`]: updatedDishes
      });
      
      this.calculateTotalIngredients();
      this.checkIfEmpty();
      
      Toast({
        context: this,
        selector: '#t-toast',
        message: '已删除菜品',
      });
    }
  },
  
  // 添加菜品
  onAddDish() {
    wx.navigateTo({
      url: `/pages/order/add-dish/index/index?meal=${this.data.activeMeal}&date=${this.data.selectedDate}`
    });
  },
  
  // 跳转到日历页面
  navigateToCalendar() {
    wx.navigateTo({
      url: '/pages/order/calendar/index/index'
    });
  },
  
  // 生成购物清单
  onGenerateShoppingList() {
    const { selectedDishes } = this.data;
    
    // 合并所有餐次的菜品
    const allDishes = [
      ...selectedDishes.breakfast,
      ...selectedDishes.lunch,
      ...selectedDishes.dinner
    ];
    
    if (allDishes.length === 0) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '请先添加菜品',
      });
      return;
    }
    
    // 生成购物清单
    const ingredients = this.generateShoppingList(selectedDishes);
    
    // 保存到本地存储
    wx.setStorageSync('tempShoppingList', ingredients);
    
    // 跳转到购物清单页面
    wx.showModal({
      title: '生成购物清单',
      content: `已找到${ingredients.length}种食材，是否立即添加到购物清单？`,
      confirmText: '立即添加',
      success: (res) => {
        if (res.confirm) {
          // 直接添加到购物清单
          this.addToShoppingList(ingredients);
        }
      }
    });
  },
  
  // 添加到购物清单
  addToShoppingList(ingredients) {
    try {
      // 获取现有购物清单
      const existingList = wx.getStorageSync('shoppingList') || [];
      
      // 创建新购物清单项
      const newItems = ingredients.map(item => ({
        id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        name: item.name,
        quantity: item.totalAmount.toString(),
        unit: item.unit,
        completed: false,
        fromRecipe: true,
        createTime: new Date().toISOString()
      }));
      
      // 合并购物清单
      const updatedList = [...newItems, ...existingList];
      
      // 保存到本地存储
      wx.setStorageSync('shoppingList', updatedList);
      
      Toast({
        context: this,
        selector: '#t-toast',
        message: '已添加到购物清单',
        theme: 'success'
      });
      
      // 询问是否跳转到购物清单页面
      setTimeout(() => {
        wx.showModal({
          title: '添加成功',
          content: '是否前往购物清单查看？',
          confirmText: '立即查看',
          cancelText: '稍后再说',
          success: (res) => {
            if (res.confirm) {
              wx.navigateTo({
                url: '/pages/shopping/list/index/index'
              });
            }
          }
        });
      }, 1500);
    } catch (error) {
      console.error('添加到购物清单失败:', error);
      Toast({
        context: this,
        selector: '#t-toast',
        message: '添加失败，请重试',
        theme: 'error'
      });
    }
  },
  
  // 生成购物清单的逻辑
  generateShoppingList(selectedDishes) {
    // 合并所有食材
    const ingredients = {};
    
    // 遍历所有餐次的菜品
    Object.values(selectedDishes).forEach(mealDishes => {
      mealDishes.forEach(dish => {
        // 考虑份数
        const servings = dish.servings || 1;
        
        dish.ingredients.forEach(ingredient => {
          const { name, amount, unit } = ingredient;
          
          // 如果食材已存在，累加数量
          if (ingredients[name]) {
            ingredients[name].amount += amount * servings;
          } else {
            // 新增食材
            ingredients[name] = {
              name,
              amount: amount * servings,
              unit,
              checked: false
            };
          }
        });
      });
    });
    
    // 转换为数组并按类别分组
    const categories = {
      vegetables: [],
      meat: [],
      seafood: [],
      dairy: [],
      grains: [],
      condiments: [],
      others: []
    };
    
    // 简单的食材分类逻辑，实际项目中可能需要更复杂的分类或从后端获取
    Object.values(ingredients).forEach(ingredient => {
      const name = ingredient.name;
      
      // 简单分类逻辑
      if (['菠菜', '白菜', '黄瓜', '洋葱', '西红柿', '土豆', '胡萝卜', '青椒', '葱', '姜', '蒜', '生姜'].includes(name)) {
        categories.vegetables.push(ingredient);
      } else if (['猪肉', '牛肉', '羊肉', '鸡肉', '鸭肉', '排骨'].includes(name)) {
        categories.meat.push(ingredient);
      } else if (['鱼', '虾', '蟹', '贝'].some(seafood => name.includes(seafood))) {
        categories.seafood.push(ingredient);
      } else if (['奶', '蛋', '奶酪', '黄油', '鸡蛋'].some(dairy => name.includes(dairy))) {
        categories.dairy.push(ingredient);
      } else if (['米', '面', '面粉', '馒头', '面包'].some(grain => name.includes(grain))) {
        categories.grains.push(ingredient);
      } else if (['盐', '糖', '醋', '酱油', '料酒', '白糖', '香油'].includes(name)) {
        categories.condiments.push(ingredient);
      } else {
        categories.others.push(ingredient);
      }
    });
    
    return {
      date: this.data.formatDate,
      categories
    };
  }
}); 