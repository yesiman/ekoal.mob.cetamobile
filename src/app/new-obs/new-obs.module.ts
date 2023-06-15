import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewObsPageRoutingModule } from './new-obs-routing.module';

import { NewObsPage } from './new-obs.page';

import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NewObsPageRoutingModule
  ],
  declarations: [NewObsPage]
})
export class NewObsPageModule {}
