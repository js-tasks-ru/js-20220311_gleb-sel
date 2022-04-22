import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {

  subElements = {};
  loading = false;
  step = 20;
  start = 1;
  end = this.start + this.step;

  onSortClick = (event) => {
    const column = event.target.closest('[data-sortable=true]');

    if (column) {
      const {id, order} = column.dataset;

      const toggleOrder = {
        asc: 'desc',
        desc: 'asc',
      };

      const newOrder = toggleOrder[order];

      column.dataset.order = newOrder;
      this.sorted = {
        id,
        order: newOrder,
      };
    
      column.append(this.subElements.arrow);

      if (this.isSortLocally) {
        this.sortOnClient(id, newOrder);
      } else {
        this.sortOnServer(id, newOrder);
      }
    }

  }

  onWindowScroll = async () => {
    const { bottom } = this.element.getBoundingClientRect();

    const { id, order } = this.sorted;
    if (bottom < document.documentElement.clientHeight && !this.loading && !this.isSortLocally) {
      this.start = this.end;
      this.end = this.start + this.step;

      this.loading = true;

      const data = await this.loadData(id, order, this.start, this.end);

      this.update(data);

      this.loading = false;
    }
  }

  constructor(header = [], {
    url = "",
    sorted = {
      id: header.find((item) => item.sortable).id,
      order: 'asc'
    },
    isSortLocally = false,
    step = 20,
    start = 1,
    end = start + step,
  } = {}) {
    this.data = [];
    this.headerConfig = header;
    this.sorted = sorted;
    this.start = start;
    this.end = end;
    this.step = step;
    this.isSortLocally = isSortLocally;
    this.url = new URL(url, BACKEND_URL);
    this.render();
  }


  async render() {

    const { id, order } = this.sorted;

    const element = document.createElement('div');

    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;

    this.subElements = this.getSubElements();

    const data = await this.loadData(id, order, this.start, this.end); 
    this.getEmptyPlaceholder(data);
    this.initEventListeners();
  }

  async loadData(id, order, start = this.start, end = this.end) {
    this.url.searchParams.set('_sort', id);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', start);
    this.url.searchParams.set('_end', end);
    
    
    this.element.classList.add('sortable-table__loading');
    this.getStyleLoadingLine();

    const data = await fetchJson(this.url);

    this.element.classList.remove('sortable-table__loading');
    this.getStyleLoadingLine(data);
    return data;

  }

  initEventListeners() {
    this.element.addEventListener('pointerdown', this.onSortClick);
    window.addEventListener('scroll', this.onWindowScroll);

  }

  getStyleLoadingLine = (data = []) => {

    const styleLoading = this.subElements.loading;
    styleLoading.display = data ? 'none' : 'block';
  } 

  update(data) {
    const rows = document.createElement('div');
    this.data = [...this.data, ...data];
    rows.innerHTML = this.getBody(data);
    this.subElements.body.append(...rows.childNodes);
  }

  getTemplate() {
    return `
  <div class="sortable-table">
    ${this.getHeader()}
    ${this.getBody(this.data)}

  <div data-element="loading" class="loading-line sortable-table__loading-line"></div>

    <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
      No products
    </div>
  </div>`;
  }

  getHeader() {
    return `<div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.headerConfig.map((header) => this.getRowHeader(header)).join("")}
      </div>`;
  }

  getRowHeader({id = '', title = '', sortable = false, sortType = null}) {
    const order = this.sorted.id === id ? this.sorted.order : 'asc';
    return `<div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-sortType="${sortType} "data-order="${order}">
    <span>${title}</span>
    ${this.getSortArrow(id)}
  </div>`;
  }

  getSortArrow(id) {
    const isOrderExist = this.sorted.id === id ? this.sorted.order : '';
    return isOrderExist ? `<span data-element="arrow" class="sortable-table__sort-arrow">
    <span class="sort-arrow"></span>
  </span>` : '';
  }


  getBody() {
    return `<div data-element="body" class="sortable-table__body">
    ${this.data.map((product) => (this.getBodyRows(product, product))).join('')}
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
  
  sortOnClient (id, order) {
    const sortedData = this.sort(id, order);
    this.data = sortedData;

    return this.subElements.body.innerHTML = this.getBody();
  }

  async sortOnServer (id, order) {
    const start = 1;
    const end = start + this.step;
    const data = await this.loadData(id, order, start, end);
    this.getEmptyPlaceholder(data);
  }


  getEmptyPlaceholder(data) {
    if (data.length) {
      this.element.classList.remove('sortable-table-empty');
      this.data = data;
      this.subElements.body.innerHTML = this.getBody();
    } else {
      this.element.classList.add('sortable-table-empty');
    }
  }

  sort(id, order) {
    const sortedArr = [...this.data];
    const direction = order === 'asc' ? 1 : -1;
    
    const sortHeader = this.headerConfig.find((item) => item.id === id);
    const { sortType } = sortHeader;


    return sortedArr.sort((a, b) => {
      switch (sortType) {
      case 'number':
        return direction * (a[id] - b[id]);
      case 'string':
        return direction * a[id].localeCompare(b[id], ['en', 'ru']);
      default:
        return direction * (a[id] - b[id]);
      }
    });

  }

  getSubElements() {

    const sortableTable = this.element.querySelectorAll("[data-element]");

    return [...sortableTable].reduce((subElements, subElement) => {
      subElements[subElement.dataset.element] = subElement;

      return subElements;
    }, {});
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.data = null;
    this.remove();
    this.subElements = null;
    document.removeEventListener('scroll', this.onWindwodScroll);
    document.removeEventListener('pointerdown', this.onSortClick);
  }

}


// npm run test -- 07-async-code-fetch-api-part-1/2-sortable-table-v3/index.spec.js