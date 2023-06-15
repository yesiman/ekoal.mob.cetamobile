import { Component, OnInit } from '@angular/core';
import { ActivatedRoute,Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { datasManager } from '../services/datas.service';
import { Firestore } from '@angular/fire/firestore';
import { deleteDoc, doc } from '@firebase/firestore';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
})

export class FolderPage implements OnInit {
  public folder: string;
  private obsArray:[];
  private loading;
  private uuid = "";
  constructor(private activatedRoute: ActivatedRoute,public alertController: AlertController, private router:Router, private datasmanager:datasManager,private firestore:Firestore ) { }

  public observations;

  loadDeviceInfo = async () => {
    this.uuid = this.datasmanager.getDeviceUid();
    this.observations = this.datasmanager.getObservations();
  };

  ngOnInit() {
    this.folder = this.activatedRoute.snapshot.paramMap.get('id');
    this.loadDeviceInfo();
  }
  

  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Confirmation',
      message: 'Etes vous sur de vouloirs supprimer vos observations?',
      buttons: [
        {
          text: 'Annuler',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            
          },
        },
        {
          text: 'Supprimer',
          handler: () => {
            console.log(this.uuid);
            this.datasmanager.clearUserDatas();
            this.router.navigateByUrl('/menu');
            //Vidage observations firebase
          },
        },
      ],
    });

    await alert.present();
  }

  removeAll() {
    this.presentAlertConfirm();
  }
  showObs(obs) {
    this.router.navigateByUrl('/newobs?uid='+obs);
  }
}
