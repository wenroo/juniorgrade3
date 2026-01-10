(function($, Drupal, once) {
  'use strict';

  Drupal.behaviors.typewriter = {
    attach: function(context) {
      once('typewriter', '.typewriter-context', context).forEach(function(element) {
        const wrapper = $(element);
        const placeholder = wrapper.find('.placeholder');
        const dataText = wrapper.data('text');
        
        if (!dataText || !placeholder.length) {
          return;
        }
        
        // Split the data-text by pipe character
        const texts = dataText.split('|').map(text => text.trim());
        let currentIndex = 0;
        
        function typeWriter() {
          const currentText = texts[currentIndex];
          placeholder.html('<span class="typewriter-cursor">|</span>'); 

          // Create GSAP timeline for typing animation
          const tl = gsap.timeline({
            onComplete: function() {
              // Wait 2 seconds before deleting
              gsap.delayedCall(2, deleteText);
            }
          });
          
          // Split text into characters and animate each one
          const chars = currentText.split('');
          let typed = '';
          chars.forEach((char, index) => {
            tl.call(() => {
              typed += char;
              placeholder.html(typed + '<span class="typewriter-cursor">|</span>');
            }, null, index * 0.1);
          });
        }
        
        function deleteText() {
          let currentText = placeholder.text().replace('|', ''); // 移除光标
          const chars = currentText.split('');
          
          // Create GSAP timeline for deleting animation
          const tl = gsap.timeline({
            onComplete: function() {
              // Move to next text and wait before starting
              currentIndex = (currentIndex + 1) % texts.length;
              gsap.delayedCall(0.5, typeWriter);
            }
          });
          
          // Delete each character
          chars.reverse().forEach((char, index) => {
            tl.call(() => {
              currentText = currentText.substring(0, currentText.length - 1);
              placeholder.html(currentText + '<span class="typewriter-cursor">|</span>');
            }, null, index * 0.05);
          });
        }
        
        // Start the typewriter effect
        typeWriter();
      });
    }
  };

})(jQuery, Drupal, once);