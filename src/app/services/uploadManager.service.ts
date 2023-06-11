import { Injectable } from '@angular/core';
import { CollectionReference, Firestore, collection, collectionData, deleteDoc,doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { FirebaseStorage, getDownloadURL, getStorage, ref, uploadBytesResumable } from '@angular/fire/storage';
import { Device } from '@capacitor/device';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class uploadManager {
    private uuid = "";
    private storage:FirebaseStorage;
    private cacheRef:CollectionReference;

    constructor(private firestore: Firestore) {
        this.storage = getStorage();
        this.loadDeviceInfo();
        
        
    }
    
    loadDeviceInfo = async () => {
        const uid = await Device.getId();
        this.uuid = uid.uuid;
        this.cacheRef = collection(this.firestore, "devices/"+this.uuid+"/cache/");
        this.resumeUploads();
    }

    upload(data) {
        //SI UPLOAD OK VIDAGE CACHE
        const storageRef = ref(this.storage, 'observations/'+data.filename+"."+data.ext)
        fetch(data.wPath)
        .then (res => res.blob()) // Gets the response and returns it as a blob
        .then (blob => {
          const uploadTask = uploadBytesResumable(storageRef, blob);
          // Listen for state changes, errors, and completion of the upload.
          uploadTask.on('state_changed',
          (snapshot) => {
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done');
            switch (snapshot.state) {
              case 'paused':
                console.log('Upload is paused');
                break;
              case 'running':
                console.log('Upload is running');
                break;
            }
          }, 
          (error) => {
            // A full list of error codes is available at
            // https://firebase.google.com/docs/storage/web/handle-errors
            switch (error.code) {
              case 'storage/unauthorized':
                // User doesn't have permission to access the object
                break;
              case 'storage/canceled':
                // User canceled the upload
                break;
              case 'storage/unknown':
                // Unknown error occurred, inspect error.serverResponse
                break;
            }
          }, 
          () => {
            // Upload completed successfully, now we can get the download URL
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                //on update le parent
                console.log(data);
                const docRef = doc(this.firestore, "devices/"+this.uuid+"/observations/"+data.parentUid);
                const docSnap = getDoc(docRef).then((doc) => {
                    let obs = doc.data();
                    //ON MET A JOUR LA PROP URL DE L'IMAGE
                    for (var reliFiles = 0;reliFiles < obs.images.length;reliFiles++) 
                    {
                        if (obs.images[reliFiles].webPath == data.wPath) {
                            obs.images[reliFiles].url = downloadURL;
                        }
                    }
                    updateDoc(docRef, obs).then(() => {
                        //on vide le cache de l'image
                    });
                }).catch((error) => {
                    console.log("Error getting document:", error);
                })
            });
          });
      });
    }
    resumeUploads() {
        this.getCache().subscribe(res => {
            //webpath de limage
            //id du parent
            console.log("res",res);    
        });
    }
    getCache(): Observable<Object[]> {
        const cacheRef = collection(this.firestore, 'devices',this.uuid,'cache');
        return collectionData(cacheRef, { idField: 'id'}) as Observable<Object[]>;
      }
}


/*



*/