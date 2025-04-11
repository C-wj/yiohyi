Component({
  properties: {
    recipe: {
      type: Object,
      value: {}
    }
  },
  
  data: {
    defaultImage: '/static/img_td.png'
  },
  
  methods: {
    // 点击收藏
    onFavoriteTap(e) {
      e.stopPropagation();
      const { id, isFavorite } = this.data.recipe;
      this.triggerEvent('favorite', { id, isFavorite });
    },
    
    // 点击点赞
    onLikeTap(e) {
      e.stopPropagation();
      const { id, isLiked } = this.data.recipe;
      this.triggerEvent('like', { id, isLiked });
    },
    
    // 图片加载失败时使用默认图片
    onImageError() {
      const recipe = this.data.recipe;
      recipe.image = this.data.defaultImage;
      this.setData({ recipe });
    }
  }
}); 