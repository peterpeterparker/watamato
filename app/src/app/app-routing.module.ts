import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';

const routes: Routes = [
  {path: '', redirectTo: 'board', pathMatch: 'full'},
  {path: 'board', loadChildren: () => import('./pages/board/board.module').then((m) => m.BoardPageModule)},
  {
    path: 'about',
    loadChildren: () => import('./pages/about/about.module').then((m) => m.AboutPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})],
  exports: [RouterModule]
})
export class AppRoutingModule {}
