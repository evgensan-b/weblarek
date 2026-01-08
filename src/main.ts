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
  const cardPreview = new CardPreview(events, previewElement);

  cardPreview.render(product);

  const isAvailable = product.price !== null;

  if (isAvailable) {
    const isInBasket = basketModel.hasProduct(product.id);
    cardPreview.buttonText = isInBasket ? 'Удалить из корзины' : 'Купить';
    cardPreview.disabled = false;
  } else {
    cardPreview.buttonText = 'Недоступно';
    cardPreview.disabled = true;
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

  const modalContent = document.querySelector('.modal__content');
  const cardPreview = modalContent?.querySelector('.card_full');
  if (cardPreview) {
    const button = cardPreview.querySelector('.card__button');
    if (button) {
      const isInBasket = basketModel.hasProduct(product.id);
      button.textContent = isInBasket ? 'Удалить из корзины' : 'Купить';
    }
  }
});

// Обработка изменения содержимого корзины
events.on('basket:changed', (items: IProduct[]) => {
  header.counter = items.length;

  const modalContent = document.querySelector('.modal__content');
  if (modalContent?.querySelector('.basket')) {
    const basketItems = items.map((item, index) => {
      const card = new CardBasket(cloneTemplate(cardBasketTemplate), {
        onClick: () => events.emit('basket:item-delete', { id: item.id }),
      });

      return card.render({
        ...item,
        index: index + 1,
      });
    });

    const basketList = modalContent.querySelector('.basket__list');
    const basketTotal = modalContent.querySelector('.basket__price');
    const basketButton = modalContent.querySelector('.basket__button');

    if (basketList) basketList.replaceChildren(...basketItems);
    if (basketTotal) basketTotal.textContent = `${basketModel.getTotalPrice()} синапсов`;
    if (basketButton) (basketButton as HTMLButtonElement).disabled = items.length === 0;
  }
});

// Обработка нажатия кнопки открытия корзины
events.on('basket:open', () => {
  const items = basketModel.getItems();
  const basketItems = items.map((item, index) => {
    const card = new CardBasket(cloneTemplate(cardBasketTemplate), {
      onClick: () => events.emit('basket:item-delete', { id: item.id }),
    });
    return card.render({ ...item, index: index + 1 });
  });

  basketView.items = basketItems;
  basketView.total = basketModel.getTotalPrice();
  basketView.disabled = items.length === 0;

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

  modal.content = formOrder.render();
  modal.open();
});

// Обработка изменения данных покупателя
events.on('buyer:changed', (data: IBuyer) => {
  const modalContent = document.querySelector('.modal__content');
  const orderForm = modalContent?.querySelector('form[name="order"]');

  if (orderForm) {
    const cardButton = orderForm.querySelector('button[name="card"]');
    const cashButton = orderForm.querySelector('button[name="cash"]');

    cardButton?.classList.toggle('button_alt-active', data.payment === 'card');
    cashButton?.classList.toggle('button_alt-active', data.payment === 'cash');
  }
});

// Обработка изменения данных в формах
events.on('form:changed', (data: { key: string; value: any }) => {
  buyerModel.setBuyerData({ [data.key]: data.value });

  const modalContent = document.querySelector('.modal__content');
  const errors = buyerModel.validBuyerData();

  const orderForm = modalContent?.querySelector('form[name="order"]');
  if (orderForm) {
    const isOrderValid = !errors.payment && !errors.address;
    const orderErrors = [errors.payment, errors.address]
      .filter(Boolean)
      .join('; ');

    const errorElement = orderForm.querySelector('.form__errors');
    const button = orderForm.querySelector('button[type="submit"]');

    if (errorElement) errorElement.textContent = orderErrors;
    if (button) (button as HTMLButtonElement).disabled = !isOrderValid;
  }

  const contactsForm = modalContent?.querySelector('form[name="contacts"]');
  if (contactsForm) {
    const isContactsValid = !errors.email && !errors.phone;
    const contactsErrors = [errors.email, errors.phone]
      .filter(Boolean)
      .join('; ');

    const errorElement = contactsForm.querySelector('.form__errors');
    const button = contactsForm.querySelector('button[type="submit"]');

    if (errorElement) errorElement.textContent = contactsErrors;
    if (button) (button as HTMLButtonElement).disabled = !isContactsValid;
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

    modal.content = formContacts.render();
  }
});

