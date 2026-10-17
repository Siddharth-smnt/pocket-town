export function element<T extends HTMLElement = HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (!found) throw new Error(`Missing UI element: ${id}`);
  return found as T;
}
export const icon = (name: string): string =>
  `<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;
