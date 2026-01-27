import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Note {
  title?: string;
  text: string;
  image?: string;
  created: number;
  isUserNote?: boolean;
  labels?: string[];
  category?: string;
}

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './notes.html',
  styleUrls: ['./notes.css']
})
export class NotesComponent implements OnInit {
  notes: Note[] = [];
  filteredNotes: Note[] = [];
  isLoading = true;
  error = '';

  // Categories
  activeCategory = 'all';
  categories = [
    { id: 'all', name: 'All', emoji: '📚' },
    { id: 'letters', name: 'Letters', emoji: '💌' },
    { id: 'poems', name: 'Poems', emoji: '🖇️' },
    { id: 'reasons', name: 'Reasons', emoji: '❤️‍🩹' },
    { id: 'notes', name: 'Notes', emoji: '📝' }
  ];

  // New note form
  showForm = false;
  newNote = { title: '', text: '', category: 'notes' };
  isSaving = false;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.loadNotes();
  }

  loadNotes() {
    console.log('NotesComponent ngOnInit - fetching notes...');
    this.http.get<Note[]>('/api/notes').subscribe({
      next: (data) => {
        console.log('Notes API response:', data);
        this.notes = data || [];
        this.filterNotes();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching notes', err);
        this.error = 'Failed to load notes: ' + err.message;
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  setCategory(categoryId: string) {
    this.activeCategory = categoryId;
    this.filterNotes();
  }

  filterNotes() {
    if (this.activeCategory === 'all') {
      this.filteredNotes = this.notes;
    } else {
      this.filteredNotes = this.notes.filter(n => n.category === this.activeCategory);
    }
    this.cdr.detectChanges();
  }

  getCategoryCount(categoryId: string): number {
    if (categoryId === 'all') return this.notes.length;
    return this.notes.filter(n => n.category === categoryId).length;
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.newNote = { title: '', text: '', category: 'notes' };
    }
  }

  saveNote() {
    if (!this.newNote.text.trim()) {
      return;
    }

    this.isSaving = true;
    this.http.post<Note>('/api/notes', this.newNote).subscribe({
      next: (savedNote) => {
        this.notes.unshift(savedNote);
        this.filterNotes();
        this.newNote = { title: '', text: '', category: 'notes' };
        this.showForm = false;
        this.isSaving = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error saving note', err);
        this.isSaving = false;
        this.cdr.detectChanges();
      }
    });
  }
}
