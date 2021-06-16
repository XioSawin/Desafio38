const mongoose = require('mongoose');
const express = require('express');
const app = express();

const productosController = require('../controladores/productosController');

// routes

//router.get('/listar/:id?', productosController.getById);

//router.post('/agregar', productosController.addProduct);

router.patch('/actualizar/:id', productosController.updateProduct);

router.delete('/borrar/:id', productosController.deleteProduct);

module.exports = {
    router
}
