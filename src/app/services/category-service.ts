import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Category, StrapiResponse } from '../models/recipe.model';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  http = inject(HttpClient);
  env = environment;

  /* Shortening the base URL */
  private baseUrl = `${environment.apiUrl}/categories`;

  /* The three-signal pattern -> !!!!important habit!!! -> Data fetch has three possible states — loading, succeeded, failed */
  private _categories = signal<Category[]>([]);
  private _loading = signal(false);
  private _error = signal<string | null>(null);

  readonly categories = this._categories.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  /* Loading all categories from the Strapi API */
  async loadCategories(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);

    try {
      const response = await firstValueFrom(
        this.http.get<StrapiResponse<Category[]>>(`${this.baseUrl}?sort=name:asc`),
      );
      this._categories.set(response.data);
    } catch (error) {
      this._error.set('Failed to load categories');
      console.error(error);
    } finally {
      this._loading.set(false);
    }
  }

  /* Creating a new category — returns it so the form can select it */
  async createCategory(name: string): Promise<Category> {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const response = await firstValueFrom(
      this.http.post<StrapiResponse<Category>>(this.baseUrl, {
        data: { name, slug }, // ← slug now included
      }),
    );
    const created = response.data;

    this._categories.update((current) =>
      [...current, created].sort((a, b) => a.name.localeCompare(b.name)),
    );

    return created;
  }
}
