import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Recipe, StrapiResponse } from '../models/recipe.model';

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
}
