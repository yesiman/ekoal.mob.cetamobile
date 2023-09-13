import { Injectable } from '@angular/core';
import { CollectionReference, Firestore, collection, collectionData, deleteDoc,doc, enableIndexedDbPersistence, getDoc, getDocs, query, queryEqual, updateDoc, where } from '@angular/fire/firestore';
import { FirebaseStorage, getDownloadURL, getStorage, ref, uploadBytesResumable } from '@angular/fire/storage';
import { Device } from '@capacitor/device';
import { Observable } from 'rxjs';
import { SplashScreen } from '@capacitor/splash-screen';

@Injectable({
  providedIn: 'root',
})
export class datasManager {
    private deviceUid:string;
    //
    private enums;
    private espece = [];
    private determination = [];
    private sexe = [];
    private ouinon = [];
    private decomposition = [];
    private actions = [];
    private circonstances = [];
    private regions = [];
    private districts = [];
    private commmunes = [];
    //
    private observations;
    constructor(private firestore: Firestore) {
      
    }
    init() {
      enableIndexedDbPersistence(this.firestore)
        .then(() => { 
          //this.espece = this.determination = this.sexe = this.ouinon = this.decomposition = this.actions = this.circonstances = this.regions = this.districts =  this.commmunes = [];
          this.loadDeviceInfos();
        })
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
    }
    loadDeviceInfos = async () => {
       Device.getId().then((val) => {
        this.deviceUid = val.uuid;
        var promises = [];
        promises.push(new Promise((resolve,reject) => {
          this.getEnumsRef().subscribe(res => {
            this.enums = res
            this.espece = [];
            this.determination = [];
            this.sexe = [];
            this.ouinon = [];
            this.decomposition = [];
            this.actions = [];
            this.circonstances = [];
            this.regions = [];
            this.districts = [];
            this.commmunes = [];
            for (var reli = 0;reli < this.enums.length;reli++) {
              if (this.enums[reli].listId == "espece") { this.espece.push(this.enums[reli]); }
              if (this.enums[reli].listId == "determination") { this.determination.push(this.enums[reli]); }
              if (this.enums[reli].listId == "sexe") { this.sexe.push(this.enums[reli]); }
              if (this.enums[reli].listId == "ouinon") { this.ouinon.push(this.enums[reli]); }
              if (this.enums[reli].listId == "decomposition") { this.decomposition.push(this.enums[reli]); }
              if (this.enums[reli].listId == "actions") { this.actions.push(this.enums[reli]); }
              if (this.enums[reli].listId == "circonstances") { this.circonstances.push(this.enums[reli]); }
              if (this.enums[reli].listId == "regions") { this.regions.push(this.enums[reli]); }
              if (this.enums[reli].listId == "districts") { this.districts.push(this.enums[reli]); }
              if (this.enums[reli].listId == "communes") { this.commmunes.push(this.enums[reli]); }
            }
            this.espece.sort((a,b) => a.value.localeCompare(b.value));
            this.sexe.sort((a,b) => a.value.localeCompare(b.value));
            this.ouinon.sort((a,b) => a.value.localeCompare(b.value));
            this.decomposition.sort((a,b) => a.value.localeCompare(b.value));
            this.actions.sort((a,b) => a.value.localeCompare(b.value));
            this.circonstances.sort((a,b) => a.value.localeCompare(b.value));
            this.regions.sort((a,b) => a.value.localeCompare(b.value));
            this.districts.sort((a,b) => a.value.localeCompare(b.value));
            this.commmunes.sort((a,b) => a.value.localeCompare(b.value));
            //CONSTRUCTION DES ENUMS
            resolve("ok");
          });   
        }));
        promises.push(new Promise((resolve,reject) => {
          this.getObservationsRef().subscribe(res => {
            this.observations = res;
            resolve("ok");
          }); 
        }));
        Promise.all(promises).then((values) => {
          SplashScreen.hide();
        });
       })
    }
    getEnumsRef(): Observable<Object[]> {
      const enumsRef = collection(this.firestore, 'enums');
      return collectionData(enumsRef, { idField: '_id'}) as Observable<Object[]>;
    }
    getObservationsRef(): Observable<Object[]> {
      const observationsRef = collection(this.firestore, 'devices',this.deviceUid,'observations');
      return collectionData(observationsRef, { idField: 'id'}) as Observable<Object[]>;
    }
    getAllObservationsRef(): Observable<Object[]> {
      const observationsRef = collection(this.firestore, 'map');
      return collectionData(observationsRef, { idField: 'id'}) as Observable<Object[]>;
    }
    getDeviceUid() {      
      return this.deviceUid;
    }
    getEnums() {      
      return this.enums;
    }
    getEspeces() {      
      return this.espece;
    }
    getDetermination() {      
      return this.determination;
    }
    getSexe() {      
      return this.sexe;
    }
    getOuinon() {      
      return this.ouinon;
    }
    getDecomposition() {      
      return this.decomposition;
    }
    getActions() {      
      return this.actions;
    }
    getCirconstances() {      
      return this.circonstances;
    }
    getRegions() {      
      return this.regions;
    }
    getDistricts() {      
      return this.districts;
    }
    getCommmunes() {      
      return this.commmunes;
    }

    getEnumLib(type,uid) {     
      for (let reli = 0;reli < this.enums.length;reli++) 
      {
        if ((this.enums[reli].listId == type) && (this.enums[reli].id == uid))
        {
          return this.enums[reli].value;
        }
      }
    }
    getObservations() {      
      return this.observations;
    }
    async clearUserDatas() {
      const userDataCacheRef = collection(this.firestore, 'devices',this.deviceUid,'cache');
      const userDataDocsRef = collection(this.firestore, 'devices',this.deviceUid,'observations');
      const q = query(userDataCacheRef);
      const querySnapshot = await getDocs(q);
        querySnapshot.forEach(element => {
            deleteDoc(element.ref);
        });
      const q2 = query(userDataDocsRef);
      const querySnapshot2 = await getDocs(q2);
      querySnapshot2.forEach(element => {
            deleteDoc(element.ref);
        });
    }
}