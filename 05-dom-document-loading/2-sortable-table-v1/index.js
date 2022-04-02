export default class SortableTable {

  subElements = {};

  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;

    this.render();
  }

  getTemplate() {
    return `
  <div class="sortable-table">
    ${this.getHeader()}
    ${this.getBody()}
  </div>`;
  }


  render() {
    const element = document.createElement('div');

    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;

    this.subElements = this.getSubElements();
  }

  
  getHeader() {
    return `<div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.headerConfig.map((header) => this.getRowHeader(header)).join("")}
      </div>`;
  }

  getRowHeader({id = '', title = '', sortable = false, sortType = null}) {
    return `<div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-sortType="${sortType} "data-order="">
    <span>${title}</span>
    ${this.getSortArrow(sortable)}
  </div>`;
  }

  getSortArrow(sortable = Boolean) {
    return sortable ? `<span data-element="arrow" class="sortable-table__sort-arrow">
    <span class="sort-arrow"></span>
  </span>` : '';
  }

  getBody() {
    return `<div data-element="body" class="sortable-table__body">
      ${this.data.map((product) => (this.getBodyRows(product, product))).join('')    
}
    </div>`;
  }

  getBodyRows({id = ""}, product = {}) {
    return `<a href="/products/${id}" class="sortable-table__row">${this.getBodyRow(product)}</a>`;
  }

  getBodyRow(product = {}) {

    const cells = this.headerConfig.map(({id, template}) => {
      return {
        id, template
      };
    });
    return cells.map(({id, template}) => {
      return template ? template(product[id]) : `<div class="sortable-table__cell">${product[id]}</div>`;
    }).join('');
  }

  sort(fieldValue, orderValue) {
    const sortedArr = [...this.data];
    const allHeaders = this.subElements.header.querySelectorAll(`[data-id]`);
    const actualHeader = this.subElements.header.querySelector(`[data-id=${fieldValue}]`);

    const directions = {
      asc: 1,
      desc: -1
    };
    
    const sortHeader = this.headerConfig.find((item) => item.id === fieldValue);
    const { sortType } = sortHeader;
    const direction = directions[orderValue];

    sortedArr.sort((a, b) => {
      switch (sortType) {
      case 'number':
        return direction * (a[fieldValue] - b[fieldValue]);
      case 'string':
        return direction * a[fieldValue].localeCompare(b[fieldValue], ['ru', 'en-US', 'en-GB']);
      default:
        return direction * (a[fieldValue] - b[fieldValue]);
      }
    });

    this.data = sortedArr;
    allHeaders.forEach((header) => {
      header.dataset.order = '';
    });
    actualHeader.dataset.order = orderValue;
    
    return this.subElements.body.innerHTML = this.getBody();
  }


  getSubElements() {
    const result = {};

    const sortableTable = this.element.querySelectorAll("[data-element]");

    for (const dataElement of sortableTable) {
      const name = dataElement.dataset.element;

      result[name] = dataElement;
    }

    return result;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.data = null;
    this.remove();
    this.subElements = null;
  }

}

// npm run test 05-dom-document-loading/2-sortable-table-v1/index.spec.js