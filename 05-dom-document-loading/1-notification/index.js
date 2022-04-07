export default class NotificationMessage {
  constructor(message = "", {duration = 1000, type = "error"} = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;

    this.render();
  }

  static oldMessage;

  getTemplate() {
    return `
      <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
        <div class="timer"></div>
        <div class="inner-wrapper">
          <div class="notification-header">${this.type}</div>
          ${this.message}
        </div>
      </div>
        `;
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;
  }

  getMessage() {
    return this.message ? `<div class="notification-body"> ${this.message} </div>` : "";
  }

  show(target) {
    
    if (NotificationMessage.oldMessage) {
      NotificationMessage.oldMessage.remove();
    }

    setTimeout(() => this.remove(), this.duration);

    target.after(this.element);
    NotificationMessage.oldMessage = this.element;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    if (this.element) {
      this.remove();
    }
  }
}


// npm run test -- 05-dom-document-loading/1-notification/index.spec.js