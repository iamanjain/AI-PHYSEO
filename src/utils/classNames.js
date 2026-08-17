/**
 * Utility function to concatenate CSS class names
 * @param  {...(string|boolean|undefined|null)} classes 
 * @returns {string}
 */
export function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}
