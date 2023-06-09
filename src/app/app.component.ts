import { Component } from '@angular/core';
import { Firestore,getFirestore, FirestoreModule,enableIndexedDbPersistence, collection,collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public appPages = [
    
    { title: 'Nouvelle observations', url: '/newobs', icon: 'paper-plane' },
    { title: 'Mes observations', url: '/folder/Send', icon: 'paper-plane' },
    //{ title: 'Supprimer mes observations', url: '/folder/Delete', icon: 'trash' },
    { title: 'Déconexion', url: '/login', icon: 'paper-plane' },
    //{ title: 'Inbox', url: '/folder/Inbox', icon: 'mail' },
    //{ title: 'Outbox', url: '/folder/Outbox', icon: 'paper-plane' },
    //{ title: 'Favorites', url: '/folder/Favorites', icon: 'heart' },
    //{ title: 'Archived', url: '/folder/Archived', icon: 'archive' },
    //{ title: 'Trash', url: '/folder/Trash', icon: 'trash' },
    //{ title: 'Spam', url: '/folder/Spam', icon: 'warning' },
  ];
  //public labels = ['Family', 'Friends', 'Notes', 'Work', 'Travel', 'Reminders'];
  constructor(private firestore:Firestore) {
    
    enableIndexedDbPersistence(firestore)
      .then(() => console.log("Offline persistence enabled"))
      .catch(error => {
          switch (error.code) {
              case 'failed-precondition':
                  console.log("Offline persistence already enabled in another tab")
                  break
              case 'unimplemented':
                  console.log("Offline persistence not supported by browser")
                  break
              default:
                  console.error(error)
      }  
    })
    this.initEnums();  
  }
  initEnums(): Observable<Object[]> {
    const enumsRef = collection(this.firestore, 'enums');
    return collectionData(enumsRef, { idField: 'id'}) as Observable<Object[]>;
  }
}
