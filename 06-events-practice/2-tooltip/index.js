
class Tooltip {
  static elTooltip;
  static prevTooltip;

  constructor() {

    if (Tooltip.instance) {return Tooltip.instance;}

    this.initialize();
    Tooltip.instance = this;
    this.tooltip = null;
  }
  initialize () {
    document.addEventListener('mouseover', (e) => {
      this.tooltip = e.target.closest(`[data-tooltip]`);

      if (!this.tooltip) {return;}

      Tooltip.elTooltip = this.tooltip.dataset.tooltip;
      this.render();
      
    }, {});

    document.addEventListener('mouseout', (e) => {
      if (Tooltip.prevTooltip) {
        Tooltip.prevTooltip.remove();
        Tooltip.prevTooltip = null;
      }
    });
  }

  render() {
    const element = document.createElement('div');

    
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;

    document.body.append(this.element);

    if (this.tooltip !== null) {
      this.tooltip.addEventListener('mousemove', (e) => {
        this.element.style.left = e.clientX + 'px';
        this.element.style.top = e.clientY + 'px';
      });
    }

    Tooltip.prevTooltip = this.element;
  }

  getTemplate() {
    return `<div class="tooltip">${Tooltip.elTooltip}</div>`;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.tooltip = null;
    this.remove();
    Tooltip.prevTooltip = null;
  }
}

export default Tooltip;

// npm run test -- 06-events-practice/2-tooltip/index.spec.js