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
import { Card } from './components/view/Card';
import { cloneTemplate, ensureElement } from './utils/utils';
import { CardCatalog } from './components/view/CardCatalog';
import { CardPreview } from './components/view/CardPreview';

const events = new EventEmitter();
const api = new Api(API_URL);
const weblarekAPI = new WebLarekAPI(api);

const header = new Header(events, ensureElement<HTMLElement>('.header'));
const gallery = new Gallery(ensureElement<HTMLElement>('.gallery'));
const modal = new Modal(events, ensureElement<HTMLElement>('#modal-container'));


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

console.log('ТЕСТИРОВАНИЕ класса Modal');

events.on('modal:close', () => {
    modal.close();
    console.log('Событие: клик для закрытия модального окна');
});

function testModal() {
    const testContent = document.createElement('div');
    testContent.innerHTML = '<h2>Тест модального окна</h2><p>Содержимое модального окна</p>';
    
    modal.content = testContent;
    modal.open();
    
    console.log('Модальное окно открыто. Можно его закрыть(клик на кнопку закрытия, клик вне модального окна или нажатием на клавишу Escape)');
}

testModal();

console.log('ТЕСТИРОВАНИЕ класса Success');

setTimeout(() => {
    modal.close();
    
    function testSuccess() {
      console.log('Создаем Success из шаблона #success');
      const successContainer = cloneTemplate<HTMLElement>('#success');
      const success = new Success(events, successContainer);
        
      success.total = 153250;
        
      modal.content = successContainer;
      modal.open();
        
      console.log('Success отображен в модальном окне. Можно его закрыть(клик на кнопку закрытия/"за новыми покупками", клик вне модального окна или нажатием на клавишу Escape)');
    }
    
    testSuccess();
}, 2000);

console.log('ТЕСТИРОВАНИЕ класса Card');

class TestCard extends Card<{}> {
  constructor(container: HTMLElement) {
    super(container);
  }
}

setTimeout(() => {
  modal.close();
    
  function testCard() {
    const cardContainer = cloneTemplate<HTMLElement>('#card-catalog');
    const testCard = new TestCard(cardContainer);
        
    testCard.title = 'Тестовый товар';
    testCard.price = 10000;
        
    setTimeout(() => {
      modal.content = cardContainer;
      modal.open();
      console.log('Карточка открыта в модальном окне');
    }, 1000);
  }
    
  testCard();
}, 6000);

console.log('ТЕСТИРОВАНИЕ класса CardCatalog');

setTimeout(() => {
  modal.close();
    
  function testCardCatalog() {
    const cards = [
      {
        title: 'Товар 1',
        price: 750,
        category: 'софт-скил',
        image: 'product1.jpg'
      },
      {
        title: 'Товар 2', 
        price: 10000,
        category: 'хард-скил',
        image: 'product2.jpg'
      },
      {
        title: 'Бесценный товар',
        price: null,
        category: 'другое',
        image: 'product3.jpg'
      }
    ];
    
    const cardElements: HTMLElement[] = [];
    
    cards.forEach((cardData, index) => {
      const cardContainer = cloneTemplate<HTMLElement>('#card-catalog');
      const cardCatalog = new CardCatalog(cardContainer, {
        onClick: () => {
          console.log(`Событие: клик по карточке ${index + 1}: ${cardData.title}`);
          events.emit('product:open', { id: `test-id-${index}` });
        }
      });
      
      cardCatalog.render(cardData);
      
      cardElements.push(cardContainer);
    });

    gallery.catalog = cardElements;
  }
    
  testCardCatalog();
}, 8000);

console.log('ТЕСТИРОВАНИЕ класса CardPreview');

events.on('product:toggle-cart', () => {
    console.log('Событие: клик по кнопке добавления/удаления из корзины');
});

setTimeout(() => {
  modal.close();
    
  function testCardPreview() {
    const previewContainer = cloneTemplate<HTMLElement>('#card-preview');
    const cardPreview = new CardPreview(events, previewContainer);
        
    cardPreview.title = 'Подробный просмотр товара';
    cardPreview.price = 10000;
    cardPreview.category = 'хард-скил';
    cardPreview.description = 'Подробное описание товара';
    cardPreview.image = 'detail-product.jpg';
        
    cardPreview.buttonText = 'В корзину';
    cardPreview.disabled = false;
        
    modal.content = previewContainer;
    modal.open();
        
    setTimeout(() => {
      cardPreview.disabled = true;
            
      setTimeout(() => {
        cardPreview.disabled = false;
      }, 2000);
    }, 3000);
  }
    
  testCardPreview();
}, 10000);

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