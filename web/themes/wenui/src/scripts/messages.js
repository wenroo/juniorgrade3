/**
 * @file
 * Message template overrides.
 */

((Drupal) => {
  /**
   * Overrides message theme function.
   *
   * @param {object} message
   *   The message object.
   * @param {string} message.text
   *   The message text.
   * @param {object} options
   *   The message context.
   * @param {string} options.type
   *   The message type.
   * @param {string} options.id
   *   ID of the message, for reference.
   *
   * @return {HTMLElement}
   *   A DOM Node.
   */
  Drupal.theme.message = ({ text }, { type, id }) => {
    const messagesTypes = Drupal.Message.getMessageTypeLabels();
    const messageWrapper = document.createElement('div');

    messageWrapper.setAttribute('id',`${id}_message`);
    messageWrapper.setAttribute('class',`messages-wrapper system-messages messages--${type} alert ${type}`);
    messageWrapper.setAttribute('role',type === 'error' || type === 'warning' ? 'alert' : 'status');
    messageWrapper.setAttribute('aria-labelledby', `${id}-title`);
    messageWrapper.setAttribute('data-drupal-message-id', id);
    messageWrapper.setAttribute('data-drupal-message-type', type);

    // <button type="button" class="alert-close" data-dismiss-target="#${id}_message" aria-label="Close">
    // <span class="sr-only">Close</span>
    // <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
    // <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
    // </svg>
    // </button>

    messageWrapper.innerHTML = `
    <div class="container">
      <div class="messages__header"><h2 class="sr-only">${messagesTypes[type]}</h2></div>
      <div class="messages__content text-center">
          ${text}
      </div>
    </div>`;
    return messageWrapper;
  };
})(Drupal);
