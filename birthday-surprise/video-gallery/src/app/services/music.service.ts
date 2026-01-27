import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class MusicService {
    private playSignal = signal<boolean>(false);

    private showPlayerSignal = signal<boolean>(false);
    showPlayer$ = this.showPlayerSignal.asReadonly();

    // Observable for components to react to
    playState$ = this.playSignal.asReadonly();

    playMusic() {
        this.showPlayerSignal.set(true);
        this.playSignal.set(true);
    }

    stopMusic() {
        this.playSignal.set(false);
    }
}
