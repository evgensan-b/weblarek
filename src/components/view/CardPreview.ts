import { Card } from "./Card";
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';
import { categoryMap, CDN_URL } from "../../utils/constants";

interface ICardPreview {
  image: string;
  category: string;
  description: string;
  buttonText: string;
}

export class CardPreview extends Card<ICardPreview> {
  cardImage: HTMLImageElement;
  cardCategory: HTMLElement;
  cardDescription: HTMLElement;
  cardButton: HTMLButtonElement;

  constructor(protected events: IEvents, container: HTMLElement) {
    super(container);

    this.cardImage = ensureElement<HTMLImageElement>('.card__image', this.container);
    this.cardCategory = ensureElement<HTMLElement>('.card__category', this.container);
    this.cardDescription = ensureElement<HTMLElement>('.card__text', this.container);
    this.cardButton = ensureElement<HTMLButtonElement>('.card__button', this.container);

    this.cardButton.addEventListener('click', () => {
      this.events.emit('product:toggle-cart');
    });
  }

  set image(src: string) {
    this.cardImage.src = `${CDN_URL}/${src}`;
    this.cardImage.alt = this.cardTitle.textContent || 'Изображение товара';
  }
  set category(value: string) {
    this.cardCategory.textContent = value;
    this.cardCategory.className = 'card__category';
    const categoryKey = value as keyof typeof categoryMap;
    const modifier = categoryMap[categoryKey];
    if (modifier) {
      this.cardCategory.classList.add(modifier);
    } else {
      console.warn(`Неизвестная категория: "${value}"`);
    }
  }
  set description(value: string) {
    this.cardDescription.textContent = value;
  }
  set buttonText(value: string) {
    this.cardButton.textContent = value;
  }
  set disabled(value: boolean) {
    this.cardButton.disabled = value;
  }
}