import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GoogleMap, Marker } from '@capacitor/google-maps';
import { environment } from 'src/environments/environment';
import { datasManager } from '../services/datas.service';
import { Geolocation } from '@capacitor/geolocation';
import { PopoverController } from '@ionic/angular';
import { MapopComponent } from './mapop/mapop.component';
import { Platform } from '@ionic/angular';


@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit {
  @ViewChild('map')
  mapRef: ElementRef<HTMLElement>;
  newMap: GoogleMap = null;
  markers = [];  
  private uuid = "";
  public observations;
  public opacity;
  constructor(private datasmanager:datasManager,public popoverController: PopoverController,public platform: Platform) { }
  loadDeviceInfo = async () => {
    
  };
  private lat;
  private long;
  private lng:number;
  ngOnInit() {
    setTimeout(() => {
      this.opacity = (this.platform.is("android")?"0":"1");
      this.newMap = null;
      this.datasmanager.getObservationsRef().subscribe(res => {
        this.observations = res;
        
        this.createMap();
      }); 
    }, 250);
  }
  async getGeoloc() {
    
  }
  async createMap() {
    if (this.newMap == null) {
      const coordinates = await Geolocation.getCurrentPosition({enableHighAccuracy:true});
    this.lat = coordinates.coords.latitude;
    this.long = coordinates.coords.longitude;
      this.newMap = await GoogleMap.create({
        id: 'my-cool-map',
        element: this.mapRef.nativeElement,
        apiKey: environment.gmapApiKey,
        config: {
          center: {
            lat: this.lat,
            lng: this.long,
          },
          zoom: 8,
          zoomControl:true,
          scrollwheel: false,
          disableDoubleClickZoom: true,
          mapTypeId: 'hybrid',
          fullscreenControl:false
        },
      });
      for (var reli = 0;reli < this.observations.length;reli++)
      {
        let obs = this.observations[reli];
        if (obs.lat && obs.long) {
          var mark:Marker = {
            coordinate: {
              lat: Number(obs.lat),
              lng: Number(obs.long)
            }
          }
          
          this.newMap.addMarker(mark).then((uid) => {
            obs.markerid = uid;
            this.markers.push(obs);
          });
          
        }
      }
      await this.newMap.setOnMarkerClickListener(async (marker) => {
        for (let reliMarks = 0;reliMarks < this.markers.length;reliMarks++) 
        {
          if (this.markers[reliMarks].markerid == marker.markerId) {

            const popover = await this.popoverController.create({
              component:MapopComponent,
              cssClass: 'popover-class',
              componentProps: { obs: this.markers[reliMarks] },
            });
            this.newMap.setCamera({
              coordinate: {
                lat: marker.latitude,
                lng: marker.longitude,
              },
              zoom: 10,
              bearing: 0
            });
            await popover.present();
            popover.onDidDismiss();
            break;
          }
        }
        
      });
      
      
    }
    
  }

}
