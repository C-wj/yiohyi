// 获取全局实例
const app = getApp();
import Toast from 'tdesign-miniprogram/toast/index';

Page({
  data: {
    // 购物清单数据
    shoppingList: [],
    pendingList: [],
    completedList: [],
    
    // 添加新物品表单数据
    newItem: {
      name: '',
      quantity: '',
      unit: ''
    },
    
    // 编辑物品数据
    editItem: {},
    showEditDialog: false,
    editItemIndex: -1,
    
    // 选择状态
    selectedItems: [],
    selectAll: false,
    hasItemSelected: false,
    
    // 侧滑动作配置
    swipeActions: [
      {
        text: '删除',
        theme: 'danger',
        width: 80
      }
    ]
  },
  
  onLoad() {
    // 从本地存储加载购物清单数据
    this.loadShoppingList();
    
    // 检查是否有从菜谱导入的临时清单
    const tempList = wx.getStorageSync('tempShoppingList');
    if (tempList && tempList.length > 0) {
      // 处理导入
      this.processImport(tempList);
      // 删除临时数据
      wx.removeStorageSync('tempShoppingList');
    }
  },
  
  onShow() {
    // 刷新列表数据
    this.filterShoppingList();
  },
  
  // 加载购物清单数据
  loadShoppingList() {
    try {
      const shoppingList = wx.getStorageSync('shoppingList') || [];
      this.setData({ shoppingList }, () => {
        this.filterShoppingList();
      });
    } catch (error) {
      console.error('加载购物清单失败:', error);
      Toast({
        context: this,
        selector: '#t-toast',
        message: '加载购物清单失败'
      });
    }
  },
  
  // 保存购物清单数据到本地存储
  saveShoppingList() {
    try {
      wx.setStorageSync('shoppingList', this.data.shoppingList);
    } catch (error) {
      console.error('保存购物清单失败:', error);
      Toast({
        context: this,
        selector: '#t-toast',
        message: '保存购物清单失败'
      });
    }
  },
  
  // 过滤分类购物清单数据
  filterShoppingList() {
    const { shoppingList } = this.data;
    
    const pendingList = shoppingList.filter(item => !item.completed);
    const completedList = shoppingList.filter(item => item.completed);
    
    this.setData({
      pendingList,
      completedList
    });
  },
  
  // 输入变化处理
  onInputChange(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`newItem.${field}`]: value
    });
  },
  
  // 清除输入框
  clearInput() {
    this.setData({
      'newItem.name': ''
    });
  },
  
  // 聚焦输入框
  focusInput() {
    // 使输入框获取焦点
    this.setData({
      focusInput: true
    });
  },
  
  // 添加物品到购物清单
  addItem() {
    const { newItem, shoppingList } = this.data;
    
    if (!newItem.name.trim()) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '请输入物品名称'
      });
      return;
    }
    
    // 创建新物品对象
    const item = {
      id: Date.now().toString(), // 使用时间戳作为唯一ID
      name: newItem.name.trim(),
      quantity: newItem.quantity || '1',
      unit: newItem.unit || '个',
      completed: false,
      createTime: new Date().toISOString()
    };
    
    // 更新购物清单
    const updatedList = [item, ...shoppingList];
    
    this.setData({
      shoppingList: updatedList,
      newItem: {
        name: '',
        quantity: '',
        unit: ''
      }
    }, () => {
      this.saveShoppingList();
      this.filterShoppingList();
      
      Toast({
        context: this,
        selector: '#t-toast',
        message: '添加成功',
        theme: 'success'
      });
    });
  },
  
  // 删除物品
  deleteItem(e) {
    const { id } = e.currentTarget.dataset;
    
    const updatedList = this.data.shoppingList.filter(item => item.id !== id);
    
    this.setData({
      shoppingList: updatedList
    }, () => {
      this.saveShoppingList();
      this.filterShoppingList();
      
      Toast({
        context: this,
        selector: '#t-toast',
        message: '删除成功',
        theme: 'success'
      });
    });
  },
  
  // 切换物品完成状态
  toggleItemComplete(e) {
    const { id } = e.currentTarget.dataset;
    
    const updatedList = this.data.shoppingList.map(item => {
      if (item.id === id) {
        return { ...item, completed: !item.completed };
      }
      return item;
    });
    
    this.setData({
      shoppingList: updatedList
    }, () => {
      this.saveShoppingList();
      this.filterShoppingList();
    });
  },
  
  // 编辑物品
  editItem(e) {
    const { id } = e.currentTarget.dataset;
    const item = this.data.shoppingList.find(item => item.id === id);
    
    if (item) {
      this.setData({
        editItem: { ...item },
        showEditDialog: true
      });
    }
  },
  
  // 编辑物品字段变更
  onEditItemChange(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    
    this.setData({
      [`editItem.${field}`]: value
    });
  },
  
  // 保存编辑的物品
  saveEditItem() {
    const { editItem, shoppingList } = this.data;
    
    if (!editItem.name.trim()) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '请输入物品名称'
      });
      return;
    }
    
    const updatedList = shoppingList.map(item => {
      if (item.id === editItem.id) {
        return { 
          ...item, 
          name: editItem.name.trim(),
          quantity: editItem.quantity || '1',
          unit: editItem.unit || '个',
          category: editItem.category || ''
        };
      }
      return item;
    });
    
    this.setData({
      shoppingList: updatedList,
      showEditDialog: false
    }, () => {
      this.saveShoppingList();
      this.filterShoppingList();
      
      Toast({
        context: this,
        selector: '#t-toast',
        message: '编辑成功',
        theme: 'success'
      });
    });
  },
  
  // 关闭编辑对话框
  closeEditDialog() {
    this.setData({
      showEditDialog: false
    });
  },
  
  // 处理选择变更
  onSelectionChange(e) {
    const selectedItems = e.detail.value;
    
    this.setData({
      selectedItems,
      hasItemSelected: selectedItems.length > 0,
      selectAll: selectedItems.length === this.data.pendingList.length && this.data.pendingList.length > 0
    });
  },
  
  // 全选/取消全选
  onSelectAllChange(e) {
    const { value } = e.detail;
    
    if (value) {
      // 全选
      const allIds = this.data.pendingList.map(item => item.id);
      this.setData({
        selectedItems: allIds,
        selectAll: true,
        hasItemSelected: allIds.length > 0
      });
    } else {
      // 取消全选
      this.setData({
        selectedItems: [],
        selectAll: false,
        hasItemSelected: false
      });
    }
  },
  
  // 删除选中的物品
  deleteSelectedItems() {
    const { selectedItems, shoppingList } = this.data;
    
    if (selectedItems.length === 0) return;
    
    const updatedList = shoppingList.filter(item => !selectedItems.includes(item.id));
    
    this.setData({
      shoppingList: updatedList,
      selectedItems: [],
      selectAll: false,
      hasItemSelected: false
    }, () => {
      this.saveShoppingList();
      this.filterShoppingList();
      
      Toast({
        context: this,
        selector: '#t-toast',
        message: '删除成功',
        theme: 'success'
      });
    });
  },
  
  // 标记选中的物品为已完成
  markSelectedAsComplete() {
    const { selectedItems, shoppingList } = this.data;
    
    if (selectedItems.length === 0) return;
    
    const updatedList = shoppingList.map(item => {
      if (selectedItems.includes(item.id)) {
        return { ...item, completed: true };
      }
      return item;
    });
    
    this.setData({
      shoppingList: updatedList,
      selectedItems: [],
      selectAll: false,
      hasItemSelected: false
    }, () => {
      this.saveShoppingList();
      this.filterShoppingList();
      
      Toast({
        context: this,
        selector: '#t-toast',
        message: '标记完成',
        theme: 'success'
      });
    });
  },
  
  // 清空已完成的物品
  clearCompletedItems() {
    const { shoppingList, completedList } = this.data;
    
    if (completedList.length === 0) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '没有已完成物品'
      });
      return;
    }
    
    // 保存已完成物品到历史记录
    this.saveHistoryBeforeClear(completedList);
    
    // 更新购物清单，只保留未完成物品
    const updatedList = shoppingList.filter(item => !item.completed);
    
    this.setData({
      shoppingList: updatedList
    }, () => {
      this.saveShoppingList();
      this.filterShoppingList();
      
      Toast({
        context: this,
        selector: '#t-toast',
        message: '清空成功',
        theme: 'success'
      });
    });
  },
  
  // 保存已完成物品到历史记录
  saveHistoryBeforeClear(completedItems) {
    if (!completedItems || completedItems.length === 0) return;
    
    try {
      // 获取当前历史记录
      const historyData = wx.getStorageSync('shoppingHistory') || [];
      
      // 创建新的历史记录
      const newHistory = {
        id: Date.now().toString(),
        date: this.formatDate(new Date()),
        items: completedItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          category: item.category
        })),
        createdAt: new Date().toISOString()
      };
      
      // 添加到历史记录
      const updatedHistory = [newHistory, ...historyData];
      
      // 保存更新后的历史记录
      wx.setStorageSync('shoppingHistory', updatedHistory);
    } catch (error) {
      console.error('保存历史记录失败:', error);
    }
  },
  
  // 保存当前购物清单到历史记录
  saveShoppingHistory() {
    const { completedList } = this.data;
    
    if (completedList.length === 0) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '没有已完成物品可保存'
      });
      return;
    }
    
    try {
      // 获取当前历史记录
      const historyData = wx.getStorageSync('shoppingHistory') || [];
      
      // 创建新的历史记录
      const newHistory = {
        id: Date.now().toString(),
        date: this.formatDate(new Date()),
        items: completedList.map(item => ({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          category: item.category
        })),
        createdAt: new Date().toISOString()
      };
      
      // 添加到历史记录
      const updatedHistory = [newHistory, ...historyData];
      
      // 保存更新后的历史记录
      wx.setStorageSync('shoppingHistory', updatedHistory);
      
      Toast({
        context: this,
        selector: '#t-toast',
        message: '保存历史成功',
        theme: 'success'
      });
    } catch (error) {
      console.error('保存历史记录失败:', error);
      Toast({
        context: this,
        selector: '#t-toast',
        message: '保存历史记录失败'
      });
    }
  },
  
  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  },
  
  // 导航到历史记录页面
  goToHistory() {
    wx.navigateTo({
      url: '/pages/shopping/history/index/index'
    });
  },
  
  // 从菜谱导入
  importFromRecipe() {
    wx.navigateTo({
      url: '/pages/recipe/list/index/index',
      events: {
        // 接收从菜谱选择页面返回的数据
        selectRecipe: (recipe) => {
          if (recipe && recipe.ingredients) {
            this.addIngredients(recipe.ingredients);
          }
        }
      }
    });
  },
  
  // 处理导入的食材列表
  processImport(ingredients) {
    if (!ingredients || ingredients.length === 0) return;
    
    wx.showModal({
      title: '导入食材',
      content: `发现${ingredients.length}种食材，是否导入到购物清单？`,
      confirmText: '导入',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.addIngredients(ingredients);
        }
      }
    });
  },
  
  // 添加食材到购物清单
  addIngredients(ingredients) {
    if (!ingredients || ingredients.length === 0) return;
    
    try {
      const { shoppingList } = this.data;
      const newList = [...shoppingList];
      
      // 添加食材到列表
      ingredients.forEach(ingredient => {
        // 检查是否已存在相同名称和单位的食材
        const existingIndex = newList.findIndex(
          item => item.name === ingredient.name && item.unit === ingredient.unit && !item.completed
        );
        
        if (existingIndex >= 0) {
          // 已存在，更新数量
          const existing = newList[existingIndex];
          const currentAmount = parseFloat(existing.quantity) || 0;
          const addAmount = parseFloat(ingredient.totalAmount) || parseFloat(ingredient.amount) || 0;
          
          newList[existingIndex] = {
            ...existing,
            quantity: (currentAmount + addAmount).toString(),
            fromRecipe: true
          };
        } else {
          // 不存在，添加新项
          newList.unshift({
            id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9),
            name: ingredient.name,
            quantity: ingredient.totalAmount ? ingredient.totalAmount.toString() : 
                     ingredient.amount ? ingredient.amount.toString() : '1',
            unit: ingredient.unit || '个',
            completed: false,
            fromRecipe: true,
            createTime: new Date().toISOString()
          });
        }
      });
      
      // 更新状态和存储
      this.setData({ shoppingList: newList }, () => {
        this.saveShoppingList();
        this.filterShoppingList();
        
        Toast({
          context: this,
          selector: '#t-toast',
          message: '已导入食材到购物清单',
          theme: 'success'
        });
      });
      
    } catch (error) {
      console.error('导入食材失败:', error);
      Toast({
        context: this,
        selector: '#t-toast',
        message: '导入食材失败',
        theme: 'error'
      });
    }
  }
}); 