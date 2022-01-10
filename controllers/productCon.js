const list = (req, res) => {
    res.json('product list');
}

const createProduct = (req, res) => {
    res.json('createProduct');
}

module.exports = {
    list,
    createProduct
}