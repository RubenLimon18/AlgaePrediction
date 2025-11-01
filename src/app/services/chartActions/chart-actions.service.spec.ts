import { TestBed } from '@angular/core/testing';

import { ChartActionsService } from './chart-actions.service';

describe('ChartActionsService', () => {
  let service: ChartActionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChartActionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
