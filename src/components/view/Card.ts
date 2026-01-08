import { Component } from '../base/Component';
import { ensureElement, formatPrice } from '../../utils/utils';

interface ICard {
  title: string;
  price: number | null;
}

export abstract class Card<T> extends Component<ICard & T> {
  cardTitle: HTMLElement;
  cardPrice: HTMLElement;

  constructor(container: HTMLElement) {
    super(container);

    this.cardTitle = ensureElement<HTMLElement>('.card__title', this.container);
    this.cardPrice = ensureElement<HTMLElement>('.card__price', this.container);
  }

  set title(value: string) {
    this.cardTitle.textContent = value;
  }

  set price(value: number | null) {
    if (value === null) {
      this.cardPrice.textContent = 'Бесценно';
    } else {
      const formattedValue = formatPrice(value);
      this.cardPrice.textContent = `${formattedValue} синапсов`;
    }
  }
}