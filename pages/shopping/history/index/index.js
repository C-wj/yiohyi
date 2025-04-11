// 获取全局实例
const app = getApp();
import Toast from 'tdesign-miniprogram/toast/index';

Page({
  data: {
    // 历史记录数据
    historyList: [],
    loading: true,
    
    // 当前选中的历史记录
    currentHistory: null,
    showDetailDialog: false,
    
    // 清空确认对话框
    showClearConfirm: false,
    
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
    // 从本地存储加载历史记录数据
    this.loadHistoryData();
  },
  
  onShow() {
    // 页面显示时刷新数据
    this.loadHistoryData();
  },
  
  // 加载历史记录数据
  loadHistoryData() {
    this.setData({ loading: true });
    
    try {
      // 从本地存储获取历史记录
      const historyData = wx.getStorageSync('shoppingHistory') || [];
      
      // 处理历史记录数据，为每个历史添加预览项
      const processedHistory = historyData.map(history => {
        // 提取前3个物品作为预览
        const previewItems = history.items.slice(0, 3).map(item => item.name);
        
        return {
          ...history,
          previewItems
        };
      });
      
      this.setData({
        historyList: processedHistory,
        loading: false
      });
    } catch (error) {
      console.error('加载历史记录失败:', error);
      Toast({
        context: this,
        selector: '#t-toast',
        message: '加载历史记录失败'
      });
      this.setData({ loading: false });
    }
  },
  
  // 点击历史记录项
  onHistoryItemTap(e) {
    const { id } = e.currentTarget.dataset;
    this.showHistoryDetail(id);
  },
  
  // 显示历史记录详情
  showHistoryDetail(id) {
    const history = this.data.historyList.find(item => item.id === id);
    
    if (history) {
      this.setData({
        currentHistory: history,
        showDetailDialog: true
      });
    } else {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '找不到该历史记录'
      });
    }
  },
  
  // 关闭详情对话框
  closeDetailDialog() {
    this.setData({
      showDetailDialog: false,
      currentHistory: null
    });
  },
  
  // 从详情弹窗恢复历史记录到购物清单
  restoreFromDetail() {
    if (this.data.currentHistory) {
      this.restoreHistoryItems(this.data.currentHistory.items);
      this.closeDetailDialog();
    }
  },
  
  // 恢复历史记录到购物清单
  restoreHistory(e) {
    const { id } = e.currentTarget.dataset;
    const history = this.data.historyList.find(item => item.id === id);
    
    if (history) {
      this.restoreHistoryItems(history.items);
    } else {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '找不到该历史记录'
      });
    }
  },
  
  // 恢复购物清单项
  restoreHistoryItems(items) {
    if (!items || items.length === 0) return;
    
    try {
      // 获取当前购物清单
      const currentList = wx.getStorageSync('shoppingList') || [];
      
      // 为恢复的物品生成新的ID
      const timestamp = Date.now();
      const restoredItems = items.map((item, index) => ({
        ...item,
        id: `${timestamp}-${index}`,
        completed: false,
        createTime: new Date().toISOString()
      }));
      
      // 合并恢复的物品和当前购物清单
      const updatedList = [...restoredItems, ...currentList];
      
      // 保存更新后的购物清单
      wx.setStorageSync('shoppingList', updatedList);
      
      Toast({
        context: this,
        selector: '#t-toast',
        message: '已恢复至购物清单',
        theme: 'success'
      });
    } catch (error) {
      console.error('恢复购物清单失败:', error);
      Toast({
        context: this,
        selector: '#t-toast',
        message: '恢复购物清单失败'
      });
    }
  },
  
  // 分享历史记录
  shareHistory(e) {
    const { id } = e.currentTarget.dataset;
    const history = this.data.historyList.find(item => item.id === id);
    
    if (!history) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '找不到该历史记录'
      });
      return;
    }
    
    // 生成分享内容
    const itemsList = history.items.map(item => `${item.name} ${item.quantity}${item.unit}`).join('\n');
    const shareContent = `购物清单 (${history.date}):\n${itemsList}`;
    
    // 设置分享参数
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
    
    // 在真实项目中，可以生成一个可分享的页面或图片
    Toast({
      context: this,
      selector: '#t-toast',
      message: '已准备分享内容',
      theme: 'success'
    });
    
    // 模拟内容已复制到剪贴板
    wx.setClipboardData({
      data: shareContent,
      success: () => {
        wx.showToast({
          title: '购物清单已复制，可粘贴发送给好友',
          icon: 'none'
        });
      }
    });
  },
  
  // 显示清空确认对话框
  showClearConfirm() {
    this.setData({ showClearConfirm: true });
  },
  
  // 关闭清空确认对话框
  closeClearConfirm() {
    this.setData({ showClearConfirm: false });
  },
  
  // 清空所有历史记录
  clearAllHistory() {
    try {
      // 清空本地存储中的历史记录
      wx.setStorageSync('shoppingHistory', []);
      
      this.setData({
        historyList: [],
        showClearConfirm: false
      });
      
      Toast({
        context: this,
        selector: '#t-toast',
        message: '历史记录已清空',
        theme: 'success'
      });
    } catch (error) {
      console.error('清空历史记录失败:', error);
      Toast({
        context: this,
        selector: '#t-toast',
        message: '清空历史记录失败'
      });
    }
  },
  
  // 删除单个历史记录
  deleteHistory(e) {
    const { id } = e.currentTarget.dataset;
    
    try {
      // 获取当前历史记录列表
      const historyData = wx.getStorageSync('shoppingHistory') || [];
      
      // 过滤掉要删除的记录
      const updatedHistory = historyData.filter(item => item.id !== id);
      
      // 保存更新后的历史记录
      wx.setStorageSync('shoppingHistory', updatedHistory);
      
      // 更新页面数据
      this.loadHistoryData();
      
      Toast({
        context: this,
        selector: '#t-toast',
        message: '删除成功',
        theme: 'success'
      });
    } catch (error) {
      console.error('删除历史记录失败:', error);
      Toast({
        context: this,
        selector: '#t-toast',
        message: '删除历史记录失败'
      });
    }
  },
  
  // 右滑删除操作
  onSwipeDelete(e) {
    const { id } = e.currentTarget.dataset;
    this.deleteHistory({ currentTarget: { dataset: { id } } });
  }
}); 