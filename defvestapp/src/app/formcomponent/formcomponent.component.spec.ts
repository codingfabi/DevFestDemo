import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormcomponentComponent } from './formcomponent.component';

describe('FormcomponentComponent', () => {
  let component: FormcomponentComponent;
  let fixture: ComponentFixture<FormcomponentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormcomponentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormcomponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
