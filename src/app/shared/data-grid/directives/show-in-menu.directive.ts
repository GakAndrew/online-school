import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import { Action } from '../models/action.model';

@Directive({
  selector: '[showInMenu]',
  standalone: true,
})
export class ShowInMenuDirective implements OnInit {
  @Input() actions: Action[] = [];

  constructor(public element: ElementRef) {}

  ngOnInit(): void {
    if (!this.showMenu()) {
      this.element.nativeElement.style.display = 'none';
    }
  }

  private showMenu(): boolean {
    return this.actions.some(item => item.showInMenu);
  }
}
