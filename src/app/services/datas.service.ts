import { Injectable } from '@angular/core';
import { CollectionReference, Firestore, collection, collectionData, deleteDoc,doc, enableIndexedDbPersistence, getDoc, getDocs, query, queryEqual, updateDoc, where } from '@angular/fire/firestore';
import { FirebaseStorage, getDownloadURL, getStorage, ref, uploadBytesResumable } from '@angular/fire/storage';
import { Device } from '@capacitor/device';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class datasManager {
    private deviceUid:string;
    private enums;
    private observations;
    constructor(private firestore: Firestore) {
      
    }
    init() {
      this.loadDeviceInfos();
      enableIndexedDbPersistence(this.firestore)
        .then(() => { 
          console.log("Offline persistence enabled");
          this.getEnumsRef().subscribe(res => {
            this.enums = res;
            //this.cd.detectChanges();
          }); 
          this.getObservationsRef().subscribe(res => {
            this.observations = res;
            //this.cd.detectChanges();
          }); 
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
      const uid = await Device.getId();
      this.deviceUid = uid.uuid;
    }
    getEnumsRef(): Observable<Object[]> {
      const enumsRef = collection(this.firestore, 'enums');
      return collectionData(enumsRef, { idField: '_id'}) as Observable<Object[]>;
    }
    getObservationsRef(): Observable<Object[]> {
      const observationsRef = collection(this.firestore, 'devices',this.deviceUid,'observations');
      return collectionData(observationsRef, { idField: 'id'}) as Observable<Object[]>;
    }
    getDeviceUid() {      
      return this.deviceUid;
    }
    getEnums() {      
      return this.enums;
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