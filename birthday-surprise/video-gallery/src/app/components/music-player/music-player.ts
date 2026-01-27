import { Component, ElementRef, ViewChild, AfterViewInit, inject, DestroyRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MusicService } from '../../services/music.service';

@Component({
    selector: 'app-music-player',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './music-player.html',
    styleUrls: ['./music-player.css']
})
export class MusicPlayerComponent implements AfterViewInit {
    @ViewChild('audioPlayer') audioPlayerRef!: ElementRef<HTMLAudioElement>;
    protected musicService = inject(MusicService);

    isPlaying = false;
    isMinimized = false;
    musicSource = '/assets/music.mp3'; // Absolute path to ensure it works on all routes
    volume = 0.5;

    constructor() {
        effect(() => {
            if (this.musicService.playState$()) {
                this.playAudio();
            }
        });
    }

    ngAfterViewInit() {
        if (this.audioPlayerRef) {
            this.audioPlayerRef.nativeElement.volume = this.volume;
        }
    }

    togglePlay() {
        if (this.isPlaying) {
            this.pauseAudio();
        } else {
            this.playAudio();
        }
    }

    playAudio() {
        const audio = this.audioPlayerRef.nativeElement;
        audio.play().then(() => {
            this.isPlaying = true;
        }).catch(error => {
            console.error("Audio playback failed:", error);
            // Only alert if it was a user click, or handle gracefully
        });
    }

    pauseAudio() {
        const audio = this.audioPlayerRef.nativeElement;
        audio.pause();
        this.isPlaying = false;
    }

    toggleMinimize() {
        this.isMinimized = !this.isMinimized;
    }
}
