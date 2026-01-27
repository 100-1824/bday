import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { HomeComponent } from './components/home/home';
import { NotesComponent } from './components/notes/notes';
import { GalleryComponent } from './components/gallery/gallery';
import { PrivateComponent } from './components/private/private';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'home', component: HomeComponent },
    { path: 'notes', component: NotesComponent },
    { path: 'gallery', component: GalleryComponent },
    { path: 'private', component: PrivateComponent },
];
