import Toast from 'tdesign-miniprogram/toast/index';

Page({
  data: {
    // 日历视图的年月
    year: 0,
    month: 0,
    
    // 当前选择的日期
    selectedDate: 0,
    
    // 格式化后的选择日期
    formatSelectedDate: '',
    
    // 日历数据
    calendarDays: [],
    
    // 选项卡当前值
    tabValue: 0,
    
    // 订单数据
    orders: [],
    
    // 当日菜单数据
    currentDayMenu: {
      breakfast: [],
      lunch: [],
      dinner: []
    },
    
    // 是否有当日菜单
    hasDayMenu: false
  },
  
  onLoad() {
    // 默认显示当前月份
    const now = new Date();
    const todayTimestamp = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    this.setData({
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      selectedDate: todayTimestamp
    });
    
    // 更新格式化日期
    this.updateFormatSelectedDate();
    
    // 加载订单数据
    this.loadOrders();
    
    // 生成日历数据
    this.generateCalendarDays();
    
    // 加载当日菜单
    this.loadCurrentDayMenu();
  },
  
  // 更新格式化的选择日期
  updateFormatSelectedDate() {
    if (!this.data.selectedDate) {
      this.setData({ formatSelectedDate: '' });
      return;
    }
    
    const selectedDate = new Date(this.data.selectedDate);
    const month = selectedDate.getMonth() + 1;
    const day = selectedDate.getDate();
    const formatSelectedDate = `${month}月${day}日`;
    
    this.setData({ formatSelectedDate });
  },
  
  // 加载订单数据
  loadOrders() {
    const orders = wx.getStorageSync('orders') || [];
    this.setData({ orders });
  },
  
  // 生成日历数据
  generateCalendarDays() {
    const { year, month } = this.data;
    
    // 获取该月第一天是星期几 (0-6, 0代表星期日)
    const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
    
    // 获取该月的天数
    const daysInMonth = new Date(year, month, 0).getDate();
    
    // 获取上个月的天数
    const daysInPrevMonth = new Date(year, month - 1, 0).getDate();
    
    // 生成日历数据
    const calendarDays = [];
    
    // 添加上个月的日期填充第一行
    for (let i = 0; i < firstDayOfMonth; i++) {
      const day = daysInPrevMonth - firstDayOfMonth + i + 1;
      const date = new Date(year, month - 2, day).getTime();
      calendarDays.push({
        day,
        date,
        isCurrentMonth: false,
        hasOrder: this.checkHasOrder(date)
      });
    }
    
    // 添加当前月的日期
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month - 1, i).getTime();
      calendarDays.push({
        day: i,
        date,
        isCurrentMonth: true,
        hasOrder: this.checkHasOrder(date),
        isToday: this.isToday(date)
      });
    }
    
    // 计算需要填充的下个月天数（保证总数为42，即6行）
    const remainingDays = 42 - calendarDays.length;
    
    // 添加下个月的日期填充剩余行
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month, i).getTime();
      calendarDays.push({
        day: i,
        date,
        isCurrentMonth: false,
        hasOrder: this.checkHasOrder(date)
      });
    }
    
    this.setData({ calendarDays });
  },
  
  // 检查指定日期是否有订单
  checkHasOrder(date) {
    const targetDate = new Date(date);
    const targetYear = targetDate.getFullYear();
    const targetMonth = targetDate.getMonth();
    const targetDay = targetDate.getDate();
    
    return this.data.orders.some(order => {
      const orderDate = new Date(order.date);
      return orderDate.getFullYear() === targetYear && 
             orderDate.getMonth() === targetMonth && 
             orderDate.getDate() === targetDay;
    });
  },
  
  // 检查是否为今天
  isToday(date) {
    const today = new Date();
    const targetDate = new Date(date);
    
    return today.getFullYear() === targetDate.getFullYear() && 
           today.getMonth() === targetDate.getMonth() && 
           today.getDate() === targetDate.getDate();
  },
  
  // 加载当日菜单
  loadCurrentDayMenu() {
    const { selectedDate, orders } = this.data;
    
    // 查找选中日期的订单
    const selectedDay = new Date(selectedDate);
    const targetOrder = orders.find(order => {
      const orderDate = new Date(order.date);
      return orderDate.getFullYear() === selectedDay.getFullYear() && 
             orderDate.getMonth() === selectedDay.getMonth() && 
             orderDate.getDate() === selectedDay.getDate();
    });
    
    if (targetOrder) {
      this.setData({
        currentDayMenu: {
          breakfast: targetOrder.breakfast || [],
          lunch: targetOrder.lunch || [],
          dinner: targetOrder.dinner || []
        },
        hasDayMenu: true
      });
    } else {
      this.setData({
        currentDayMenu: {
          breakfast: [],
          lunch: [],
          dinner: []
        },
        hasDayMenu: false
      });
    }
  },
  
  // 切换到上个月
  onPrevMonth() {
    let { year, month } = this.data;
    
    if (month === 1) {
      year--;
      month = 12;
    } else {
      month--;
    }
    
    this.setData({
      year,
      month
    });
    
    this.generateCalendarDays();
  },
  
  // 切换到下个月
  onNextMonth() {
    let { year, month } = this.data;
    
    if (month === 12) {
      year++;
      month = 1;
    } else {
      month++;
    }
    
    this.setData({
      year,
      month
    });
    
    this.generateCalendarDays();
  },
  
  // 选择日期
  onDayTap(e) {
    const { date } = e.currentTarget.dataset;
    
    this.setData({
      selectedDate: date
    });
    
    // 更新格式化日期
    this.updateFormatSelectedDate();
    
    this.loadCurrentDayMenu();
  },
  
  // 切换菜单选项卡
  onTabChange(e) {
    this.setData({
      tabValue: e.detail.value
    });
  },
  
  // 跳转到订单详情
  onViewOrderDetail() {
    const { selectedDate } = this.data;
    
    wx.navigateTo({
      url: `/pages/order/detail/index/index?date=${selectedDate}`
    });
  },
  
  // 创建菜单
  onCreateMenu() {
    const { selectedDate } = this.data;
    
    wx.navigateTo({
      url: `/pages/order/index/index?date=${selectedDate}`
    });
  },
  
  // 返回上一页
  onBack() {
    wx.navigateBack();
  }
}); 