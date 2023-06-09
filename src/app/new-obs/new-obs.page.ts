import { Component, OnInit } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { Camera, CameraResultType } from '@capacitor/camera';
import { Preferences } from '@capacitor/preferences';
import { Router,ActivatedRoute } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';
import { Firestore, collection, collectionData, doc, docData,getDoc, addDoc, deleteDoc, updateDoc,DocumentReference } from '@angular/fire/firestore';
import { getStorage, ref, uploadBytes,uploadString } from "firebase/storage";
import { Device } from '@capacitor/device';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-new-obs',
  templateUrl: './new-obs.page.html',
  styleUrls: ['./new-obs.page.scss'],
})
export class NewObsPage implements OnInit {
  selectedPage = "don";
  private updateMode:boolean = false;
  private uuid = "";
  private obs:any = {};
  private id:number;

  public enums;
  constructor(private router: Router,private firestore: Firestore,private activatedRoute: ActivatedRoute) {
    
  }
  loadDeviceInfo = async () => {
    const uid = await Device.getId();
    this.uuid = uid.uuid;
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
  };
  ngOnInit() {
    this.obs = {
      dateObs:new Date().toISOString()
    };
    this.loadDeviceInfo();
    this.getEnums().subscribe(res => {
      this.enums = res;
      //this.cd.detectChanges();
    });
    
  }

  myFuncEnglish2(lang) {
    console.log('ddd'+lang.value);
    if(lang === 'FR'){
      console.log('function called is french');
    } else {
      console.log('function called is english');
    }
  }

 /*
  dataURLtoFile(dataurl, filename) {
    let arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type: mime});
}
*/
  //AJOUT D'UNE IMAGE/PHOTO
  takePict()  { 
    if (!this.obs.images) {
      this.obs.images = [];
    }
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
      //
      const storage = getStorage();
      const storageRef = ref(storage, 'observations/'+filename+"."+ext)
      fetch(image.webPath)
      .then (res => res.blob()) // Gets the response and returns it as a blob
      .then (blob => {
        uploadBytes(storageRef, blob).then((snapshot) => {
          console.log('Uploaded a blob or file!');
        });
    });

      
    };
    addPict();
  }
  //DETECTION GEOLOCALISATION
  getGeoloc()  { 
    const printCurrentPosition = async () => {
      const coordinates = await Geolocation.getCurrentPosition();
      this.obs.lat = coordinates.coords.latitude;
      this.obs.long = coordinates.coords.longitude;
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

    const notesRef = collection(this.firestore, "devices/"+this.uuid+"/observations/");
    if (this.updateMode == true) {
      //MAJ RECORD
      const docRef = doc(this.firestore, "devices/"+this.uuid+"/observations/"+this.id);
      updateDoc(docRef, this.obs).then(() => {
        // the documentReference provides access to the newly created document
      });
    }else {
      //ADD RECORD
      addDoc(notesRef, this.obs).then((documentReference: DocumentReference) => {
        // the documentReference provides access to the newly created document
      });
    }
    
    

    //ON PART SUR LA LISTE DES OBS
    this.router.navigate(['/folder/Inbox'],{replaceUrl: true})
  };
  getEnums(): Observable<Object[]> {
    const enumsRef = collection(this.firestore, 'enums');
    return collectionData(enumsRef, { idField: '_id'}) as Observable<Object[]>;
  }
}
