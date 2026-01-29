import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import * as L from 'leaflet';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit, AfterViewInit {
  herName = 'Suvi';
  // Islamabad, Pakistan
  yourCityCoords: [number, number] = [33.6844, 73.0479];
  // Bihar, India (Patna)
  herCityCoords: [number, number] = [25.5941, 85.1376];

  // Letter
  isEnvelopeOpen = false;
  showLetterOverlay = false;

  letterContent = `My Beautiful Blessed Suvi,

Happy Birthday my love. This day marks a new milestone in your life and I am very lucky

to be standing beside you on this day please enjoy it celebrate it and make some 

memories that are going to last for a lifetime.

I know suvi I am not perfect I mess up sometimes I am careless sometimes I don't deserve you

but my love for you just keeps increasing day by day and I hope it gets more until I find my 

place in your arms and I promise to be the best version of myself for you because you deserve 

someone who is better who makes you smile which I love so much you beautiful lovely smile btw 

but who just knows how to level up to you look you in the eye and tell you how much you mean to 

them and how much they love and I want to be that someone suvi believe me and you know I am trying.

Khair what matters you stay happy and don't loose that smile whatever happens you know how much that

means to me so celebrate don't be sad you know I got you. 

I pray that all you want is granted to you in ways that astonish you and make you feel more blessed 

than ever. Stay Happy Stay Blessed.

Here's to us, to our journey, and to all the beautiful moments yet to come.

Forever & Always Your Umzy💜`;

  handwrittenText = `Happy birthday love, I know this letter was meant to be in your hands but for what it's worth still happy 25th birthday.
  I know that I am not the perfect guy for you but I want to be the perfect one that keeps you happy and keeps you smiling in every moment of your life no matter what especially in your worst days; that's how much I love you and also if God has other plans and somehow I and you don't end up together after all this love and trying, don't worry about it love because everything happens for a reason and no matter how hard it is we weren't meant to be still we try.

  May this day of yours be filled with joy and happiness that couldn't be explained with words all of your past made you who you are, all of your moments of joy and love and all of your moments about pain and trauma made you you and I am so in love with you, your hair, your smile, your eyes and everything you do, your Carefulness and love for me how did I get so lucky.

  Don't worry about anything love because even not physically I am there for you and you got me. Take Care and I love you byeee.

  with Love ♡
  Your Umair`;

  activeLetterType: 'main' | 'handwritten' = 'main';
  showHandwrittenLetter = false;

  toggleEnvelope(type: 'main' | 'handwritten' = 'main') {
    this.activeLetterType = type;
    this.isEnvelopeOpen = !this.isEnvelopeOpen;

    if (this.isEnvelopeOpen) {
      setTimeout(() => {
        this.showLetterOverlay = true;
        this.cdr.detectChanges();
      }, 800);
    }
  }

  toggleHandwrittenLetter() {
    this.showHandwrittenLetter = !this.showHandwrittenLetter;
    this.cdr.detectChanges();
  }

  // Voice Notes
  playingVoiceNote: number | null = null;
  vn1 = new Audio('assets/audio/vn1.mp4');
  vn2 = new Audio('assets/audio/vn2.mp4');

  toggleVoiceNote(id: number) {
    // Stop any currently playing audio
    this.vn1.pause();
    this.vn2.pause();

    if (this.playingVoiceNote === id) {
      // If clicking the same one, just stop it (already paused above)
      this.playingVoiceNote = null;
    } else {
      // Play the selected one
      const audioToPlay = id === 1 ? this.vn1 : this.vn2;
      const fileName = id === 1 ? 'vn1.mp4' : 'vn2.mp4';

      audioToPlay.currentTime = 0; // Restart from beginning
      audioToPlay.play().catch(e => {
        console.error("Error playing audio:", e);
        alert(`Please place '${fileName}' in 'public/assets/audio/' folder!`);
      });

      this.playingVoiceNote = id;

      audioToPlay.onended = () => {
        this.playingVoiceNote = null;
        this.cdr.detectChanges();
      };
    }
    this.cdr.detectChanges();
  }

  // Reasons I Love You
  reasons = [
    { text: "I love your smile so so so muchhhhh", emoji: "🥺" },
    { text: "I melt when I look at your eyes when you're smiling", emoji: "🥹" },
    { text: "How you believe in us", emoji: "✨" },
    { text: "Your endless love and patience and forgiveness for me", emoji: "😭" },
    { text: "The way you look at me", emoji: "👀" },
    { text: "Our cute and adorable calls", emoji: "📱" },
    { text: "The way you baby me when I am down", emoji: "😓" },
    { text: "How hard you work for us", emoji: "💪" },
    { text: "Your warm huggies and kisses", emoji: "😘" },
    { text: "Just being you", emoji: "💜" }
  ];
  currentReasonIndex = 0;
  isFlipping = false;

  // Confetti pieces for celebration
  confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 3,
    color: ['#FF6B81', '#FFD93D', '#6BCB77', '#4D96FF', '#9C27B0', '#FF9F45'][Math.floor(Math.random() * 6)]
  }));

  // Sparkles for extra magic
  sparkles = Array.from({ length: 15 }, () => ({
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 2
  }));

  private map: any;

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    setTimeout(() => {
      this.showLetterOverlay = true;
      this.cdr.detectChanges();
    }, 1500);
  }

  ngAfterViewInit() {
    this.initMap();
  }

  initMap() {
    const centerLat = (this.yourCityCoords[0] + this.herCityCoords[0]) / 2;
    const centerLng = (this.yourCityCoords[1] + this.herCityCoords[1]) / 2;

    this.map = L.map('map', {
      scrollWheelZoom: false
    }).setView([centerLat, centerLng], 3);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '©OpenStreetMap, ©CartoDB'
    }).addTo(this.map);

    const heartIcon = L.divIcon({
      className: 'heart-marker',
      html: '💜',
      iconSize: [30, 30]
    });

    L.marker(this.yourCityCoords, { icon: heartIcon }).addTo(this.map);
    L.marker(this.herCityCoords, { icon: heartIcon }).addTo(this.map);

    L.polyline([this.yourCityCoords, this.herCityCoords], {
      color: '#9C27B0',
      weight: 3,
      dashArray: '10, 10'
    }).addTo(this.map);
  }



  closeLetterOverlay() {
    this.showLetterOverlay = false;
    this.isEnvelopeOpen = false;
  }

  nextReason() {
    if (!this.isFlipping) {
      this.isFlipping = true;
      setTimeout(() => {
        this.currentReasonIndex = (this.currentReasonIndex + 1) % this.reasons.length;
        this.isFlipping = false;
        this.cdr.detectChanges();
      }, 300);
    }
  }

  prevReason() {
    if (!this.isFlipping) {
      this.isFlipping = true;
      setTimeout(() => {
        this.currentReasonIndex = (this.currentReasonIndex - 1 + this.reasons.length) % this.reasons.length;
        this.isFlipping = false;
        this.cdr.detectChanges();
      }, 300);
    }
  }

  get currentReason() {
    return this.reasons[this.currentReasonIndex];
  }
}
