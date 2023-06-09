import { Component, OnInit } from '@angular/core';
import { ActivatedRoute,Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@awesome-cordova-plugins/file-transfer/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { HTTP } from '@awesome-cordova-plugins/http/ngx';
import { LoadingController } from '@ionic/angular';
import { Firestore, collection, collectionData, doc, docData, addDoc, deleteDoc, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { AlertController } from '@ionic/angular';
import { Device } from '@capacitor/device';

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
  constructor(private loadingCtrl: LoadingController,private activatedRoute: ActivatedRoute,
    private sanitizer: DomSanitizer,public http: HTTP,private transfer: FileTransfer,
    private file: File,private firestore: Firestore,public alertController: AlertController, private router:Router) { }

  public observations;

  loadDeviceInfo = async () => {
    const uid = await Device.getId();
    this.uuid = uid.uuid;
    this.getObservations().subscribe(res => {
      this.observations = res;
      //this.cd.detectChanges();
    });
  };

  ngOnInit() {
    this.folder = this.activatedRoute.snapshot.paramMap.get('id');

    this.loadDeviceInfo();
  }
  getObservations(): Observable<Object[]> {
    const observationsRef = collection(this.firestore, 'devices',this.uuid,'observations');
    return collectionData(observationsRef, { idField: 'id'}) as Observable<Object[]>;
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
  public getSanitizeUrl(url : string) {
      return this.sanitizer.bypassSecurityTrustUrl(url);
  }
  async showLoading() {
    this.loading = await this.loadingCtrl.create({
      message: 'Synchronisation...'
    });

    this.loading.present();
    
  }
  showObs(obs) {
    this.router.navigateByUrl('/newobs?uid='+obs);
  }
  //OLD
deletefromList(uid) {
  const updateDb = async () => {
    //RELIRE ET SPLICE
    this.obsArray = [];
    await Preferences.set({
      key: 'obs',
      value: JSON.stringify(this.obsArray),
    });
  };
  updateDb();
}
//OLD
scriptPicture(image,uid,that) {
  //console.log("fil",this.file.checkFile(image.substr(0,image.substr(image.lastIndexOf('/'))),image.substr(image.lastIndexOf('/') + 1)));
    return new Promise(function(resolve, reject) {
      const fileTransfer: FileTransferObject = that.transfer.create();
      fileTransfer.upload(image, encodeURI('http://ns3192284.ip-5-39-73.eu/cetamada/uploadPicture.php'), 
      {fileName:image.substr(image.lastIndexOf('/') + 1)})
      .then((data) => {
        this.deletefromList(uid);
        resolve("ok");
      }, (err) => {
        console.log("err",err);
        resolve("ok");
      })
    }
  )
}


}
