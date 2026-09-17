import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeatureWebsocket } from './feature-websocket';

describe('FeatureWebsocket', () => {
  let component: FeatureWebsocket;
  let fixture: ComponentFixture<FeatureWebsocket>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureWebsocket],
    }).compileComponents();

    fixture = TestBed.createComponent(FeatureWebsocket);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
