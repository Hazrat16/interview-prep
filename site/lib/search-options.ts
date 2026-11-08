/** Shared by the build (index creation) and the browser (index loading). */
export const SEARCH_OPTIONS = {
  idField: 'id',
  fields: ['t', 'x', 'g', 'c'],
  storeFields: ['t', 'k', 'o', 'y', 'c'],
  searchOptions: {
    boost: { t: 4, g: 2, c: 1.5 },
    prefix: true,
    fuzzy: 0.2,
    combineWith: 'AND' as const,
  },
};
