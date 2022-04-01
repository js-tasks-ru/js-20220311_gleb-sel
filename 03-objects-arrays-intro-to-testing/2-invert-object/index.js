/**
 * invertObj - should swap object keys and values
 * @param {object} obj - the initial object
 * @returns {object | undefined} - returns new object or undefined if nothing did't pass
 */
export function invertObj(obj) {
  if (typeof obj !== 'object') {return undefined;}
  else if (Object.keys(obj).length === 0) {return {};}
  
  const result = {};
  Object.keys(obj).forEach((key) => result[obj[key]] = key);
  return result;

}
