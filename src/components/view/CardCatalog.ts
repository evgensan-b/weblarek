import { Card } from "./Card";
import { ensureElement } from '../../utils/utils';
import { categoryMap, CDN_URL } from "../../utils/constants";

interface ICardActions {
  onClick: (event: MouseEvent) => void;
}

interface ICardCatalog {
  image: string;
  category: string;
}

export class CardCatalog extends Card<ICardCatalog> {
  cardImage: HTMLImageElement;
  cardCategory: HTMLElement;

  constructor(container: HTMLElement, actions?: ICardActions) {
    super(container);

    this.cardImage = ensureElement<HTMLImageElement>('.card__image', this.container);
    this.cardCategory = ensureElement<HTMLElement>('.card__category', this.container);

    if (actions?.onClick) {
      this.container.addEventListener('click', actions.onClick);
    }
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
}