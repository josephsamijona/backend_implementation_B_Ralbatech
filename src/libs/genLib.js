
let createSlug = (title) => {
    return title
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '');
}
let createProductSlug = (title) => {
    return title
        .toLowerCase()
        .replace(/ /g, '_')
        .replace(/[^\w-]+/g, '');
}


module.exports = {
    createSlug: createSlug,
    createProductSlug: createProductSlug
}