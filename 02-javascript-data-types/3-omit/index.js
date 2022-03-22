/**
 * omit - creates an object composed of enumerable property fields
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to omit
 * @returns {object} - returns the new object
 */
export const omit = (obj, ...fields) => {
  const omitedObj = Object.fromEntries(
    Object.entries(obj).filter((el) => {
      return !fields.includes(el[0]);
    })
  );
  return omitedObj;
};
