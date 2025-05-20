import request from '~/api/request';
import useToastBehavior from '~/behaviors/useToast';

Page({
  behaviors: [useToastBehavior],

  data: {
    isLoad: false,
    personalInfo: {},
    gridList: [
      {
        type: 'all',
        name: '我的菜谱',
        icon: 'heart-filled',
        url: '/pages/my-recipes/my-recipes'
      },
      {
        type: 'favorite',
        name: '我的收藏',
        icon: 'star',
        url: '/pages/my-recipes/favorites'
      },
      {
        type: 'share',
        name: '我的分享',
        icon: 'share',
        url: '/pages/my-recipes/shares'
      },
      {
        type: 'profile',
        name: '个人资料',
        icon: 'user',
        url: '/pages/my-recipes/profile'
      }
    ],
    service: [
      {
        image: '/static/icon_menu.jpg',
        name: '家庭成员',
        url: '/pages/family/members',
      },
      {
        image: '/static/icon_menu.jpg',
        name: '购物清单',
        url: '/pages/shopping/list',
      },
      {
        image: '/static/icon_menu.jpg',
        name: '通知消息',
        url: '/pages/message/message',
      },
      {
        image: '/static/icon_menu.jpg',
        name: '菜谱分享',
        url: '/pages/recipe/share',
      },
    ],
    settingList: [
      {
        icon: 'setting',
        name: '设置',
        url: '/pages/setting/setting',
      },
      {
        icon: 'help',
        name: '帮助中心',
        url: '/pages/setting/help',
      },
      {
        icon: 'info',
        name: '关于我们',
        url: '/pages/setting/about',
      },
    ],
  },

  onLoad() {
    this.getUserInfo();
  },

  onShow() {
    this.getUserInfo();
  },

  async getUserInfo() {
    try {
      const token = wx.getStorageSync('access_token');
      if (!token) {
        this.setData({ isLoad: false });
        return;
      }
      
      const res = await request('/users/profile', 'get');
      if (res.code === 200) {
        this.setData({
          isLoad: true,
          personalInfo: {
            image: res.data.profile.avatar || '/static/avatar_default.png',
            name: res.data.profile.nickname || '用户',
            star: `菜谱 ${res.data.stats.recipe_count || 0}`,
            city: res.data.profile.location || '未设置',
          },
        });
      } else {
        this.setData({ isLoad: false });
        wx.removeStorageSync('access_token');
        wx.removeStorageSync('refresh_token');
      }
    } catch (error) {
      console.error('获取用户信息失败', error);
      this.setData({ isLoad: false });
    }
  },

  onNavigateTo() {
    wx.navigateTo({
      url: '/pages/setting/userInfo',
    });
  },

  onEleClick(e) {
    const { url, type } = e.detail.data;
    
    // 如果未登录且点击需要登录的功能，则跳转到登录页
    if (!this.data.isLoad && type !== 'about' && type !== 'help') {
      this.onLogin();
      return;
    }
    
    if (url) {
      if (type === 'share') {
        wx.navigateTo({
          url,
        });
      } else {
        wx.navigateTo({
          url,
        });
      }
    }
  },

  onLogin() {
    wx.navigateTo({
      url: '/pages/login/login',
    });
  },
});
