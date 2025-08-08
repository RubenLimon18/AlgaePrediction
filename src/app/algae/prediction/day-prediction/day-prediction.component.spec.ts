import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DayPredictionComponent } from './day-prediction.component';

describe('DayPredictionComponent', () => {
  let component: DayPredictionComponent;
  let fixture: ComponentFixture<DayPredictionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DayPredictionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DayPredictionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
