import { Component } from '@angular/core';
import { datasManager } from './services/datas.service';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public appPages = [
    
    { title: 'Nouvelle observation', url: '/newobs', icon: 'add-circle' },
    { title: 'Mes observations', url: '/folder/Send', icon: 'list-circle' },
    { title: 'Carte', url: '/map', icon: 'map' },
    //{ title: 'Déconnexion', url: '/login', icon: 'log-out' },
    //{ title: 'Inbox', url: '/folder/Inbox', icon: 'mail' },
    //{ title: 'Outbox', url: '/folder/Outbox', icon: 'paper-plane' },
    //{ title: 'Favorites', url: '/folder/Favorites', icon: 'heart' },
    //{ title: 'Archived', url: '/folder/Archived', icon: 'archive' },
    //{ title: 'Trash', url: '/folder/Trash', icon: 'trash' },
    //{ title: 'Spam', url: '/folder/Spam', icon: 'warning' },
  ];
  //public labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];
  constructor(private datasmanager:datasManager) {
    this.datasmanager.init();
  }
  
}
