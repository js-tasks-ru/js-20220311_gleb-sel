import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';
export default class ColumnChart {

  chartHeight = 50;
  containterElements = {};

  constructor(
    {
      url = '', label = '', link = '', range = {}, formatHeading = data => data
    } = {}
  ) {
    this.url = url;
    this.label = label;
    this.range = range;
    this.link = link;
    this.data = {};
    this.formatHeading = formatHeading;
    this.getData(this.range.from, this.range.to);
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
        <div data-element="header" class="column-chart__header">${this.getValue()}</div>
        <div data-element="body" class="column-chart__chart">
        ${this.getColumnChart()}
        </div>
      </div>
    </div>`;
  }


  render() {
    const element = document.createElement("div"); 
    
    element.innerHTML = this.getTemplate();
    
    this.element = element.firstElementChild;

    this.showLoading();

    this.containterElements = this.getSubElements();
  }

  showLoading() {
    return Object.keys(this.data).length ? 
      this.element.classList.remove('column-chart_loading') :
      this.element.classList.add('column-chart_loading');
  }

  getValue() {
    if (Object.keys(this.data).length === 0) {return this.value = 0;}
    this.value = Object.values(this.data).reduce((prevValue, currentValue) => prevValue + currentValue);
    return this.value = this.formatHeading(this.value);
  }

  getLink() {
    return this.link ? `<a href="${this.link}" class="column-chart__link">View all</a>` : "";
  }

  getColumnChart() {
    const data = Object.values(this.data);
    const maxValue = Math.max(...data);
    const scale = this.chartHeight / maxValue;
    return data.map(item => {
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


  getData(from, to) {
    const url = new URL(this.url, BACKEND_URL);
    url.searchParams.append('from', from);
    url.searchParams.append('to', to);
    fetchJson(url).then((result) => {
      this.data = result;
      this.showLoading();
      this.containterElements.header.innerHTML = this.getValue();
      this.containterElements.body.innerHTML = this.getColumnChart();
    });
  }

  update(from, to) {
    this.getData(from, to);
  }

 
  remove() {
    this.element.remove();
  }
  
  destroy() {
    this.remove();
    this.element = null;
    this.containterElements = {};
  }
}


// npm run test -- 07-async-code-fetch-api-part-1/1-column-chart/index.spec.js
