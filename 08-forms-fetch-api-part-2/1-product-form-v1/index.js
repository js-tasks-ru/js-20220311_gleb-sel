import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {

  subElements = {};
  defaultForm = {
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    status: '',
    images: '',
    price: 0,
    discount: 0
  };


  onUploadImage = () => {
    const inputFile = document.createElement('input');

    const {uploadImage, imageListContainer} = this.subElements;

    inputFile.type = 'file';
    inputFile.accept = 'image/*';

    inputFile.addEventListener('change', async () => {
      const [file] = inputFile.files;

      if (file) {

        const formData = new FormData();
        formData.append('image', file);

        uploadImage.disabled = true;
        uploadImage.classList.add('is-loading');

        const responce = await fetchJson('https://api.imgur.com/3/image', {
          method: 'POST',
          body: formData,

          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`
          },

          referrer: ''
        });


        imageListContainer.firstElementChild.append(this.getImage(responce.data.link, file.name));

        uploadImage.disabled = false;
        uploadImage.classList.remove('is-loading');
        
        inputFile.remove();

      }
    });

    // для корректной работы в IE
    inputFile.hidden = true;
    document.body.appendChild(inputFile);
    inputFile.click();
  }


  onDelete = (event) => {
    if ('deleteHandle' in event.target.dataset) {
      event.target.closest('li').remove();
    }
  }

  constructor (productId) {
    this.productId = productId;
  }

  async render () {

    const categoriesPromise = this.loadCategoriesList(); 

    const productsPromise = this.productId ? 
      this.loadProducts(this.productId) : Promise.resolve(this.defaultForm);
    
    const promiseProductsCategories = await Promise.all([categoriesPromise, productsPromise]);

    const [categories, productsResponse] = promiseProductsCategories;
    const [products] = productsResponse;

    this.dataForm = products;
    this.dataCategories = categories;

    const element = document.createElement('div');

    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;

    this.subElements = this.getSubElements();
    console.log(this.subElements);
    this.setData();
    this.initEventListeners();

  }

  async loadCategoriesList() {
    const url = new URL('api/rest/categories', BACKEND_URL);
    url.searchParams.set('_sort', 'weight');
    url.searchParams.set('_refs', 'subcategory');
    return await fetchJson(url);
  }

  async loadProducts(id) {
    const url = new URL('api/rest/products', BACKEND_URL);
    url.searchParams.set('id', id);
    return await fetchJson(url);
  }


  setData() {
    const formData = this.element.querySelector('[data-element="productForm"]');
 
    const allowedFields = Object.keys(this.defaultForm).filter((field) => field !== 'images');

    for (const field of allowedFields) {
      const name = formData.querySelector(`[name="${field}"]`);
      if (name !== null) {
        name.value = this.dataForm[field] || this.defaultForm[field];
      }
    }

    this.getImageContainer();
  }

  getSubElements() {
    // const elements = this.element.querySelectorAll("[data-element]");
    // this.subElements = [...elements].reduce((subElements, subElement) => {
    //   subElement[subElement.dataset.element] = subElement;

    //   return subElements;
    // }, this.subElements);
    // return this.subElements;
    // почему не работала? спросить

    const elements = this.element.querySelectorAll('[data-element]');

    for (const item of elements) {
      this.subElements[item.dataset.element] = item;
    }

    return this.subElements;

  }

  initEventListeners() {
    const {productForm, uploadImage, imageListContainer} = this.subElements;

    imageListContainer.addEventListener('click', this.onDelete);
    uploadImage.addEventListener('click', this.onUploadImage);
  }

  getTemplate() {
    return ` <div class="product-form">
    ${this.getProductForm()}
  </div>`;
  }

  getProductForm() {
    return `<form data-element="productForm" class="form-grid">
      ${this.getFormGroup(this.dataForm)}
      ${this.getFormButtons(this.productId)}
    </form>`;
  }

  getFormGroup() {
    return `
      ${this.getTitle()}
      ${this.getDescription()}
      ${this.getListImageContainer()}
      ${this.getCategories()}
      ${this.getFullPrice()}
      ${this.getQuantity()}
      ${this.getStatus()}
    `;
  }

  getTitle() {
    return `<div class="form-group form-group__half_left">
    <fieldset>
      <label class="form-label">Название товара</label>
      <input required="" type="text" name="title" class="form-control" placeholder="Название товара">
    </fieldset>
  </div>`;
  }

  getDescription() {
    return `<div class="form-group form-group__wide">
    <label class="form-label">Описание</label>
    <textarea required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
  </div>`;
  }

  getListImageContainer() {
    return `
  <div class="form-group form-group__wide" data-element="sortable-list-container">
    <label class="form-label">Фото</label>
    <div data-element="imageListContainer">
    <ul class="sortable-list">
        
    </ul>
    </div>
    <button type="button" name="uploadImage" data-element="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
  </div>
    `;
  }

  getImageContainer() {
    const { imageListContainer } = this.subElements;
    const ul = imageListContainer.firstElementChild;
    const imagesHTML = this.dataForm.images.map((image) => this.getImage(image.url, image.source));
    console.log(imagesHTML.join(''));
    return ul.append(imagesHTML);
  }

  getImage(url, source) {

    const wrapper = document.createElement('div');

    wrapper.innerHTML = `
    <li class="products-edit__imagelist-item sortable-list__item" style="">
    <input type="hidden" name="url" value="${escapeHtml(url)}">
    <input type="hidden" name="source" value="${escapeHtml(source)}">
    <span>
        <img src="icon-grab.svg" data-grab-handle="" alt="grab">
        <img class="sortable-table__cell-img" alt="Image" src="${escapeHtml(url)}">
        <span>${escapeHtml(source)}</span>
    </span>
    <button type="button">
      <img src="icon-trash.svg" data-delete-handle="" alt="delete">
    </button></li>
    `;
    console.log(wrapper.firstElementChild);
    return wrapper.firstElementChild;

  }

  getCategories() {
    return `
    <div class="form-group form-group__half_left">
    <label class="form-label">Категория</label>
    ${this.getFormControl()}
    </div>
    `;
  }
  
  getFormControl() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<select class="form-control" id="subcategory" name="subcategory"></select>`;

    const select = wrapper.firstElementChild;
    for (const category of this.dataCategories) {
      for (const subcategories of category.subcategories) {
        select.append(new Option(`${category.title} > ${subcategories.title}`, subcategories.id));
      }
    }

    return select.outerHTML;
  }

  getFullPrice() {
    return `
    <div class="form-group form-group__half_left form-group__two-col">
    <fieldset>
      <label class="form-label">Цена ($)</label>
      <input required="" type="number" name="price" class="form-control" placeholder="100">
    </fieldset>
    <fieldset>
      <label class="form-label">Скидка ($)</label>
      <input required="" type="number" name="discount" class="form-control" placeholder="0">
    </fieldset>
  </div>
    `;
  }


  getQuantity() {
    return `
    <div class="form-group form-group__part-half">
    <label class="form-label">Количество</label>
    <input required="" type="number" class="form-control" name="quantity" placeholder="1">
  </div>
    `;
  }

  getStatus() {
    return `
    <div class="form-group form-group__part-half">
    <label class="form-label">Статус</label>
    <select class="form-control" name="status">
      <option value="1">Активен</option>
      <option value="0">Неактивен</option>
    </select>
  </div>
    `;
  }

  getFormButtons(productId) {
    return `<div class="form-buttons">
    <button type="submit" name="save" class="button-primary-outline">
      ${productId ? 'Сохранить товар' : 'Добавить'}
    </button>`;
  }

}

