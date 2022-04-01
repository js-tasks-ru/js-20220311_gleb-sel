export default class ColumnChart {

  chartHeight = 50;
  containterElements = {};

  constructor(
    {data = [], label = '', link = '', value = 0, formatHeading = data => data} = {}
  ) {
    this.data = data;
    this.label = label;
    this.value = formatHeading(value);
    this.link = link;
    this.render();
  }
  
  getTemplate() {
    return `
    <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
      <div class="column-chart__title">
        Total ${this.label}
        ${this.getLink()}
      </div>
      <div class="column-chart__container">
        <div data-element="header" class="column-chart__header">${this.value}</div>
        <div data-element="body" class="column-chart__chart">
        ${this.getColumnChart()}
        </div>
      </div>
    </div>`;
  }


  render() {
    const element = document.createElement("div"); // (*)
  
    element.innerHTML = this.getTemplate();
    
    // NOTE: в этой строке мы избавляемся от обертки-пустышки в виде `div`
    // который мы создали на строке (*)
    this.element = element.firstElementChild;

    if (this.data.length) {
      this.element.classList.remove('column-chart_loading');
    }

    this.containterElements = this.getSubElements();
  }


  getLink() {
    return this.link ? `<a href="${this.link}" class="column-chart__link">View all</a>` : "";
  }

  getColumnChart() {
    const maxValue = Math.max(...this.data);
    const scale = this.chartHeight / maxValue;
    
    return this.data.map(item => {
      return `
      <div style="--value: ${String(Math.floor(item * scale))}" data-tooltip="${(item / maxValue * 100).toFixed(0) + '%'}"></div>
      `;
    }).join('');
  }
  
  getSubElements() {
    const result = {};
    const columnContainer = this.element.querySelectorAll("[data-element]");

    for (const elementContainer of columnContainer) {
      const name = elementContainer.dataset.element;

      result[name] = elementContainer;
    }
    return result;
  }

  update(data) {
    this.data = data;
    this.containterElements.body.innerHTML = this.getColumnChart();

  }

 
  remove() {
    this.element.remove();
  }
  
  destroy() {
    this.remove();
    this.element = null;
    this.containterElements = {};
    // NOTE: удаляем обработчики событий, если они есть
  }
}
  
// npm run test -- 04-oop-basic-intro-to-dom/1-column-chart/index.spec.js