'use srict'

let trim = (x) => {
  let value = String(x)
  return value.replace(/^\s+|\s+$/gm, '')
}
let isEmpty = (value) => {
  if (value === null || value === undefined || trim(value) === '' || value.length === 0) {
    return true
  } else {
    return false
  }
}

let removeEmpty = obj => {
  Object.keys(obj).forEach(key => obj[key] == null && delete obj[key]);
  return obj;
};

let removeEmptyArr = arr => {
  let newArr = arr.filter((ar)=>{
    return ar != null || undefined;
  });
  return newArr
}

/**
 * exporting functions.
 */
module.exports = {
  isEmpty: isEmpty,
  removeEmpty:removeEmpty,
  removeEmptyArr : removeEmptyArr
}
