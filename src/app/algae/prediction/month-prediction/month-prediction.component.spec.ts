import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthPredictionComponent } from './month-prediction.component';

describe('MonthPredictionComponent', () => {
  let component: MonthPredictionComponent;
  let fixture: ComponentFixture<MonthPredictionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MonthPredictionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthPredictionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
