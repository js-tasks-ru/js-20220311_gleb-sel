/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  const arrString = Array.from(string);
  const arrRepeatValue = [];
  let prev;
  let index;
  for (const item of arrString) {
    if (prev === undefined) {
      index = 0;
      arrRepeatValue.push([item]);
    } else if (prev === item) {
      arrRepeatValue[index].push(item);
    } else if (prev !== item) {
      index += 1;
      arrRepeatValue.push([item]);
    }
    prev = item;
  }

  const arrCorrectSize = arrRepeatValue.map((item) => item.slice(0, size));
  return arrCorrectSize.flat().join('');
}


trimSymbols('xxxaaaaab', 3);

// npm run test -- 03-objects-arrays-intro-to-testing/3-trim-symbols/index.spec.js