// Обработка нажатия кнопки оплаты/завершения оформления заказа
events.on('contacts:submit', () => {
  const errors: BuyerValidationErrors = buyerModel.validBuyerData();

  if (!errors.email && !errors.phone && !errors.payment && !errors.address) {
    const orderData: IOrderData = {
      ...buyerModel.getBuyerData(),
      total: basketModel.getTotalPrice(),
      items: basketModel.getItems().map((item) => item.id),
    };

    weblarekAPI
      .orderProducts(orderData)
      .then((response) => {
        success.total = response.total;

        modal.content = success.render();

        basketModel.clear();
        buyerModel.clearBuyerData();
      })
      .catch((error) => {
        console.error('Ошибка оформления заказа:', error);
        const modalContent = document.querySelector('.modal__content');
        const errorElement = modalContent?.querySelector('.form__errors');

        if (errorElement) {
          errorElement.textContent = 'Ошибка оформления заказа';
        }
      });
  } else {
    const contactsErrors = [errors.email, errors.phone]
      .filter(Boolean)
      .join('; ');
    const modalContent = document.querySelector('.modal__content');
    const errorElement = modalContent?.querySelector('.form__errors');

    if (errorElement) {
      errorElement.textContent =
        contactsErrors || 'Заполните все поля корректно';
    }
  }
});

// Обработка закрытия модального окна
events.on('modal:close', () => {
  modal.close();
});

// Обработка нажатия кнопки удаления товара из корзины
events.on('basket:item-delete', (data: { id: string }) => {
  basketModel.removeItem(data.id);
});

// //ТЕСТЫ для проверки работы классов в ПРОЕКТНОЙ РАБОТЕ 9
// const header = new Header(events, ensureElement<HTMLElement>('.header'));
// const gallery = new Gallery(ensureElement<HTMLElement>('.gallery'));
// const modal = new Modal(events, ensureElement<HTMLElement>('#modal-container'));
// console.log('ТЕСТИРОВАНИЕ класса Header');
// function testHeaderSetters() {
//   console.log('Товаров в корзине - 3');
//   header.counter = 3;
// }

// events.on('basket:open', () => {
//     console.log('Событие: клик по кнопке корзины');
// });

// testHeaderSetters();

// console.log('ТЕСТИРОВАНИЕ класса Gallery');
// function testGallerySetters() {
//   console.log('Добавляем карточки в каталог');

//   const card1 = document.createElement('div');
//   card1.textContent = 'Карточка 1';

//   const card2 = document.createElement('div');
//   card2.textContent = 'Карточка 2';

//   gallery.catalog = [card1, card2];

//   console.log('Очищаем каталог');
//   gallery.catalog = [];
// }

// testGallerySetters();

// console.log('ТЕСТИРОВАНИЕ класса Modal');

// events.on('modal:close', () => {
//     modal.close();
//     console.log('Событие: клик для закрытия модального окна');
// });

// function testModal() {
//     const testContent = document.createElement('div');
//     testContent.innerHTML = '<h2>Тест модального окна</h2><p>Содержимое модального окна</p>';

//     modal.content = testContent;
//     modal.open();

//     console.log('Модальное окно открыто. Можно его закрыть(клик на кнопку закрытия, клик вне модального окна или нажатием на клавишу Escape)');
// }

// testModal();

// console.log('ТЕСТИРОВАНИЕ класса Success');

// setTimeout(() => {
//     modal.close();

//     function testSuccess() {
//       console.log('Создаем Success из шаблона #success');
//       const successContainer = cloneTemplate<HTMLElement>('#success');
//       const success = new Success(events, successContainer);

//       success.total = 153250;

//       modal.content = successContainer;
//       modal.open();

//       console.log('Success отображен в модальном окне. Можно его закрыть(клик на кнопку закрытия/"за новыми покупками", клик вне модального окна или нажатием на клавишу Escape)');
//     }

//     testSuccess();
// }, 2000);

// console.log('ТЕСТИРОВАНИЕ класса Card');

// class TestCard extends Card<{}> {
//   constructor(container: HTMLElement) {
//     super(container);
//   }
// }

// setTimeout(() => {
//   modal.close();

//   function testCard() {
//     const cardContainer = cloneTemplate<HTMLElement>('#card-catalog');
//     const testCard = new TestCard(cardContainer);

//     testCard.title = 'Тестовый товар';
//     testCard.price = 10000;

