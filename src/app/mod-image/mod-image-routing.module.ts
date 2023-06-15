import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModImagePage } from './mod-image.page';

const routes: Routes = [
  {
    path: '',
    component: ModImagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModImagePageRoutingModule {}
