import { TestBed } from '@angular/core/testing';
import { Match } from './match.service';

describe('Match', () => {
  let service: Match;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Match);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
