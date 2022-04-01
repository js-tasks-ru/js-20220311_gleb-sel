/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
 
export function createGetter(path) {
  const field = path.split('.');

  return function (obj) {
    let rest = obj;

    function findProp(x) {
      if (field.length === x || rest === undefined) {
        return rest;
      }

      rest = rest[field[x]];

      return findProp(x + 1);
    }

    return findProp(0);
  };
}

const product = {
  category: {
    title: "Goods"
  }
};

// const getter = createGetter('category.title');

// console.log(getter(product));



