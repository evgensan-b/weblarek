import './scss/styles.scss';

import { ProductCatalog } from './components/models/ProductCatalog';
import { Basket } from './components/models/Basket';
import { Buyer } from './components/models/Buyer';
import { apiProducts } from './utils/data';
import { API_URL } from './utils/constants';
import { Api } from './components/base/Api';
import { EventEmitter } from './components/base/Events';
import { WebLarekAPI } from './components/services/WebLarekAPI';
import { Header } from './components/view/Header';
import { Gallery } from './components/view/Gallery';
import { Modal } from './components/view/Modal';
import { Success } from './components/view/Success';
import { cloneTemplate, ensureElement } from './utils/utils';
import { CardCatalog } from './components/view/CardCatalog';
import { CardPreview } from './components/view/CardPreview';
import { CardBasket } from './components/view/CardBasket';
import { BasketView } from './components/view/BasketView';
import { FormOrder } from './components/view/FormOrder';
import { FormContacts } from './components/view/FormContacts';
import { IProduct, IOrderData, IBuyer, BuyerValidationErrors } from './types';

const events = new EventEmitter();
const api = new Api(API_URL);
const weblarekAPI = new WebLarekAPI(api);

const catalogModel = new ProductCatalog(events);
const basketModel = new Basket(events);
const buyerModel = new Buyer(events);

const header = new Header(events, ensureElement<HTMLElement>('.header'));
const gallery = new Gallery(ensureElement<HTMLElement>('.gallery'));
const modal = new Modal(events, ensureElement<HTMLElement>('#modal-container'));
const success = new Success(events, cloneTemplate<HTMLElement>('#success'));
const basketView = new BasketView(events, cloneTemplate<HTMLElement>('#basket'));
const formOrder = new FormOrder(events, cloneTemplate<HTMLElement>('#order'));
const formContacts = new FormContacts(events, cloneTemplate<HTMLElement>('#contacts'));

const cardCatalogTemplate = document.getElementById('card-catalog') as HTMLTemplateElement;
const cardPreviewTemplate = document.getElementById('card-preview') as HTMLTemplateElement;
const cardBasketTemplate = document.getElementById('card-basket') as HTMLTemplateElement;

let currentCardPreview: CardPreview | null = null;
let currentForm: 'order' | 'contacts' | null = null;

// Загрузка товаров с сервера
weblarekAPI
  .getProductList()
  .then((products) => {
    catalogModel.setItems(products);
  })
  .catch((error) => {
    console.error('Ошибка загрузки каталога товаров:', error);
    console.warn('Используем локальные данные из apiProducts');
    catalogModel.setItems(apiProducts.items);
  })
  .finally(() => {
    basketModel.clear();
    buyerModel.clearBuyerData();
  });

// Обработка изменения каталога товаров
events.on('catalog:changed', (items: IProduct[]) => {
  const cards = items.map((item) => {
    const card = new CardCatalog(cloneTemplate(cardCatalogTemplate), {
      onClick: () => catalogModel.setPreview(item),
    });

    return card.render(item);
  });

  gallery.catalog = cards;
});

// Обработка выбора товара для детального просмотра
events.on('product:selected', (product: IProduct) => {
  const previewElement = cloneTemplate(cardPreviewTemplate);
  currentCardPreview = new CardPreview(events, previewElement);

  currentCardPreview.render(product);

  const isAvailable = product.price !== null;

  if (isAvailable) {
    const isInBasket = basketModel.hasProduct(product.id);
    currentCardPreview.buttonText = isInBasket ? 'Удалить из корзины' : 'Купить';
    currentCardPreview.disabled = false;
  } else {
    currentCardPreview.buttonText = 'Недоступно';
    currentCardPreview.disabled = true;
  }

  modal.content = previewElement;
  modal.open();
});

// Обработка нажатия кнопки покупки товара
events.on('product:toggle-cart', () => {
  const product = catalogModel.getPreview();
  if (!product || product.price === null) return;

  if (basketModel.hasProduct(product.id)) {
    basketModel.removeItem(product.id);
  } else {
    basketModel.addItem(product);
  }

  if (currentCardPreview) {
    const isInBasket = basketModel.hasProduct(product.id);
    currentCardPreview.buttonText = isInBasket ? 'Удалить из корзины' : 'Купить';
  }
});

