/**
   * 
   * @param {*} entireObj object
   * @param {*} keyToFind string
   * @param {*} valToFind string
   * @returns 
   */
function findNestedObj(entireObj, keyToFind, valToFind) {
    let foundObj = null;
    JSON.stringify(entireObj, (_, nestedValue) => {

        if (nestedValue && nestedValue[keyToFind] === valToFind) {
            foundObj = nestedValue;
        }
        return nestedValue;
    });
    return foundObj;
}
/**
 * gets array of object and finds eact object for the targetId of the specified key To Find
 * @param {*} json array of objects
 * @param {*} keyToFind string
 * @param {*} targetId string
 * @returns 
 */
let findParentObject = (json, keyToFind, targetId) => {
    for (let parent of json) {
        let isFound = findNestedObj(parent, keyToFind, targetId);
        if (isFound) {
            return parent;
        }
    }
    return null;
}

module.exports = {
    findParentObject: findParentObject,
    findNestedObj: findNestedObj
}