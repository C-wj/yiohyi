// app.js
import config from './config';
import Mock from './mock/index';
import createBus from './utils/eventBus';
import { connectSocket, fetchUnreadNum } from './mock/chat';

if (config.isMock) {
  Mock();
}

App({
  onLaunch() {
    const updateManager = wx.getUpdateManager();

    updateManager.onCheckForUpdate((res) => {
      // console.log(res.hasUpdate)
    });

    updateManager.onUpdateReady(() => {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success(res) {
          if (res.confirm) {
            updateManager.applyUpdate();
          }
        },
      });
    });

    this.getUnreadNum();
    this.connect();
    
    // 家宴菜谱小程序 - 初始化
    this.initFamilyRecipeApp();
  },
  globalData: {
    userInfo: null,
    unreadNum: 0, // 未读消息数量
    socket: null, // SocketTask 对象
    
    // 家宴菜谱小程序全局数据
    family: null, // 用户家庭信息
    currentRecipe: null, // 当前正在查看的菜谱
    shoppingList: null, // 购物清单
    
    // 主题相关
    theme: {
      primaryColor: '#FF9500',
      secondaryColor: '#4CAF50'
    }
  },

  /** 全局事件总线 */
  eventBus: createBus(),

  /** 初始化WebSocket */
  connect() {
    const socket = connectSocket();
    socket.onMessage((data) => {
      data = JSON.parse(data);
      if (data.type === 'message' && !data.data.message.read) this.setUnreadNum(this.globalData.unreadNum + 1);
    });
    this.globalData.socket = socket;
  },

  /** 获取未读消息数量 */
  getUnreadNum() {
    fetchUnreadNum().then(({ data }) => {
      this.globalData.unreadNum = data;
      this.eventBus.emit('unread-num-change', data);
    });
  },

  /** 设置未读消息数量 */
  setUnreadNum(unreadNum) {
    this.globalData.unreadNum = unreadNum;
    this.eventBus.emit('unread-num-change', unreadNum);
  },
  
  /** 初始化家宴菜谱小程序 */
  initFamilyRecipeApp() {
    // 检查是否有用户登录信息
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.globalData.userInfo = userInfo;
    }
    
    // 检查是否有家庭信息
    const familyInfo = wx.getStorageSync('familyInfo');
    if (familyInfo) {
      this.globalData.family = familyInfo;
    }
    
    // 设置主题色
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: this.globalData.theme.primaryColor
    });
  },
  
  /** 设置当前正在查看的菜谱 */
  setCurrentRecipe(recipe) {
    this.globalData.currentRecipe = recipe;
  },
  
  /** 获取当前正在查看的菜谱 */
  getCurrentRecipe() {
    return this.globalData.currentRecipe;
  },
  
  /** 保存购物清单 */
  saveShoppingList(shoppingList) {
    this.globalData.shoppingList = shoppingList;
    wx.setStorageSync('shoppingList', shoppingList);
  },
  
  /** 获取购物清单 */
  getShoppingList() {
    if (!this.globalData.shoppingList) {
      const shoppingList = wx.getStorageSync('shoppingList');
      if (shoppingList) {
        this.globalData.shoppingList = shoppingList;
      }
    }
    return this.globalData.shoppingList;
  }
});
