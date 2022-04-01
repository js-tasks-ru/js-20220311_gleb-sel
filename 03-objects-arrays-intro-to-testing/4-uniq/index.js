/**
 * uniq - returns array of uniq values:
 * @param {*[]} arr - the array of primitive values
 * @returns {*[]} - the new array with uniq values
 */
export function uniq(arr) {
  return arr === undefined || arr.length === 0 ? [] : [...arr].filter((el, index) => {
    return arr.indexOf(el) === index;
  });
}
