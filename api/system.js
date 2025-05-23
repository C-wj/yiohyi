import http from '@/utils/http';
import { getApiPath } from './endpoints';

/**
 * 系统管理API服务
 */
const SystemService = {
  // 角色管理
  getRoles() {
    return http.get(getApiPath('SYSTEM.ROLES_LIST'));
  },
  
  createRole(data) {
    return http.post(getApiPath('SYSTEM.ROLE_CREATE'), data);
  },
  
  updateRole(id, data) {
    return http.put(getApiPath('SYSTEM.ROLE_UPDATE', { id }), data);
  },
  
  deleteRole(id) {
    return http.delete(getApiPath('SYSTEM.ROLE_DELETE', { id }));
  },
  
  // 菜单管理
  getMenus() {
    return http.get(getApiPath('SYSTEM.MENUS_LIST'));
  },
  
  getUserMenus() {
    return http.get(getApiPath('SYSTEM.USER_MENUS'));
  },
  
  createMenu(data) {
    return http.post(getApiPath('SYSTEM.MENU_CREATE'), data);
  },
  
  updateMenu(id, data) {
    return http.put(getApiPath('SYSTEM.MENU_UPDATE', { id }), data);
  },
  
  deleteMenu(id) {
    return http.delete(getApiPath('SYSTEM.MENU_DELETE', { id }));
  },
  
  // 字典管理
  getDictionaries() {
    return http.get(getApiPath('SYSTEM.DICT_LIST'));
  },
  
  getDictByCode(code) {
    return http.get(getApiPath('SYSTEM.DICT_DETAIL', { code }));
  },
  
  createDictType(data) {
    return http.post(getApiPath('SYSTEM.DICT_CREATE'), data);
  },
  
  createDictItem(typeCode, data) {
    return http.post(getApiPath('SYSTEM.DICT_ITEM_CREATE', { typeCode }), data);
  },
  
  // 公告管理
  getAnnouncements() {
    return http.get(getApiPath('SYSTEM.ANNOUNCEMENT_LIST'));
  },
  
  createAnnouncement(data) {
    return http.post(getApiPath('SYSTEM.ANNOUNCEMENT_CREATE'), data);
  },
  
  // 系统初始化
  initSystem() {
    return http.post(getApiPath('SYSTEM.INIT'));
  }
};

export default SystemService; 