// Обработка изменения содержимого корзины
events.on('basket:changed', () => {
  header.counter = basketModel.getCount();

  const items = basketModel.getItems().map((item, index) => {
    const card = new CardBasket(cloneTemplate(cardBasketTemplate), {
      onClick: () => events.emit('basket:item-delete', { id: item.id }),
    });

    return card.render({
      ...item,
      index: index + 1,
    });
  });

  basketView.items = items;
  basketView.total = basketModel.getTotalPrice();
  basketView.disabled = basketModel.getCount() === 0;
});

// Обработка нажатия кнопки открытия корзины
events.on('basket:open', () => {
  modal.content = basketView.render();
  modal.open();
});

// Обработка нажатия кнопки оформления заказа
events.on('basket:order', () => {
  const buyerData = buyerModel.getBuyerData();
  formOrder.payment = buyerData.payment;
  formOrder.address = buyerData.address;
  formOrder.error = '';

  const errors = buyerModel.validBuyerData();
  formOrder.valid = !errors.payment && !errors.address;

  currentForm = 'order';
  modal.content = formOrder.render();
  modal.open();
});

// Обработка изменения данных покупателя
events.on('buyer:changed', (data: IBuyer) => {
  if (currentForm === 'order') {
    formOrder.payment = data.payment;
  } else if (currentForm === 'contacts') {
    formContacts.email = data.email;
    formContacts.phone = data.phone;
  }
});

// Обработка изменения данных в формах
events.on('form:changed', (data: { key: string; value: any }) => {
  buyerModel.setBuyerData({ [data.key]: data.value });
  const errors = buyerModel.validBuyerData();

  if (currentForm === 'order') {
    const orderErrors = [errors.payment, errors.address]
      .filter(Boolean)
      .join('; ');
    formOrder.error = orderErrors;
    formOrder.valid = !errors.payment && !errors.address;
  } else if (currentForm === 'contacts') {
    const contactsErrors = [errors.email, errors.phone]
      .filter(Boolean)
      .join('; ');
    formContacts.error = contactsErrors;
    formContacts.valid = !errors.email && !errors.phone;
  }
});

// Обработка нажатиея кнопки перехода ко второй форме оформления заказа
events.on('order:submit', () => {
  const errors = buyerModel.validBuyerData();

  if (!errors.payment && !errors.address) {
    const buyerData = buyerModel.getBuyerData();
    formContacts.email = buyerData.email;
    formContacts.phone = buyerData.phone;
    formContacts.error = '';
    formContacts.valid = !errors.email && !errors.phone;

    currentForm = 'contacts';
    modal.content = formContacts.render();
  }
});

// Обработка нажатия кнопки оплаты/завершения оформления заказа
events.on('contacts:submit', () => {
  const errors: BuyerValidationErrors = buyerModel.validBuyerData();

  const hasErrors =
    errors.email || errors.phone || errors.payment || errors.address;
  if (hasErrors) {
    const allErrors = Object.values(errors).filter(Boolean).join('; ');
    if (allErrors) {
      formContacts.error = allErrors;
    }

    return;
  }

  const orderData: IOrderData = {
    ...buyerModel.getBuyerData(),
    total: basketModel.getTotalPrice(),
    items: basketModel.getItems().map((item) => item.id),
  };

  weblarekAPI
    .orderProducts(orderData)
    .then((response) => {
      success.total = response.total;
      currentForm = null;
      modal.content = success.render();

      basketModel.clear();
      buyerModel.clearBuyerData();
    })
    .catch((error) => {
      console.error('Ошибка оформления заказа:', error);
      formContacts.error = 'Ошибка оформления заказа';
    });
});

// Обработка закрытия модального окна
events.on('modal:close', () => {
  currentForm = null;
  modal.close();
});

// Обработка нажатия кнопки удаления товара из корзины
events.on('basket:item-delete', (data: { id: string }) => {
  basketModel.removeItem(data.id);
});
