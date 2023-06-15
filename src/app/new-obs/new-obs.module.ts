import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewObsPageRoutingModule } from './new-obs-routing.module';

import { NewObsPage } from './new-obs.page';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NewObsPageRoutingModule
  ],
  declarations: [NewObsPage]
})
export class NewObsPageModule {}
