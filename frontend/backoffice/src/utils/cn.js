import {clsx} from "clsx";

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes with proper class merging
 *
 * @param {...(string | object | Array)} inputs - Classes to merge
 * @returns {string} Merged class string
 */
export function cn(...inputs) {
  return clsx(inputs);
}

export default cn;
