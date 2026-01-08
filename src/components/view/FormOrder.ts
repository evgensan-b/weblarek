import { Form } from './Form'
import { TPayment } from '../../types';
import { IEvents } from '../base/Events';
import { ensureAllElements, ensureElement } from '../../utils/utils';

interface IFormOrder {
  payment?: TPayment;
  address?: string;
}

export class FormOrder extends Form<IFormOrder> {
  formOrderButtons: HTMLButtonElement[];
  formAddress: HTMLInputElement;

  constructor(protected events: IEvents, container: HTMLElement) {
    super(events, container);

    this.formOrderButtons = ensureAllElements<HTMLButtonElement>('.button_alt', this.container);
    this.formAddress = ensureElement<HTMLInputElement>('input[name="address"]', this.container);

    this.formOrderButtons.forEach(button => {
      button.addEventListener('click', () => {
        if (button.name) {
          this.events.emit('form:changed', {
            key: 'payment', 
            value: button.name as TPayment
          });
        }
      });
    });
    this.formAddress.addEventListener('input', () => {
      this.events.emit('form:changed', { 
        key: 'address', 
        value: this.formAddress.value 
      });
    });
    this.container.addEventListener('submit', (event) => {
      event.preventDefault();
      this.events.emit('order:submit');
    });
  }

  set payment(value: TPayment) {
    this.formOrderButtons.forEach((button: HTMLButtonElement) => {
      const buttonName = button.name as TPayment;
      if (buttonName == value) {
        button.classList.add('button_alt-active');
      } else {
        button.classList.remove('button_alt-active');
      };
    });
  };
  set address(value: string) {
    this.formAddress.value = value;
  }
}