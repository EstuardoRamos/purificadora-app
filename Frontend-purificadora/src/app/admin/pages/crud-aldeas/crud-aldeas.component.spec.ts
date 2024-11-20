import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudAldeasComponent } from './crud-aldeas.component';

describe('CrudAldeasComponent', () => {
  let component: CrudAldeasComponent;
  let fixture: ComponentFixture<CrudAldeasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CrudAldeasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrudAldeasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
