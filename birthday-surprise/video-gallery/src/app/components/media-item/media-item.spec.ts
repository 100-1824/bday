import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaItem } from './media-item';

describe('MediaItem', () => {
  let component: MediaItem;
  let fixture: ComponentFixture<MediaItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MediaItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MediaItem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
