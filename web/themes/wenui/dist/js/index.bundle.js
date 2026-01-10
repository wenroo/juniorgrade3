(function($, Drupal2, once2) {
  Drupal2.behaviors.wenui = {
    menuMobileStatus: false,
    first: true,
    defaultConfig: {
      breakpoints: {
        "sm": 480,
        "md": 768,
        "lg": 1024,
        "xl": 1280
      }
    },
    attach(context) {
      once2("wenui_init", "body", context).forEach(() => {
        this.config = {
          breakpoints: this.defaultConfig.breakpoints
        };
        this.inject = {
          screenwidth: window.screen.width,
          screenheight: window.screen.height,
          width: document.body.clientWidth,
          height: document.body.clientHeight,
          mobi: this.isMobile()
        };
      });
    },
    isMobile() {
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
