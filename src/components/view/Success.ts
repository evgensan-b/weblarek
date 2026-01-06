import { Component } from '../base/Component';
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';

interface ISuccess {
  total: number;
}

export class Success extends Component<ISuccess> {
  closeButton: HTMLButtonElement;
  description: HTMLElement;

  constructor(protected events: IEvents, container: HTMLElement) {
    super(container);

    this.closeButton = ensureElement<HTMLButtonElement>('.order-success__close', this.container);
    this.description = ensureElement<HTMLElement>('.order-success__description', this.container);

    this.closeButton.addEventListener('click', () => {
      this.events.emit('modal:close');
    });
  }

  set total(value: number) {
    const formattedValue = value >= 10000 
        ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
        : value.toString();
    this.description.textContent = `Списано ${formattedValue} синапсов`;
  }
}