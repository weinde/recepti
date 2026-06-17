import { Routes } from '@angular/router';
import { RecipeList } from './components/recipe-list/recipe-list';
import { RecipeForm } from './components/recipe-form/recipe-form';

export const routes: Routes = [
  { path: '', component: RecipeList },
  { path: 'new', component: RecipeForm },
];
