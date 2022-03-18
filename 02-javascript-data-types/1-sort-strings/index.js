/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const copy = [...arr];
  if (param === 'asc') {
    return copy.sort((a, b) => a.localeCompare(b, ['ru', 'en-US', 'en-GB'], { sensitivity: "case", caseFirst: 'upper'}));
  } else if (param === 'desc') {
    return copy.sort((a, b) => b.localeCompare(a, ['ru', 'en-US', 'en-GB'], { sensitivity: "case", caseFirst: 'lower'}));
  }
}

