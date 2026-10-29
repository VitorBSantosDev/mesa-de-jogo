import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MatchCardComponent } from './match-card.component';

describe('MatchCardComponent', () => {
  let component: MatchCardComponent;
  let fixture: ComponentFixture<MatchCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchCardComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(MatchCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('match', {
      id: 1,
      gameId: 1,
      date: '2026-10-01',
      results: [{ playerId: 1, score: 10 }],
    });
    fixture.componentRef.setInput('players', [{ id: 1, name: 'Ana', avatar: 'frodo' }]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
