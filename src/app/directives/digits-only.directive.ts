import { Directive } from '@angular/core';

const NON_DIGIT = /\D/;

@Directive({
  selector: 'input[appDigitsOnly]',
  host: {
    inputmode: 'numeric',
    '(beforeinput)': 'blockNonDigits($event)',
    '(paste)': 'blockNonDigitPaste($event)',
  },
})
export class DigitsOnlyDirective {
  blockNonDigits(event: InputEvent): void {
    if (event.data && NON_DIGIT.test(event.data)) {
      event.preventDefault();
    }
  }

  blockNonDigitPaste(event: ClipboardEvent): void {
    const text = event.clipboardData?.getData('text') ?? '';
    if (NON_DIGIT.test(text)) {
      event.preventDefault();
    }
  }
}