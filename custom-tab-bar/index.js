const app = getApp();

Component({
  data: {
    value: '', // 初始值设置为空，避免第一次加载时闪烁
    list: [
      {
        icon: 'home',
        value: 'home',
        label: '社区',
      },
      {
        icon: 'app',
        value: 'my-recipes',
        label: '我的菜谱',
      },
      {
        icon: 'shop',
        value: 'order',
        label: '点菜',
      },
      {
        icon: 'user',
        value: 'my',
        label: '我的',
      },
    ],
  },
  lifetimes: {
    ready() {
      const pages = getCurrentPages();
      const curPage = pages[pages.length - 1];
      
      if (curPage) {
        const route = curPage.route;
        let value = '';
        
        // 根据路由确定当前选中的选项卡
        if (route.includes('pages/home')) {
          value = 'home';
        } else if (route.includes('pages/my-recipes')) {
          value = 'my-recipes';
        } else if (route.includes('pages/order/index')) {
          value = 'order';
        } else if (route.includes('pages/my')) {
          value = 'my';
        }
        
        if (value) {
          this.setData({ value });
        }
      }
    },
  },
  methods: {
    handleChange(e) {
      const { value } = e.detail;
      
      // 根据value跳转到不同的页面
      let url = '';
      
      switch(value) {
        case 'home':
          url = '/pages/home/index';
          break;
        case 'my-recipes':
          url = '/pages/my-recipes/index';
          break;
        case 'order':
          url = '/pages/order/index/index';
          break;
        case 'my':
          url = '/pages/my/index';
          break;
        default:
          url = '/pages/home/index';
      }
      
      wx.switchTab({ url });
    },
  },
});
