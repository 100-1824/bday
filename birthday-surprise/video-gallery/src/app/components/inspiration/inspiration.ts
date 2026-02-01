import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-inspiration',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './inspiration.html',
    styleUrls: ['./inspiration.css']
})
export class InspirationComponent implements OnInit {
    activeTab: 'vision' | 'birthday' = 'vision';

    visionBoards: any[] = [];
    birthdayVerses: any[] = [];
    isLoading = true;

    // Forms
    showBoardForm = false;
    showVerseForm = false;
    newBoard = { title: '', image: '', placeholderColor: '#E1BEE7' };
    newVerse = { ref: '', text: '', theme: '' };

    constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) { }

    ngOnInit() {
        this.loadData();
    }

    loadData() {
        this.isLoading = true;
        // In a real app, we'd use forkJoin, but for simplicity here:
        this.apiService.getVisionBoards().subscribe(boards => {
            this.visionBoards = boards || [];
            this.cdr.detectChanges();
        });

        this.apiService.getVerses().subscribe(verses => {
            this.birthdayVerses = verses || [];
            this.isLoading = false;
            this.cdr.detectChanges();
        });
    }

    setActiveTab(tab: 'vision' | 'birthday') {
        this.activeTab = tab;
    }

    // Vision Board CRUD
    toggleBoardForm() {
        this.showBoardForm = !this.showBoardForm;
    }

    addBoard() {
        if (!this.newBoard.title) return;
        this.apiService.addVisionBoard({ ...this.newBoard, id: Date.now() }).subscribe(() => {
            this.loadData();
            this.newBoard = { title: '', image: '', placeholderColor: '#E1BEE7' };
            this.showBoardForm = false;
        });
    }

    deleteBoard(board: any, event: Event) {
        event.stopPropagation();
        if (!confirm('Delete this vision board?')) return;
        this.apiService.deleteVisionBoard(board.id).subscribe(() => {
            this.visionBoards = this.visionBoards.filter(b => b.id !== board.id);
            this.cdr.detectChanges();
        });
    }

    // Verse CRUD
    toggleVerseForm() {
        this.showVerseForm = !this.showVerseForm;
    }

    addVerse() {
        if (!this.newVerse.text) return;
        this.apiService.addVerse(this.newVerse).subscribe(() => {
            this.loadData();
            this.newVerse = { ref: '', text: '', theme: '' };
            this.showVerseForm = false;
        });
    }

    deleteVerse(verse: any, event: Event) {
        event.stopPropagation();
        if (!confirm('Delete this verse?')) return;
        this.apiService.deleteVerse(verse.ref).subscribe(() => {
            this.birthdayVerses = this.birthdayVerses.filter(v => v.ref !== verse.ref);
            this.cdr.detectChanges();
        });
    }
}
