import { Pipe, PipeTransform } from '@angular/core';
import { SafranFormFieldOption } from '../models/form.model';

/**
 * Pipe utilisé dans le multiselect pour retrouver le label d'une option par sa valeur.
 * Usage: options | safranOptLabel: value
 */
@Pipe({
  name: 'safranOptLabel',
  standalone: true,
  pure: true
})
export class SafranOptLabelPipe implements PipeTransform {
  transform(options: SafranFormFieldOption[], value: any): string {
    if (!options || !options.length) return String(value);
    return options.find(o => o.value === value)?.label ?? String(value);
  }
}
