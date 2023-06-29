import { Component, Input, NgModule, OnInit } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MapopModule } from './mapop.module';
import { datasManager } from 'src/app/services/datas.service';

@Component({
  selector: 'app-pop',
  templateUrl: './mapop.component.html',
  styleUrls: ['./mapop.component.scss'],
})
@NgModule({
  imports: [MapopModule]
})
export class MapopComponent implements OnInit {
  @Input() obs;
  constructor(public datamanager:datasManager) { }

  ngOnInit() {
    
  }

}
