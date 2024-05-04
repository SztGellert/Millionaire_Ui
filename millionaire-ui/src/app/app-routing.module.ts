import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';

const routes: Routes = [
  {
    path: 'quiz',
    loadChildren: () => import('./quiz/quiz.module').then(m => m.QuizModule)
  },
  {
    path: '',
    loadChildren: () => import('./quiz/quiz.module').then(m => m.QuizModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
