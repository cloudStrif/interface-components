import { Pipe, PipeTransform } from '@angular/core';
import { SbdFormFieldOption } from '../models/form.model';

/**
 * Pipe utilisé dans le multiselect pour retrouver le label d'une option par sa valeur.
 * Usage: options | sbdOptLabel: value
 */
@Pipe({
  name: 'sbdOptLabel',
  standalone: true,
  pure: true
})
export class SbdOptLabelPipe implements PipeTransform {
  transform(options: SbdFormFieldOption[], value: any): string {
    if (!options || !options.length) return String(value);
    return options.find(o => o.value === value)?.label ?? String(value);
  }
}
