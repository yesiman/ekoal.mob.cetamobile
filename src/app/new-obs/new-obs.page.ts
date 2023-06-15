import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { Camera, CameraResultType } from '@capacitor/camera';
import { Preferences } from '@capacitor/preferences';
import { Router,ActivatedRoute } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';
import { Firestore, collection, collectionData, doc, docData,getDoc, addDoc, deleteDoc, updateDoc,DocumentReference } from '@angular/fire/firestore';
import { getStorage, ref, uploadBytes,uploadString } from "firebase/storage";
import { Device } from '@capacitor/device';
import { Observable } from 'rxjs';
import { uploadBytesResumable, getDownloadURL } from '@angular/fire/storage';
import { uploadManager } from '../services/uploadManager.service';
import { datasManager } from '../services/datas.service';
import { GoogleMap, Marker } from '@capacitor/google-maps';
import { CapacitorGoogleMaps } from '@capacitor/google-maps/dist/typings/implementation';
import { IonModal, LoadingController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { OverlayEventDetail } from '@ionic/core/components';
@Component({
  selector: 'app-new-obs',
  templateUrl: './new-obs.page.html',
  styleUrls: ['./new-obs.page.scss'],
})
export class NewObsPage implements OnInit {
  @ViewChild('map')
  @ViewChild(IonModal) modal: IonModal;
  mapRef: ElementRef<HTMLElement>;
  newMap: GoogleMap = null;
  marker:Marker = null;
  selectedPage = "don";
  markersIds = [];
  loading = null;
  name: string;
  private updateMode:boolean = false;
  private uuid = "";
  private obs:any = {};
  private id:number;
  public enums;
  constructor(private router: Router,private firestore: Firestore,private activatedRoute: ActivatedRoute, 
    private uploadmanager:uploadManager, private datasmanager:datasManager,private loadingCtrl: LoadingController) {
    
  }
  ngOnInit() {
    this.obs = {
      dateObs:new Date().toISOString(),
      images:[]
    };
    
    this.uuid = this.datasmanager.getDeviceUid();
    this.enums = this.datasmanager.getEnums();
    this.activatedRoute.queryParams
      .subscribe(params => {
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
        } // { category: "fiction" }
        
      }
    );

  }
  segmentChanged(e) {
    console.log(e);
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
  async createMap() {
    if (this.newMap == null) {
      this.newMap = await GoogleMap.create({
        id: 'my-cool-map',
        element: this.mapRef.nativeElement,
        apiKey: environment.gmapApiKey,
        config: {
          center: {
            lat: 33.6,
            lng: -117.9,
          },
          zoom: 8,
        },
      });
      this.getGeoloc();
    }
    
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
      const coordinates = await Geolocation.getCurrentPosition();
      this.obs.lat = coordinates.coords.latitude;
      this.obs.long = coordinates.coords.longitude;
      
      if (this.marker === null) {
        this.marker = {
          coordinate: {
            lat: this.obs.lat,
            lng: this.obs.long
          },
          draggable:true,
          title:"Ma position"
        }
        this.newMap.setOnMarkerDragListener(async (event) => {
          this.obs.lat = event.latitude;
          this.obs.long = event.longitude;
        });
        this.markersIds.push("marker");
        this.newMap.addMarker(this.marker);
      }
      else {
        
        //console.log(this.markerId);
        
        this.newMap.removeMarker(String(this.markersIds.length-1));
        this.marker = null;
        this.getGeoloc();
      }
      //marker.setDragable();
      this.newMap.setCamera({
        coordinate: {
          lat: Number(this.obs.lat),
          lng: Number(this.obs.long),
        },
        zoom: 12,
        bearing: 0
      });
      this.closeLoading();
    };


    
    

    printCurrentPosition();
  }
  //VALIDATION SAISIE
  valid() { 
    this.obs.uid = uuidv4();
    console.log("this.obs",this.obs);

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
        console.log("curFile is",curFile);
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
      this.router.navigate(['/folder/Inbox'],{replaceUrl: true})
    }else {
      this.router.navigate(['/folder/Inbox'],{replaceUrl: true})
    }
  } 
  showImageEdition() {
    
  }

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  confirm() {
    this.modal.dismiss(this.name, 'confirm');
  }

showModal() {
  this.modal.present();
}

  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm') {
      //this.message = `Hello, ${ev.detail.data}!`;
    }
  }
}
