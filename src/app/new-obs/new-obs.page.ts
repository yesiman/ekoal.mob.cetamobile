import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { Camera, CameraResultType } from '@capacitor/camera';
import { Router,ActivatedRoute } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';
import { Firestore, collection, collectionData, doc, docData,getDoc, addDoc, deleteDoc, updateDoc,DocumentReference } from '@angular/fire/firestore';
import { uploadManager } from '../services/uploadManager.service';
import { datasManager } from '../services/datas.service';
import { IonModal, LoadingController, ModalController, Platform } from '@ionic/angular'
import { OverlayEventDetail } from '@ionic/core/components';
import { ModalGmapComponent } from './modal-gmap/modal-gmap.component';
@Component({
  selector: 'app-new-obs',
  templateUrl: './new-obs.page.html',
  styleUrls: ['./new-obs.page.scss'],
})
export class NewObsPage implements OnInit {
  @ViewChild(IonModal) modal: IonModal;
  selectedPage = "don";
  loading = null;
  name: string;
  private updateMode:boolean = false;
  private uuid = "";
  private obs:any = {};
  private imageEdit:any = {};
  private id:number;
  public enums;
  private viaMapPictLink = false;
  isModal = false;
  opacity = "1";
  constructor(private router: Router,private firestore: Firestore,private activatedRoute: ActivatedRoute, 
    private uploadmanager:uploadManager, private datasmanager:datasManager,private loadingCtrl: LoadingController,
    private modalCtrl: ModalController,public platform: Platform) {
    
  }
  ngOnInit() {
    this.obs = {
      dateObs:new Date().toISOString(),
      nbindividus:1,
      images:[]
    };
    
    this.uuid = this.datasmanager.getDeviceUid();
    this.enums = this.datasmanager.getEnums();
    this.activatedRoute.queryParams
      .subscribe(params => {
        if (params.showPict) {
          this.viaMapPictLink = true;
          //ON VA SUR LE SEGMENT PHOTO
          //OUVERTURE PHOTO
          this.takePict();
          //A LA FERMETURE REMETTRE FORMULAIRE
        }
        if (params.uid) {
          const docRef = doc(this.firestore, "devices/"+this.uuid+"/observations/"+params.uid);
          const docSnap = getDoc(docRef).then((doc) => {
            if (doc.exists) {
                this.obs = doc.data();
            }
            this.id = params.uid;
            this.updateMode = true;
        }).catch((error) => {
            console.log("Error getting document:", error);
        })
      }
        else {
          this.getGeoloc();
        } // { category: "fiction" }
        
      }
    );

  }
  segmentChanged(e) {
    /*if (e.detail.value == "loc") {
      setTimeout(() => {
        this.createMap();  
      }, 200);
      
    }*/
    
  }
  async showLoading() {
    
    //this.loading.present();
  }
  async closeLoading() {
    
    //this.loading.dismiss();
  }
  
  //AJOUT D'UNE IMAGE/PHOTO
  takePict()  { 

    const addPict = async () => {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        saveToGallery:true
      });
      
