import request from '~/api/request';
import useToastBehavior from '~/behaviors/useToast';

Page({
  behaviors: [useToastBehavior],

  data: {
    isLoad: false,
    service: [],
    personalInfo: {},
    gridList: [
      {
        name: '全部发布',
        icon: 'root-list',
        type: 'all',
        url: '',
      },
      {
        name: '审核中',
        icon: 'search',
        type: 'progress',
        url: '',
      },
      {
        name: '已发布',
        icon: 'upload',
        type: 'published',
        url: '',
      },
      {
        name: '草稿箱',
        icon: 'file-copy',
        type: 'draft',
        url: '',
      },
    ],

    settingList: [
      { name: '联系客服', icon: 'service', type: 'service' },
      { name: '设置', icon: 'setting', type: 'setting', url: '/pages/setting/index' },
    ],
  },

  onLoad() {
    this.getServiceList();
  },

  async onShow() {
    const Token = wx.getStorageSync('access_token');
    const personalInfo = await this.getPersonalInfo();

    if (Token) {
      this.setData({
        isLoad: true,
        personalInfo,
      });
    }
  },

  getServiceList() {
    request('/api/getServiceList').then((res) => {
      const { service } = res.data.data;
      this.setData({ service });
    }).catch(err => {
      console.error('获取服务列表失败', err);
      // 使用默认列表
      this.setData({ 
        service: [
          { image: '/static/icon_wx.png', name: '微信', type: 'weixin', url: '' },
          { image: '/static/icon_doc.png', name: '我的菜谱', type: 'recipes', url: '/pages/my-recipes/index' },
          { image: '/static/icon_map.png', name: '购物清单', type: 'shopping', url: '/pages/shopping/list/index' }
        ] 
      });
    });
  },

  async getPersonalInfo() {
    try {
      const response = await request('/users/profile');
      if (response.code >= 200 && response.code < 300) {
        return response.data.data;
      } else {
        // 返回默认用户信息
        return {
          image: '/static/avatar1.png',
          name: '未登录用户',
          gender: 0
        };
      }
    } catch (err) {
      console.error('获取用户信息失败', err);
      // 返回默认用户信息
      return {
        image: '/static/avatar1.png',
        name: '未登录用户',
        gender: 0
      };
    }
  },

  onLogin(e) {
    wx.navigateTo({
      url: '/pages/login/login',
    });
  },

  onNavigateTo() {
    wx.navigateTo({ url: `/pages/my/info-edit/index` });
  },

  onEleClick(e) {
    const { name, url } = e.currentTarget.dataset.data;
    if (url) return;
    this.onShowToast('#t-toast', name);
  },
});
