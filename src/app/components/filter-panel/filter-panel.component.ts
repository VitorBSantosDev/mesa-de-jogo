import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, inject, input, signal, viewChild } from '@angular/core';

@Component({
  selector: 'app-filter-panel',
  templateUrl: './filter-panel.component.html',
  styleUrl: './filter-panel.component.css',
  host: {
    '(document:keydown.escape)': 'closeFilters()',
  },
})
export class FilterPanelComponent implements AfterViewInit, OnDestroy {
  private zone = inject(NgZone);

  hasFilters = input(false);

  anchor = viewChild.required<ElementRef<HTMLElement>>('anchor');

  isFloating = signal(false);
  isOpen = signal(false);
  anchorHeight = signal(0);

  private updatePosition = () => {
    const headerBottom = document.querySelector('app-header')?.getBoundingClientRect().bottom ?? 0;
    const box = this.anchor().nativeElement.getBoundingClientRect();
    const isAboveHeader = box.bottom <= headerBottom;

    if (isAboveHeader === this.isFloating()) return;
    if (isAboveHeader) this.anchorHeight.set(box.height);
    this.isFloating.set(isAboveHeader);
    if (!isAboveHeader) this.closeFilters();
  };

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.updatePosition, { passive: true });
      window.addEventListener('resize', this.updatePosition);
    });
    this.updatePosition();
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.updatePosition);
    window.removeEventListener('resize', this.updatePosition);
  }

  toggleFilters(): void {
    this.isOpen.update((isOpen) => !isOpen);
  }

  closeFilters(): void {
    this.isOpen.set(false);
  }
}