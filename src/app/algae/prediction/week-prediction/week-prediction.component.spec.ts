import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeekPredictionComponent } from './week-prediction.component';

describe('WeekPredictionComponent', () => {
  let component: WeekPredictionComponent;
  let fixture: ComponentFixture<WeekPredictionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WeekPredictionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeekPredictionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
