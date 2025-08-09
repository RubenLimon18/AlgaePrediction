import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnvironmentalDataFormComponent } from './environmental-data-form.component';

describe('EnvironmentalDataFormComponent', () => {
  let component: EnvironmentalDataFormComponent;
  let fixture: ComponentFixture<EnvironmentalDataFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EnvironmentalDataFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnvironmentalDataFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});