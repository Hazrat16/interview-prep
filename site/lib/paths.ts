/** Shared (server + client) helpers. */

/** "topic/guide/id" → link to the question inside its guide page. */
export const questionHref = (key: string) => {
  const i = key.lastIndexOf('/');
  return `/${key.slice(0, i)}/#${key.slice(i + 1)}`;
};
export const guideOf = (key: string) => key.slice(0, key.lastIndexOf('/'));

export function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
