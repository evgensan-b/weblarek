import { Component } from '../base/Component';
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';

export interface IForm {
  error?: string;
  valid?: boolean;
}

export abstract class Form<T> extends Component<IForm & T> {
  formError: HTMLElement;
  formButton: HTMLButtonElement;

  constructor(protected events: IEvents, container: HTMLElement) {
    super(container);

    this.formError = ensureElement<HTMLElement>('.form__errors', this.container);
    this.formButton = ensureElement<HTMLButtonElement>('button[type="submit"]', this.container);

    this.container.addEventListener('submit', (events) => {
      events.preventDefault();
    });
  }

  set error(value: string) {
    this.formError.textContent = value;
  }
  set valid(value: boolean) {
    this.formButton.disabled = !value;
  }
}