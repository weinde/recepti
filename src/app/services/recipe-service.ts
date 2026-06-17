import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Recipe, RecipeCreatePayload, StrapiResponse } from '../models/recipe.model';

@Injectable({
  providedIn: 'root',
})
export class RecipeService {
  http = inject(HttpClient);
  env = environment;

  /* Shortening the base URL */
  private baseUrl = `${environment.apiUrl}/recipes`;

  /* The three-signal pattern -> !!!!important habit!!! -> Data fetch has three possible states — loading, succeeded, failed */
  private _recipes = signal<Recipe[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  /* This is a public read-only view that components are allowed to read */
  readonly recipes = this._recipes.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  /* Loading all recipes from the Strapi API */
  async loadRecipes() {
    this._loading.set(true);
    this._error.set(null);

    try {
      const response = await firstValueFrom(
        this.http.get<StrapiResponse<Recipe[]>>(`${this.baseUrl}?populate=*`),
      );
      this._recipes.set(response.data);
    } catch (error) {
      this._error.set('Failed to load recipes');
    } finally {
      this._loading.set(false);
    }
  }

  /* Pushing a new recipe to the Strapi API */
  async createRecipe(recipe: RecipeCreatePayload): Promise<Recipe> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const response = await firstValueFrom(
        this.http.post<StrapiResponse<Recipe>>(this.baseUrl, { data: recipe }),
      );
      const created = response.data;

      // prepend to the shared signal so the list updates instantly
      this._recipes.update((current) => [created, ...current]);

      return created;
    } finally {
      this._loading.set(false);
    }
  }
}
