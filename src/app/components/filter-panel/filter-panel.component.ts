import { AfterViewInit, Component, ElementRef, OnDestroy, input, signal, viewChild } from '@angular/core';

const HEADER_HEIGHT = 80;

@Component({
  selector: 'app-filter-panel',
  templateUrl: './filter-panel.component.html',
  styleUrl: './filter-panel.component.css',
  host: {
    '(document:keydown.escape)': 'closeFilters()',
  },
})
export class FilterPanelComponent implements AfterViewInit, OnDestroy {
  hasFilters = input(false);

  anchor = viewChild.required<ElementRef<HTMLElement>>('anchor');

  isFloating = signal(false);
  isOpen = signal(false);
  anchorHeight = signal(0);

  private observer?: IntersectionObserver;

  ngAfterViewInit(): void {
    this.observer = new IntersectionObserver(
      ([entry]) => {
        const isAboveHeader = entry.boundingClientRect.bottom <= HEADER_HEIGHT;

        if (isAboveHeader && !this.isFloating()) {
          this.anchorHeight.set(entry.boundingClientRect.height);
        }

        this.isFloating.set(isAboveHeader);
        if (!isAboveHeader) this.closeFilters();
      },
      { rootMargin: `-${HEADER_HEIGHT}px 0px 0px 0px` },
    );

    this.observer.observe(this.anchor().nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  toggleFilters(): void {
    this.isOpen.update((isOpen) => !isOpen);
  }

  closeFilters(): void {
    this.isOpen.set(false);
  }
}