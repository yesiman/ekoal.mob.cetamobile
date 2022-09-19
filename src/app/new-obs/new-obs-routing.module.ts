import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NewObsPage } from './new-obs.page';

const routes: Routes = [
  {
    path: '',
    component: NewObsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewObsPageRoutingModule {}
