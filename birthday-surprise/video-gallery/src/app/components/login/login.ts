import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MusicService } from '../../services/music.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  password = '';
  error = '';

  // Countdown
  targetDate = new Date('2026-01-30T00:00:00'); // Her birthday!
  days = 0;
  hours = 0;
  minutes = 0;
  seconds = 0;
  showPassword = false;
  timerEnded = false;
  private countdownInterval: any;

  constructor(private router: Router, private cdr: ChangeDetectorRef, private musicService: MusicService) { }

  ngOnInit() {
    this.updateCountdown();
    this.countdownInterval = setInterval(() => {
      this.updateCountdown();
      this.cdr.detectChanges();
    }, 1000);
  }

  ngOnDestroy() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  updateCountdown() {
    const now = new Date().getTime();
    const distance = this.targetDate.getTime() - now;

    if (distance > 0) {
      this.days = Math.floor(distance / (1000 * 60 * 60 * 24));
      this.hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      this.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      this.seconds = Math.floor((distance % (1000 * 60)) / 1000);

      // Show password when <= 10 seconds remaining
      const totalSeconds = distance / 1000;
      this.showPassword = totalSeconds <= 10;
    } else {
      this.days = 0;
      this.hours = 0;
      this.minutes = 0;
      this.seconds = 0;
      this.showPassword = true; // Timer ended, show password
      this.timerEnded = true;
    }
  }

  login() {
    if (this.password.toLowerCase() === 'purplehairbaddie') {
      this.musicService.playMusic();
      this.router.navigate(['/home']);
    } else {
      this.error = 'Wrong password, try again! 💔';
    }
  }
}
