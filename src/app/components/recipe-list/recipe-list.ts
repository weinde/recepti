import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { RecipeService } from '../../services/recipe-service';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Message } from 'primeng/message';
import { Card } from 'primeng/card';

@Component({
  selector: 'app-recipe-list',
  imports: [ProgressSpinner, Message, Card],
  templateUrl: './recipe-list.html',
  styleUrl: './recipe-list.scss',
})
export class RecipeList implements OnInit {
  recipeService = inject(RecipeService);
  protected strapiUrl = environment.strapiUrl;

  constructor() {
    effect(() => {
      console.log('Recipes:', this.recipeService.recipes());
    });
  }

  ngOnInit(): void {
    this.recipeService.loadRecipes();
  }
}
