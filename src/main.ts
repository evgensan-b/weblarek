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
import { ensureElement } from './utils/utils';

const events = new EventEmitter();
const api = new Api(API_URL);
const weblarekAPI = new WebLarekAPI(api);

const header = new Header(events, ensureElement<HTMLElement>('.header'));
const gallery = new Gallery(ensureElement<HTMLElement>('.gallery'));


console.log('ТЕСТИРОВАНИЕ класса Header');
function testHeaderSetters() {
  console.log('Товаров в корзине - 3');
  header.counter = 3;
}

events.on('basket:open', () => {
    console.log('Событие - клик по кнопке корзины');
});

testHeaderSetters();

console.log('ТЕСТИРОВАНИЕ класса Gallery');
function testGallerySetters() {
  console.log('Добавляем карточки в каталог');
  
  const card1 = document.createElement('div');
  card1.textContent = 'Карточка 1';
  
  const card2 = document.createElement('div');
  card2.textContent = 'Карточка 2';
  
  gallery.catalog = [card1, card2];
  
  console.log('Очищаем каталог');
  gallery.catalog = [];
}

testGallerySetters();

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