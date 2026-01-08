import { Component } from '../base/Component';
import { IEvents } from '../base/Events';
import { ensureElement, formatPrice } from '../../utils/utils';

interface IBasketView {
  items: HTMLElement[];
  total: number;
}

export class BasketView extends Component<IBasketView> {
  basketList: HTMLElement;
  basketTotal: HTMLElement;
  basketButton: HTMLButtonElement;

  constructor(protected events: IEvents, container: HTMLElement) {
    super(container);

    this.basketList = ensureElement<HTMLElement>('.basket__list', this.container);
    this.basketTotal = ensureElement<HTMLElement>('.basket__price', this.container);
    this.basketButton = ensureElement<HTMLButtonElement>('.basket__button', this.container);

    this.basketButton.addEventListener('click', () => {
      this.events.emit('basket:order');
    });
  }

  set items(value: HTMLElement[]) {
    this.basketList.replaceChildren(...value);
  }
  set total(value: number) {
    const formattedValue = formatPrice(value);
    this.basketTotal.textContent = `${formattedValue} синапсов`;
  } 
  set disabled(value: boolean) {
    this.basketButton.disabled = value;
  }
}