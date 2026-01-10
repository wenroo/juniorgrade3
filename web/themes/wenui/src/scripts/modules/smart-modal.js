/**
 * Modal Dialog - Supports multiple triggers with the same class
 * const modal = new ModalDialog({
 *   trigger: '.modal-trigger', 
 *   options: [
 *     { value: '1', label: '选择一', current: true },
 *     { value: '2', label: '选择二' }
 *   ],
 *   title: 'Select option',
 *   onSelect: (value,trigger, option, modal) => {
 *     console.log('Selected:', value);
 *     console.log('Triggered by:', trigger);
 *   }
 * });
 */

(function ($, Drupal, once) {
  "use strict";

  class ModalDialog {
    constructor(config = {}) {
        this.config = {
            // 默认配置
            trigger: null,
            title: 'Please select an option',
            options: [],
            closeOnBackdrop: true,
            closeOnEscape: true,
            animation: {
                duration: 300,
                easing: 'ease-out'
            },
            onSelect: null,
            onOpen: null,
            onClose: null,
            ...config
        };

        this.isOpen = false;
        this.currentValue = null;
        this.elements = {};
        
        this.init();
    }

    init() {
        this.validateConfig();
        this.createModal();
        this.bindEvents();
        this.setInitialSelection();
    }

    validateConfig() {
        if (!this.config.trigger) {
            throw new Error('Modal Dialog: trigger selector is required');
        }
        
        if (!this.config.options || this.config.options.length === 0) {
            throw new Error('Modal Dialog: options array is required');
        }

        if (typeof this.config.trigger === 'string') {
            this.elements.triggers = document.querySelectorAll(this.config.trigger);
            this.elements.trigger = this.elements.triggers[0];
        }

        if (!this.elements.triggers || this.elements.triggers.length === 0) {
            throw new Error('Modal Dialog: trigger element(s) not found');
        }
    }

    createModal() {
        // 创建模态框 HTML
        const modalHTML = this.generateModalHTML();
        // 添加到 body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        // 获取元素引用
        this.elements.backdrop = document.getElementById(`modal-backdrop-${this.config.id || 'default'}`);
        this.elements.dialog = document.getElementById(`modal-dialog-${this.config.id || 'default'}`);
        this.elements.closeBtn = this.elements.backdrop.querySelector('.modal-dialog-close');
        this.elements.optionsContainer = this.elements.backdrop.querySelector('.modal-dialog-body');
        
        // 为每个触发器找到对应的选择显示元素
        this.elements.currentSelections = Array.from(this.elements.triggers).map(trigger => 
          trigger.querySelector('.traveler-switcher-current') || trigger
        );
        this.elements.currentSelection = this.elements.currentSelections[0];
    }

    generateModalHTML() {
        const modalId = this.config.id || 'default';
        const optionsHTML = this.config.options.map(option => `
            <button class="modal-option-btn ${option.current ? 'current' : ''}" data-value="${option.value}">${option.label}</button>
        `).join('');

        return `
            <div id="modal-backdrop-${modalId}"  class="modal-backdrop modal hidden"
                style="opacity: 0; transition: opacity ${this.config.animation.duration}ms ${this.config.animation.easing};"
            >
                <div id="modal-dialog-${modalId}" class="modal-dialog" 
                    style="opacity: 0; transform: scale(0.95) translateY(-10px); transition: all ${this.config.animation.duration}ms ${this.config.animation.easing};"
                >
                    <div class="modal-dialog-content">
                        <h2 class="modal-dialog-title">${this.config.title}</h2>
                        <div class="modal-dialog-body">${optionsHTML}</div>
                    </div>
                    <div class="mt-8 flex justify-center modal-dialog-close">
                        <button class="modal-close-button"><span class="visually-hidden">Close</span></button>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        const self = this
        // 触发按钮点击 - 支持多个触发器
        this.elements.triggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                // 设置当前触发器用于回调
                this.currentTrigger = trigger;
                this.open();
            });
        });

        // 关闭按钮点击
        this.elements.closeBtn.addEventListener('click', () => this.close());
        
        if (this.elements.bottomCloseBtn) {
            this.elements.bottomCloseBtn.addEventListener('click', () => this.close());
        }

        // 背景点击关闭
        if (this.config.closeOnBackdrop) {
            this.elements.backdrop.addEventListener('click', (e) => {
                if (e.target === this.elements.backdrop) {
                    this.close();
                }
            });
        }

        // ESC 键关闭
        if (this.config.closeOnEscape) {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.close();
                }
            });
        }

        // 选项点击事件
        this.elements.optionsContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.modal-option-btn');
            if (btn) {
                const value = btn.dataset.value;
                this.selectOption(value);
            }
        });
    }

    setInitialSelection() {
        const currentOption = this.config.options.find(opt => opt.current);
        if (currentOption) {
            this.currentValue = currentOption.value;
            this.updateTriggerText(currentOption.label);
        }
    }

    open() {
        if (this.isOpen) return;
        this.isOpen = true;
        // 显示模态框
        const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;   
        this.elements.backdrop.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${scrollBarWidth}px`;     
        if (this.config.onOpen) {
            this.config.onOpen(this);
        }
        
        requestAnimationFrame(() => {
            this.elements.backdrop.style.opacity = '1';
            this.elements.dialog.style.opacity = '1';
            this.elements.dialog.style.transform = 'scale(1) translateY(0)';
        });
    }

    close() {
        if (!this.isOpen) return;

        this.isOpen = false;
        
        // 添加退出动画
        this.elements.backdrop.style.opacity = '0';
        this.elements.dialog.style.opacity = '0';
        this.elements.dialog.style.transform = 'scale(0.95) translateY(-10px)';
        
        // 动画结束后隐藏
        setTimeout(() => {
            this.elements.backdrop.classList.add('hidden');
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
            // 执行关闭回调
            if (this.config.onClose) {
                this.config.onClose(this);
            }
        }, this.config.animation.duration);
    }

    selectOption(value) {
        const option = this.config.options.find(opt => opt.value === value);
        if (!option) return;

        this.currentValue = value;
        this.updateSelection();
        this.updateTriggerText(option.label);
        
        // 执行选择回调，传递当前触发器信息
        if (this.config.onSelect) {
            this.config.onSelect(value, this.currentTrigger, option, this);
        }
        
        this.close();
    }

    updateSelection() {
        const optionBtns = this.elements.optionsContainer.querySelectorAll('.modal-option-btn');
        
        optionBtns.forEach(btn => {
            const btnValue = btn.dataset.value;
            
            if (btnValue === this.currentValue) {
                btn.className = `modal-option-btn current`;
            } else {
                btn.className = `modal-option-btn`;
            }
        });
    }

    updateTriggerText(text) {
        // 更新所有触发器的文本
        this.elements.currentSelections.forEach(selection => {
            if (selection) {
                const newTextSpan = document.createElement('span');
                newTextSpan.textContent = text;
                newTextSpan.style.position = 'absolute';
                
                const oldText = selection.innerHTML;
                const oldTextSpan = document.createElement('span');
                oldTextSpan.innerHTML = oldText;
                
                // 清空选择器内容并添加新旧文本元素
                selection.innerHTML = '';
                selection.style.position = 'relative';
                selection.style.overflow = 'hidden';
                
                selection.appendChild(oldTextSpan);
                selection.appendChild(newTextSpan);
                
                // 使用GSAP创建动画
                gsap.set(newTextSpan, { y: '100%' });
                
                gsap.timeline()
                    .to(oldTextSpan, {
                        y: '-100%',
                        duration: 0.5,
                        ease: 'power2.inOut'
                    }, 0)
                    .to(newTextSpan, {
                        y: '0%',
                        duration: 0.5,
                        ease: 'power2.inOut',
                        onComplete: () => {
                            // 动画完成后清理
                            selection.innerHTML = text;
                        }
                    }, 0);
            }
        });
    }

    // 公共方法
    getCurrentValue() {
        return this.currentValue;
    }

    setCurrentValue(value) {
        this.selectOption(value);
    }

    // 获取所有触发器元素
    getTriggers() {
        return this.elements.triggers;
    }

    // 获取当前点击的触发器
    getCurrentTrigger() {
        return this.currentTrigger;
    }

    updateOptions(newOptions) {
        this.config.options = newOptions;
        this.elements.optionsContainer.innerHTML = newOptions.map(option => `
            <button class="modal-option-btn ${option.current ? 'current' : ''}" data-value="${option.value}">
                ${option.label}
            </button>
        `).join('');
        
        this.setInitialSelection();
    }

    destroy() {
        if (this.elements.backdrop) {
            this.elements.backdrop.remove();
        }
        document.body.style.overflow = '';
    }
}

  // 快速创建实例
  function createModalDialog(config) {
    return new ModalDialog(config);
  }

  // 默认配置
  const defaultConfig = {
    title: 'Please select an option',
    closeOnBackdrop: true,
    closeOnEscape: true,
    animation: {
      duration: 300,
      easing: 'ease-out'
    }
  };

  // 将 ModalDialog 和 createModalDialog 函数暴露到全局作用域
  window.ModalDialog = ModalDialog;
  window.createModalDialog = createModalDialog;
  window.ModalDialogConfig = defaultConfig;

})(jQuery, Drupal, once);
