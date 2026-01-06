import { Card } from "./Card";
import { ensureElement } from '../../utils/utils';

interface ICardActions {
  onClick: (event: MouseEvent) => void;
}

interface ICardBasket {
  index: number;
}

export class CardBasket extends Card<ICardBasket> {
  cardIndex: HTMLElement;
  cardButtonBasket: HTMLButtonElement;

  constructor(container: HTMLElement, actions?: ICardActions) {
    super(container);
  
    this.cardIndex = ensureElement<HTMLElement>('.basket__item-index', this.container);
    this.cardButtonBasket = ensureElement<HTMLButtonElement>('.basket__item-delete', this.container);
  
    if (actions?.onClick) {
      this.cardButtonBasket.addEventListener('click', actions.onClick);
    }
  }

  set index(value: number) {
    this.cardIndex.textContent = String(value);
  }
}