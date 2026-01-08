import { Form } from './Form'
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';


interface IFormContacts {
  email?: string;
  phone?: string;
}

export class FormContacts extends Form<IFormContacts> {
  formEmail: HTMLInputElement;
  formPhone: HTMLInputElement;

  constructor(protected events: IEvents, container: HTMLElement) {
    super(events, container);

    this.formEmail = ensureElement<HTMLInputElement>('input[name="email"]', this.container);
    this.formPhone = ensureElement<HTMLInputElement>('input[name="phone"]', this.container);

    this.formEmail.addEventListener('input', () => {
      this.events.emit('form:changed', { 
        key: 'email', 
        value: this.formEmail.value 
      });
    });
    this.formPhone.addEventListener('input', () => {
      this.events.emit('form:changed', { 
        key: 'phone', 
        value: this.formPhone.value 
      });
    });
    this.container.addEventListener('submit', (event) => {
      event.preventDefault();
      this.events.emit('contacts:submit');
    });
  }

  set email(value: string) {
    this.formEmail.value = value;
  }
  set phone(value: string) {
    this.formPhone.value = value;
  }
}