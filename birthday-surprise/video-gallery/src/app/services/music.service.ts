import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class MusicService {
    private playSignal = signal<boolean>(false);

    // Observable for components to react to
    playState$ = this.playSignal.asReadonly();

    playMusic() {
        this.playSignal.set(true);
    }

    stopMusic() {
        this.playSignal.set(false);
    }
}