//     setTimeout(() => {
//       modal.content = cardContainer;
//       modal.open();
//       console.log('Карточка открыта в модальном окне');
//     }, 1000);
//   }

//   testCard();
// }, 6000);

// console.log('ТЕСТИРОВАНИЕ класса CardCatalog');

// setTimeout(() => {
//   modal.close();

//   function testCardCatalog() {
//     const cards = [
//       {
//         title: 'Товар 1',
//         price: 750,
//         category: 'софт-скил',
//         image: 'product1.jpg'
//       },
//       {
//         title: 'Товар 2',
//         price: 10000,
//         category: 'хард-скил',
//         image: 'product2.jpg'
//       },
//       {
//         title: 'Бесценный товар',
//         price: null,
//         category: 'другое',
//         image: 'product3.jpg'
//       }
//     ];

//     const cardElements: HTMLElement[] = [];

//     cards.forEach((cardData, index) => {
//       const cardContainer = cloneTemplate<HTMLElement>('#card-catalog');
//       const cardCatalog = new CardCatalog(cardContainer, {
//         onClick: () => {
//           console.log(`Событие: клик по карточке ${index + 1}: ${cardData.title}`);
//           events.emit('product:open', { id: `test-id-${index}` });
//         }
//       });

//       cardCatalog.render(cardData);

//       cardElements.push(cardContainer);
//     });

//     gallery.catalog = cardElements;
//   }

//   testCardCatalog();
// }, 8000);

// console.log('ТЕСТИРОВАНИЕ класса CardPreview');

// events.on('product:toggle-cart', () => {
//     console.log('Событие: клик по кнопке добавления/удаления из корзины');
// });

// setTimeout(() => {
//   modal.close();

//   function testCardPreview() {
//     const previewContainer = cloneTemplate<HTMLElement>('#card-preview');
//     const cardPreview = new CardPreview(events, previewContainer);

//     cardPreview.title = 'Подробный просмотр товара';
//     cardPreview.price = 10000;
//     cardPreview.category = 'хард-скил';
//     cardPreview.description = 'Подробное описание товара';
//     cardPreview.image = 'detail-product.jpg';

//     cardPreview.buttonText = 'В корзину';
//     cardPreview.disabled = false;

//     modal.content = previewContainer;
//     modal.open();

//     setTimeout(() => {
//       cardPreview.disabled = true;

//       setTimeout(() => {
//         cardPreview.disabled = false;
//       }, 2000);
//     }, 3000);
//   }

//   testCardPreview();
// }, 10000);

// console.log('ТЕСТИРОВАНИЕ класса CardBasket');

// events.on('basket:item-delete', () => {
//     console.log('Событие: клик по кнопке удаления товара из корзины');
// });

// setTimeout(() => {
//   modal.close();

//   function testCardBasket() {
//     const basketContainer = cloneTemplate<HTMLElement>('#card-basket');

//     const cardBasket = new CardBasket(basketContainer, {
//       onClick: () => {
//         events.emit('basket:item-delete');
//       }
//     });

//     cardBasket.title = 'Товар в корзине';
//     cardBasket.price = 10000;
//     cardBasket.index = 1;

//     modal.content = basketContainer;
//     modal.open();

//     setTimeout(() => {
//       const button = basketContainer.querySelector('.basket__item-delete');

//       if (button) (button as HTMLButtonElement).click();
//     }, 1000);
//   }

//   testCardBasket();
// }, 13000);

// console.log('ТЕСТИРОВАНИЕ BasketView');

// events.on('basket:order', () => console.log('Событие: клик по кнопке оформления заказа в корзине'));
// events.on('basket:item-delete', () => console.log('Событие: клик по кнопке удаления товара из корзины'));

// setTimeout(() => {
//   modal.close();

//   function testBasket() {
//     const basketContainer = cloneTemplate<HTMLElement>('#basket');
//     const basket = new BasketView(events, basketContainer);

//     const itemContainer = cloneTemplate<HTMLElement>('#card-basket');
//     const cardBasket = new CardBasket(itemContainer, {
//         onClick: () => events.emit('basket:item-delete')
//     });

//     cardBasket.title = 'Тестовый товар';
//     cardBasket.price = 10000;
//     cardBasket.index = 1;

//     basket.items = [itemContainer];
//     basket.total = 10000;
//     basket.disabled = false;

//     modal.content = basketContainer;
//     modal.open();
//   }

//     testBasket();
// }, 15000);

