import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatchNewComponent } from './match-new.component';

describe('MatchNewComponent', () => {
  let component: MatchNewComponent;
  let fixture: ComponentFixture<MatchNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchNewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MatchNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
