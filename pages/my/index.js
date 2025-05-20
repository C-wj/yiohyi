import request from '~/api/request';
import useToastBehavior from '~/behaviors/useToast';
import { getUserProfile } from '~/api/auth';
import { handleApiResponse, showApiError } from '~/utils/apiUtil';

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
      
      // 先使用本地存储的用户信息进行展示
      const cachedNickname = wx.getStorageSync('userNickname');
      const cachedAvatar = wx.getStorageSync('userAvatar');
      
      if (cachedNickname) {
        this.setData({
          isLoad: true,
          personalInfo: {
            image: cachedAvatar || '/static/avatar_default.png',
            name: cachedNickname,
            star: `菜谱 0`,
            city: '未设置',
          },
        });
      }
      
      // 然后从API获取最新的信息
      const res = await getUserProfile();
      console.log('用户信息响应:', res);
      
      // 使用辅助函数处理响应
      handleApiResponse(res, (userData) => {
        console.log('处理后的用户数据:', userData);
        
        // 获取用户昵称，尝试多种可能的路径
        let nickname = '';
        // 处理嵌套的profile情况 (userData.profile.profile.nickname)
        if (userData.profile && userData.profile.profile && userData.profile.profile.nickname) {
          nickname = userData.profile.profile.nickname;
        }
        // 处理单层profile情况 (userData.profile.nickname)
        else if (userData.profile && userData.profile.nickname) {
          nickname = userData.profile.nickname;
        } 
        // 直接在用户数据根层级的nickname
        else if (userData.nickname) {
          nickname = userData.nickname;
        } 
        // 使用username作为备选
        else if (userData.username) {
          nickname = userData.username;
        } 
        // 使用本地缓存或默认值
        else {
          nickname = cachedNickname || '用户';
        }
        
        // 更新本地存储
        if (nickname && nickname !== '用户') {
          wx.setStorageSync('userNickname', nickname);
        }
        
        const avatar = userData.profile?.avatar || userData.avatar;
        if (avatar) {
          wx.setStorageSync('userAvatar', avatar);
        }
        
        this.setData({
          isLoad: true,
          personalInfo: {
            image: avatar || cachedAvatar || '/static/avatar_default.png',
            name: nickname,
            star: `菜谱 ${userData.stats?.recipe_count || 0}`,
            city: userData.profile?.location || userData.location || '未设置',
          },
        });
      }, (error) => {
        // 错误处理，只在没有缓存的情况下重置登录状态
        if (!cachedNickname) {
          console.error('获取用户信息失败:', error);
          this.setData({ isLoad: false });
          wx.removeStorageSync('access_token');
          wx.removeStorageSync('refresh_token');
        }
      });
    } catch (error) {
      console.error('获取用户信息失败', error);
      // 如果有缓存的昵称，继续显示用户信息
      if (!wx.getStorageSync('userNickname')) {
        this.setData({ isLoad: false });
      }
      showApiError(error);
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
