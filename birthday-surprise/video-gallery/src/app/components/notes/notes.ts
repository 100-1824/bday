import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api';
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

  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    this.loadNotes();
  }

  loadNotes() {
    console.log('NotesComponent ngOnInit - fetching notes...');
    this.apiService.getNotes().subscribe({
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
    if (!this.newNote.text.trim()) return;

    this.isSaving = true;
    const noteData = {
      ...this.newNote,
      created: Date.now(),
      isUserNote: true
    };

    // Use current time as ID loosely, real backend would assign ID
    const optimisticNote = { ...noteData, id: 'temp-' + Date.now() };
    // Optimization: Add immediately to UI
    this.notes.unshift(optimisticNote);
    this.filterNotes();
    this.showForm = false;
    this.newNote = { title: '', text: '', category: 'notes' };

    this.apiService.addNote(noteData).subscribe({
      next: (savedNote) => {
        // Replace temp note with real one if needed, or just reload
        // converting temp ID to real ID would be better but reloading is safer for now
        this.loadNotes();
        this.isSaving = false;
      },
      error: (err) => {
        console.error('Failed to save note', err);
        alert('Failed to save note: ' + err.message);
        this.isSaving = false;
        // Rollback
        this.notes = this.notes.filter(n => n !== optimisticNote);
        this.filterNotes();
      }
    });
  }

  deleteNote(note: Note, event: Event) {
    event.stopPropagation();
    if (!confirm('Are you sure you want to delete this note?')) return;

    // We need an ID to delete. Assuming the note object has an ID field from the DB.
    // If interface Note doesn't have ID, we might need to update it or cast it.
    const noteId = (note as any)._id || (note as any).id;

    if (!noteId) {
      alert('Cannot delete this note (missing ID).');
      return;
    }

    this.apiService.deleteNote(noteId).subscribe({
      next: () => {
        this.notes = this.notes.filter(n => n !== note);
        this.filterNotes();
      },
      error: (err) => {
        console.error('Failed to delete note', err);
        alert('Failed to delete note');
      }
    });
  }
}