      //
      var filename = uuidv4();
      var ext = image.format;
      this.obs.images.push({
        //url:imageUrl,
        webPath:image.webPath,
        //path:image.path
        //localPath:image.path,
        filename:filename,
        ext:ext
      })
    };
    addPict();
  }
  //DETECTION GEOLOCALISATION
  getGeoloc()  { 
    const printCurrentPosition = async () => {
      /*if (this.loading==null) {
        this.loading = await this.loadingCtrl.create({});
      }*/
      //this.showLoading();
      const coordinates = await Geolocation.getCurrentPosition({enableHighAccuracy:true});
      this.obs.lat = coordinates.coords.latitude;
      this.obs.long = coordinates.coords.longitude;
      
      this.closeLoading();
    };
    printCurrentPosition();
  }
  //VALIDATION SAISIE
  valid() { 
    

    if (this.obs.comments) { this.obs.comments = this.obs.comments.replace(/(["])/g,'&quot;') }
    if (this.obs.observ) { this.obs.observ = this.obs.observ.replace(/(["])/g,'&quot;') }
    if (this.obs.animaux) { this.obs.animaux = this.obs.animaux.replace(/(["])/g,'&quot;') }
    
    if (this.updateMode == true) {
      //MAJ RECORD
      const docRef = doc(this.firestore, "devices/"+this.uuid+"/observations/"+this.id);
      updateDoc(docRef, this.obs).then(() => {
        this.managePicts(this.id);
      });
    }else {
      //ADD RECORD
      this.obs.uid = uuidv4();
      const notesRef = collection(this.firestore, "devices/"+this.uuid+"/observations/");
      addDoc(notesRef, this.obs).then((documentReference: DocumentReference) => {
        this.managePicts(documentReference.id);
      });
    }
  };
  //ENVOI 
  // IMAGES PUIS SAVE OBJ
  managePicts(parentUid) {
    const cacheRef = collection(this.firestore, "devices/"+this.uuid+"/cache/");
    if (this.obs.images && (this.obs.images.length > 0)) {
      for (let reliFiles = 0;reliFiles < this.obs.images.length;reliFiles++) 
      {
        let curFile = this.obs.images[reliFiles];
        if (!curFile.url) {
          let cacheDatas = {
            wPath:curFile.webPath,
            parentUid:parentUid,
            filename:curFile.filename,
            ext:curFile.ext,
          };
          //ajout dans le cache
          addDoc(cacheRef, cacheDatas).then((documentReference: DocumentReference) => {
            this.uploadmanager.upload(cacheDatas);
          });
        } 
      }
      this.router.navigate(['/folder/Inbox'],{replaceUrl: true})
    }else {
      this.router.navigate(['/folder/Inbox'],{replaceUrl: true})
    }
  } 
  showImageEdition() {
    
  }


  //MODAL IMAGE EDITION
  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  confirm() {
    if (this.obs.images && (this.obs.images.length > 0)) {
      for (let reliFiles = 0;reliFiles < this.obs.images.length;reliFiles++) 
      {
        if (this.obs.images[reliFiles].filename == this.imageEdit.filename)
        {
          if (this.imageEdit.titre) { this.obs.images[reliFiles].titre = this.imageEdit.titre; }
          if (this.imageEdit.desc) { this.obs.images[reliFiles].desc = this.imageEdit.desc; }
          break;
        }
      }
    }
    this.modal.dismiss(this.name, 'confirm');
  }

  showModalImgEdit(img) {
    this.imageEdit = {
      webPath:img.webPath,
      filename:img.filename,
      titre:img.titre,
      desc:img.desc,
    };
    this.modal.present();
  }

  async showModalGmap() {

    this.isModal = true;
    this.opacity = (this.platform.is("android")?"0":"1");

    const modal = await this.modalCtrl.create({
      component: ModalGmapComponent,
      cssClass:"gmapCss",
      componentProps: {
        lat:this.obs.lat,
        long:this.obs.long
      },
      backdropDismiss:false
    });

    modal.onDidDismiss().then((modelData) => {
      if (modelData !== null) {
        if (modelData.data != null)
        {
          this.obs.lat = modelData.data.lat;
          this.obs.long = modelData.data.long;
        }
        
      }
      this.isModal = false;
      this.opacity = "1";
    });

    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      //this.message = `Hello, ${data}!`;
    }
  }

  removeImg(img) {
    if (this.obs.images && (this.obs.images.length > 0)) {
      for (let reliFiles = 0;reliFiles < this.obs.images.length;reliFiles++) 
    {
      if (this.obs.images[reliFiles].filename == img.filename)
      {
        this.obs.images.splice(reliFiles,1);
      }
    }
  }
  }

  

  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm') {
      //this.message = `Hello, ${ev.detail.data}!`;
    }
  }
}
