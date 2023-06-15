import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModImagePageRoutingModule } from './mod-image-routing.module';

import { ModImagePage } from './mod-image.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModImagePageRoutingModule
  ],
  declarations: [ModImagePage]
})
export class ModImagePageModule {}
