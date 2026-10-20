import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WinnerRingComponent } from './winner-ring.component';

describe('WinnerRingComponent', () => {
  let component: WinnerRingComponent;
  let fixture: ComponentFixture<WinnerRingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WinnerRingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WinnerRingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