// console.log('ТЕСТИРОВАНИЕ классов Form и FormOrder');

// events.on('form:changed', (data: { key: string, value: any }) => {
//     console.log(`Событие: - ${data.key}: ${data.value}`);
// });

// setTimeout(() => {
//   modal.close();

//   function testFormOrder() {
//     const orderContainer = cloneTemplate<HTMLElement>('#order');
//     const formOrder = new FormOrder(events, orderContainer);

//     formOrder.payment = 'card';
//     // formOrder.payment = 'cash';
//     // formOrder.payment = '';
//     formOrder.address = 'ул. Пушкина, д. 1';
//     formOrder.error = 'Неверный адрес доставки';
//     formOrder.valid = false;
//     // formOrder.valid = true;

//     modal.content = orderContainer;
//     modal.open();
//   }

//     testFormOrder();
// }, 17000);

// console.log('ТЕСТИРОВАНИЕ классов Form и FormContacts');

// events.on('form:changed', (data: { key: string, value: any }) => {
//     console.log(`Событие - ${data.key}: ${data.value}`);
// });

// setTimeout(() => {
//   modal.close();

//   function testFormContacts() {
//     const contactsContainer = cloneTemplate<HTMLElement>('#contacts');
//     const formContacts = new FormContacts(events, contactsContainer);

//     formContacts.email = 'test@example.com';
//     formContacts.phone = '+7 (495) 123-45-67';
//     formContacts.error = 'Неверный email и телефон';
//     formContacts.valid = false;
//     // formContacts.valid = true;

//     modal.content = contactsContainer;
//     modal.open();
//   }

//   testFormContacts();
// }, 19000);

//ТЕСТЫ для проверки работы классов в ПРОЕКТНОЙ РАБОТЕ 8
// const catalog = new ProductCatalog();
// const basket = new Basket();
// const buyer = new Buyer();
// const testId = 'b06cde61-912f-4663-9751-09956c0eed67';
// const api = new Api(API_URL);
// const weblarekAPI = new WebLarekAPI(api);

// console.log('ТЕСТИРОВАНИЕ ProductCatalog');
// catalog.setItems(apiProducts.items);
// console.log('Массив товаров из каталога: ', catalog.getItems());
// console.log('Товар по его id: ', catalog.getProductById(testId));
// catalog.setPreview(apiProducts.items[0]);
// console.log('Товар для подробного отображения: ', catalog.getPreview());

// console.log('ТЕСТИРОВАНИЕ Basket');
// basket.addItem(apiProducts.items[0]);
// basket.addItem(apiProducts.items[1]);
// basket.addItem(apiProducts.items[2]);
// console.log('В корзину добавлены 3 товара');
// console.log('Массив товаров, которые находятся в корзине: ', basket.getItems());
// console.log('Стоимость всех товаров в корзине: ', basket.getTotalPrice());
// console.log('Количество товаров в корзине: ', basket.getCount());
// console.log('Проверка наличия товара в корзине по его id: ', basket.hasProduct(testId));
// basket.removeItem(testId);
// console.log('Удаление товара, полученного в параметре из массива корзины: ', basket.getItems());
// basket.clear();
// console.log('После очистки корзины: ', basket.getItems());

// console.log('ТЕСТИРОВАНИЕ Buyer');
// console.log('Валидация данных покупателя: ', buyer.validBuyerData());
// buyer.setBuyerData({
//   payment: 'cash'
// });
// console.log('Заполнен способ оплаты заказа: ', buyer.getBuyerData());
// buyer.setBuyerData({
//   email: 'example@example.ru',
//   phone: '+79000000000',
//   address: 'г. Москва, улицы Пушкина, дом 1',
// });
// console.log('Получение всех данных покупателя: ', buyer.getBuyerData());
// console.log('Валидация полных данных покупателя: ', buyer.validBuyerData());
// buyer.clearBuyerData();
// console.log('После очистки данных покупателя: ', buyer.getBuyerData());

// console.log('ТЕСТИРОВАНИЕ ЗАПРОСА К СЕРВЕРУ WebLarekAPI');
// weblarekAPI.getProductList()
//   .then(products => {
//     console.log('Каталог товаров с сервера: ', products);
//     catalog.setItems(products);
//     console.log('Каталог обновлён из API: ', catalog.getItems());
//   })
//   .catch(error => {
//     console.error('Ошибка загрузки товаров с сервера: ', error);
//   })
