import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { FlatComponent } from './flat.component';

describe('FlatComponent', () => {
  let component: FlatComponent;
  let fixture: ComponentFixture<FlatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlatComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FlatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
