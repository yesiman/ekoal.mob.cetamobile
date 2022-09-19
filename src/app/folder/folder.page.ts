import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@awesome-cordova-plugins/file-transfer/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { HTTP } from '@awesome-cordova-plugins/http/ngx';
import { LoadingController } from '@ionic/angular';
@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
})
export class FolderPage implements OnInit {
  public folder: string;
  private obsArray:[];
  private loading;
  constructor(private loadingCtrl: LoadingController,private activatedRoute: ActivatedRoute,
    private sanitizer: DomSanitizer,public http: HTTP,private transfer: FileTransfer,
    private file: File) { }

  ngOnInit() {
    this.folder = this.activatedRoute.snapshot.paramMap.get('id');
    
    this.loadObservations();
  }
  loadObservations() {
    const loadObs = async () => {
      const { value } = await Preferences.get({ key: 'obs' });
      this.obsArray = [];
      if (value) { this.obsArray = JSON.parse(value); }
      
    };
    loadObs();
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
  showObs(ds) {
    alert(ds);
  }
  uploadObs() {
    var k = 0;
    var promises = [];
    this.showLoading();
    
    for (var i = 0; i < this.obsArray.length; i++) {

        var obs:any = this.obsArray[i];


        //var date = resultSet.item(i).date;
        var donnee = {date:obs.dateObs,lat:obs.lat,long:obs.lng, groupe:obs.typegroupe, espece:obs.espece,obs:obs.observation,  picture:obs.imgSrc,  com:obs.observationdetails};
        k++;
        const options = {
            method: 'POST',
              data: donnee
        };
        if (obs.imgSrc)
        {
          promises.push(this.scriptPicture(obs.imgp,obs.uid,this));
        }
        
        promises.push(this.scriptDb(options,obs.uid,this));
    }
    Promise.all(promises).then((values) => {
      this.loading.dismiss();
    }).catch(reason => {
      this.loading.dismiss();
    });
}
deleteObs() {
  const delObs = async () => {
    await Preferences.set({
      key: 'obs',
      value: JSON.stringify([]),
    });
    this.loadObservations();
  };
  delObs();
}
scriptDb(options,uid,that) {
  return new Promise(function(resolve, reject) { that.http.sendRequest('http://ns3192284.ip-5-39-73.eu/cetamada/updateObs.php', options, function(response) {
         //deleteDb(date, i);
         resolve("ok");
     }, function(response) {
         //alert("Erreur observation "+i+"");
         resolve("ok");
     })})
}
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
