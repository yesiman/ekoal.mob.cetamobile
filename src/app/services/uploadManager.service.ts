import { Injectable } from '@angular/core';
import { CollectionReference, Firestore, arrayRemove, arrayUnion, collection, collectionData, deleteDoc,doc, getDoc, getDocs, query, queryEqual, updateDoc, where } from '@angular/fire/firestore';
import { FirebaseStorage, getDownloadURL, getStorage, ref, uploadBytesResumable } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { datasManager } from './datas.service';


@Injectable({
  providedIn: 'root',
})
export class uploadManager {
    private uuid = "";
    private storage:FirebaseStorage;
    private cacheRef:CollectionReference;

    constructor(private firestore: Firestore, private datasmanager:datasManager) {
        this.storage = getStorage();
        this.loadDeviceInfo();
    }
    
    loadDeviceInfo = async () => {
        this.uuid = this.datasmanager.getDeviceUid();
        this.cacheRef = collection(this.firestore, "devices/"+this.uuid+"/cache/");
        this.resumeUploads();
    }

    async upload(data) {
        console.log("data is",data);
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
                const docRef = doc(this.firestore, "devices/"+this.uuid+"/observations/"+data.parentUid);
                const docSnap = getDoc(docRef).then((doc) => {
                    let obs = doc.data();
                    //ON MET A JOUR LA PROP URL DE L'IMAGE
                    for (let reliFiles = 0;reliFiles < obs.images.length;reliFiles++) 
                    {
                        if (obs.images[reliFiles].filename == data.filename) {
                            let img = obs.images[reliFiles];
                            img.url = downloadURL;
                            updateDoc(docRef, { images:arrayUnion(img) }).then(() => {
                              delete img.url;
                              updateDoc(docRef, { images:arrayRemove(img) }).then(() => {
                                this.removeCache(data.filename);
                            });
                          });
                            
                        }
                    }
                    
                }).catch((error) => {
                    console.log("Error getting document:", error);
                })
            });
          });
      });
    }
    async removeCache(filename) {
        const q = query(this.cacheRef, where("filename", "==", filename));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(element => {
            deleteDoc(element.ref);
        }); 
    }
    resumeUploads() {
        this.getCache().subscribe(res => {
            //webpath de limage
            //id du parent
            //console.log("res",res);    
        });
    }
    getCache(): Observable<Object[]> {
        const cacheRef = collection(this.firestore, 'devices',this.uuid,'cache');
        return collectionData(cacheRef, { idField: 'id'}) as Observable<Object[]>;
      }
}