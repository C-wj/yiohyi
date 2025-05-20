import request, { requestByEndpoint } from './request';
import { ApiEndpoints } from './endpoints';

/**
 * 获取首页轮播图数据
 * @returns {Promise} Promise对象
 */
export function getHomeSwipers() {
  return requestByEndpoint('HOME.SWIPERS');
}

/**
 * 获取首页卡片数据
 * @returns {Promise} Promise对象
 */
export function getHomeCards() {
  return requestByEndpoint('HOME.CARDS');
}

/**
 * 获取推荐内容
 * @returns {Promise} Promise对象
 */
export function getRecommended() {
  return requestByEndpoint('HOME.RECOMMENDED');
}

/**
 * 获取应季食材
 * @returns {Promise} Promise对象
 */
export function getSeasonal() {
  return requestByEndpoint('HOME.SEASONAL');
}

/**
 * 兼容性API - 使用传统request方法
 * 这些函数将在过渡期内保留，以便与现有代码兼容
 */

/**
 * 获取首页轮播图数据 - 兼容版
 * @returns {Promise} Promise对象
 */
export function getHomeSwipersCompat() {
  return request('/home/swipers', 'get', {});
}

/**
 * 获取首页卡片数据 - 兼容版
 * @returns {Promise} Promise对象
 */
export function getHomeCardsCompat() {
  return request('/home/cards', 'get', {});
} 