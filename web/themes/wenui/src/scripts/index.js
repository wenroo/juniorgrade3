

(function ($, Drupal, once) {
  "use strict";

/**
 * WEN UI
 */
Drupal.behaviors.wenui = {
  menuMobileStatus: false,
  first: true,
  defaultConfig:{
    breakpoints: {
      'sm':  480,
      'md':  768,
      'lg':  1024,
      'xl':  1280
    }
  },
  attach(context) {
    const self = this;
    
    once('wenui_init', 'body', context).forEach(() => {
      // console.log('UI: wenui_init_once');
      this.config = {
        breakpoints: this.defaultConfig.breakpoints
      } 
      this.inject = {
        screenwidth: window.screen.width,
        screenheight: window.screen.height,
        width: document.body.clientWidth,
        height: document.body.clientHeight,
        mobi: this.isMobile()
      }

    });

  },
  isMobile(){
    return /Android|iPhone|iPad|iPod|BlackBerry|webOS|Windows Phone|SymbianOS|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },
  debounce(func, wait) {
    let timeout;
    return function() {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }
};

})(jQuery, Drupal, once);
