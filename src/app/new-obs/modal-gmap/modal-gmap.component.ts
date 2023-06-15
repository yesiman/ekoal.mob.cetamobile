import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GoogleMap, Marker } from '@capacitor/google-maps';

import { ModalController } from '@ionic/angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-modal-gmap',
  templateUrl: 'modal-gmap.component.html',
})
export class ModalGmapComponent implements OnInit {
  @ViewChild('map')
  mapRef: ElementRef<HTMLElement>;
  newMap: GoogleMap = null;
  marker:Marker = null;
  markersIds = [];

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() { 
    setTimeout(() => {
      this.createMap();
    }, 250);
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
    }
    
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    return this.modalCtrl.dismiss({}, 'confirm');
  }

/*
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
*/ 



}