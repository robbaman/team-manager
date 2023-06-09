import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[autofocus]',
  standalone: true
})
export class AutofocusDirective {
  constructor(private host: ElementRef) {}

  ngAfterViewInit() {
    this.host.nativeElement.focus();
  }
}