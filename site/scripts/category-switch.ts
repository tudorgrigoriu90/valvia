/** Applies the category preference (PO-5) to <html data-category> and wires the header switch. */
import { isCategory, type Category } from '../../core/population/category';
import { readCategory, writeCategory } from './category';

const storage = (() => {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
})();

function apply(category: Category): void {
  document.documentElement.dataset.category = category;
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-category-choice]')) {
    button.setAttribute('aria-pressed', String(button.dataset.categoryChoice === category));
  }
}

apply(readCategory(storage));
for (const button of document.querySelectorAll<HTMLButtonElement>('[data-category-choice]')) {
  button.addEventListener('click', () => {
    const choice = button.dataset.categoryChoice;
    if (!isCategory(choice)) return;
    writeCategory(storage, choice);
    apply(choice);
  });
}
