import { defineStore } from 'pinia';
import SystemService from '@/api/system';
import router from '@/router';

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    userMenus: [],
    permissions: [],
    routes: [],
    sidebarRoutes: [],
    isMenusLoaded: false
  }),
  
  actions: {
    // 获取用户菜单权限
    async getUserMenus() {
      try {
        const res = await SystemService.getUserMenus();
        if (res.code === 0) {
          this.userMenus = res.data || [];
          this.isMenusLoaded = true;
          this.generateRoutes();
          return res.data;
        }
      } catch (error) {
        console.error('获取用户菜单失败', error);
      }
      return [];
    },
    
    // 生成路由
    generateRoutes() {
      // 这里可以根据返回的菜单动态生成路由
      // 由于Vue Router 4中动态路由较复杂，这里只保留思路
      this.sidebarRoutes = this.filterSidebarMenus(this.userMenus);
    },
    
    // 筛选侧边栏菜单
    filterSidebarMenus(menus) {
      return menus.filter(menu => menu.visible !== false);
    },
    
    // 重置权限状态
    resetState() {
      this.userMenus = [];
      this.permissions = [];
      this.routes = [];
      this.sidebarRoutes = [];
      this.isMenusLoaded = false;
    },
  }
}); 