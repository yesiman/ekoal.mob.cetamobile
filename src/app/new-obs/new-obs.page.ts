import { Component, OnInit } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { Camera, CameraResultType } from '@capacitor/camera';
import { Preferences } from '@capacitor/preferences';
import { Router } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';
@Component({
  selector: 'app-new-obs',
  templateUrl: './new-obs.page.html',
  styleUrls: ['./new-obs.page.scss'],
})
export class NewObsPage implements OnInit {
  private obs = {
    uid:null,
    dateObs:new Date().toISOString(),
    lat:null,
    lng:null,
    espece:null,
    typegroupe:null,
    observation:null, 
    observationdetails:null,
    imgSrc:null,
    imgwp:null,
    imgp:null
  };
  private lng;
  constructor(private router: Router) { }

  ngOnInit() {
    this.obs = {
      uid:null,
      dateObs:new Date().toISOString(),
      lat:null,
      lng:null,
      espece:null,
      typegroupe:null,
      observation:null, 
      observationdetails:null,
      imgSrc:null,
      imgwp:null,
      imgp:null
    };
  }
  takePict()  { 
    
    const addPict = async () => {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        saveToGallery:true
      });
      console.log("image",image);
      var imageUrl = image.webPath;
      this.obs.imgSrc = imageUrl;
      this.obs.imgwp = image.webPath;
      this.obs.imgp = image.path;
    };
    addPict();
   }
  getGeoloc()  { 
    const printCurrentPosition = async () => {
      const coordinates = await Geolocation.getCurrentPosition();
      this.obs.lat = coordinates.coords.latitude;
      this.obs.lng = coordinates.coords.longitude;
    };
    printCurrentPosition();
  }
  valid() { 
    const validForm = async () => {
      const { value } = await Preferences.get({ key: 'obs' });
      var obsArray = [];
      if (value) { obsArray = JSON.parse(value); }
      var d = new Date(this.obs.dateObs);
      this.obs.uid = uuidv4();
      alert(this.obs.uid);
      this.obs.dateObs = d.getDate()+"/"+(d.getMonth()+1)+"/"+d.getFullYear()+" "+d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds()
      if (this.obs.observationdetails) 
      { this.obs.observationdetails = this.obs.observationdetails.replace(/(["])/g,'&quot;') }
      
      obsArray.push(this.obs);

      await Preferences.set({
        key: 'obs',
        value: JSON.stringify(obsArray),
      });
      this.router.navigate(['/folder/Inbox'],{replaceUrl: true})
    };
    validForm();
  }
}
