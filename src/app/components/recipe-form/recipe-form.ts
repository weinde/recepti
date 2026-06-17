import { Component, inject, OnInit, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormBuilder, ReactiveFormsModule, Validators, } from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { RecipeService } from '../../services/recipe-service';
import { CategoryService } from '../../services/category-service';
import { Category, RecipeCreatePayload } from '../../models/recipe.model';

type IngredientForm = FormGroup<{
  name: FormControl<string>;
  amount: FormControl<string>;
  unit: FormControl<string>;
}>;

@Component({
  selector: 'app-recipe-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    InputNumberModule,
    ButtonModule,
    MessageModule,
    AutoCompleteModule,
  ],
  templateUrl: './recipe-form.html',
  styleUrl: './recipe-form.scss',
})
export class RecipeForm implements OnInit {
  private fb = inject(FormBuilder);
  private recipeService = inject(RecipeService);
  private categoryService = inject(CategoryService);
  private router = inject(Router);

  protected submitting = false;
  protected submitError: string | null = null;

  // filtered list shown in the dropdown
  protected categorySuggestions = signal<Category[]>([]);

  protected form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    instructions: [''],
    prepTime: [null as number | null],
    cookTime: [null as number | null],
    servings: [null as number | null],
    // holds either a selected Category object OR a typed string (new category)
    category: [null as Category | string | null],
    ingredients: new FormArray<IngredientForm>([]),
  });

  ngOnInit(): void {
    // load categories so the dropdown has data
    this.categoryService.loadCategories();
  }

  get ingredients(): FormArray<IngredientForm> {
    return this.form.get('ingredients') as FormArray<IngredientForm>;
  }

  private createIngredientGroup(): IngredientForm {
    return this.fb.nonNullable.group({
      name: ['', Validators.required],
      amount: [''],
      unit: [''],
    });
  }

  addIngredient(): void {
    this.ingredients.push(this.createIngredientGroup());
  }

  removeIngredient(index: number): void {
    this.ingredients.removeAt(index);
  }

  // fires as the user types in the AutoComplete
  filterCategories(event: { query: string }): void {
    const query = event.query.toLowerCase();
    const matches = this.categoryService
      .categories()
      .filter((c) => c.name.toLowerCase().includes(query));
    this.categorySuggestions.set(matches);
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.submitError = null;

    const v = this.form.getRawValue();

    const title = v.title ?? '';
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    try {
      // resolve the category: existing object, new string, or none
      const categoryDocumentId = await this.resolveCategory(v.category);

      const payload: RecipeCreatePayload = {
        title,
        slug,
        description: v.description ?? undefined,
        instructions: v.instructions ?? undefined,
        prepTime: v.prepTime ?? undefined,
        cookTime: v.cookTime ?? undefined,
        servings: v.servings ?? undefined,
        ingredients: v.ingredients ?? [],
        // Strapi 5 relation: send the related record's documentId
        ...(categoryDocumentId ? { category: categoryDocumentId } : {}),
      };

      const created = await this.recipeService.createRecipe(payload);
      this.router.navigate(['/']);
    } catch (err) {
      this.submitError = 'Could not save the recipe. Please try again.';
      console.error(err);
    } finally {
      this.submitting = false;
    }
  }

  // returns a category documentId, creating a new category if the user typed a name
  private async resolveCategory(value: Category | string | null): Promise<string | null> {
    if (!value) {
      return null;
    }
    // user selected an existing category object
    if (typeof value === 'object') {
      return value.documentId;
    }
    // user typed a new category name (string) — create it
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }
    const newCategory = await this.categoryService.createCategory(trimmed);
    return newCategory.documentId;
  }
}
