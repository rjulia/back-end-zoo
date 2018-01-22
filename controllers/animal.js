'use strict'
//modulos
var fs = require('fs');
var path = require('path')

//models
var User = require('../models/user');
var Animal = require('../models/animal');

//actions

function pruebas(req, res) {

    res.status(200).send({
        message: 'probando el controllador de animales',
        user: req.user
    });
}

function saveAnimal(req, res) {
    var animal = new Animal()
    var params = req.body;

    if (params.name) {
        animal.name = params.name;
        animal.description = params.description;
        animal.year = params.year;
        animal.image = null;
        animal.user = req.user.sub;
        animal.save((err, animalStored) => {
            if (err) {
                res.status(500).send({ message: 'error en el servidor' })
            } else {
                if (!animalStored) {
                    res.status(404).send({ message: 'no se a guardado el animal' })
                } else {
                    res.status(200).send({ animal: animalStored })
                }
            }
        })
    } else {
        res.status(200).send({ message: 'el nombre del animal es obligatorio'})
    }
}
function getAnimals(req, res){
    Animal.find({}).populate({path: 'user'}).exec((err, animals)=>{
        if (err) {
            res.status(500).send({ message: 'error en el peticion' })
        } else {
            if (!animals) {
                res.status(404).send({ message: 'no hay resultados: animales' })
            } else {
                res.status(200).send({ animals })
            }
        }
    })
}
function getAnimal(req, res){

    var animalId = req.params.id;

    Animal.findById(animalId).populate({path: 'user'}).exec((err, animal)=>{
        if (err) {
            res.status(500).send({ message: 'error en el peticion' })
        } else {
            if (!animal) {
                res.status(404).send({ message: 'no hay resultado de este animal' })
            } else {
                res.status(200).send({ animal })
            }
        }
    })
}

function updateAnimal(req, res) {
    var animalId = req.params.id;
    var update = req.body;

    console.log(animalId)
    console.log(update)
    Animal.findByIdAndUpdate(animalId, update,{new: true}, (err, animalUpdate)=>{
        if (err) {
            res.status(500).send({ message: 'error en el peticion' })
        } else {
            if (!animalUpdate) {
                res.status(404).send({ message: 'no se actualizado el animal' })
            } else {
                res.status(200).send({ animal: animalUpdate })
            }
        }
    })
}

function uploadImage(req, res) {
    var animalId = req.params.id;
    var file_name = ' No subido...'

    if (req.files) {
        var file_path = req.files.image.path;
        var file_split = file_path.split('\\');
        var file_name = file_split[2];
        var ext_split = file_name.split('\.')

        var file_ext = ext_split[1]

        if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif' ) {
            // if (animalId != req.animal.sub) {
            //     return res.status(500).send({message: 'notienes permiso par actualizar la imagen'})
            // }
            Animal.findByIdAndUpdate(animalId, {image: file_name}, {new: true}, (err, animalUpdated) => {
                if(err){
                    res.status(500).send({
                        message: 'Error Actualizar animal'
                    });
                } else {
                    if (!animalUpdated) {
                        res.status(404).send({message: 'No se a podido Actualizar animal'});
                    }else{
                        res.status(200).send({ animal: animalUpdated, image: file_name});
                    }
                }
            })
        } else {
            fs.unlink(file_path, (err) => {
                if(err){
                    res.status(200).send({message: 'Extension no valida y fichero no borrado'});
                }else {

                    res.status(200).send({message: 'Extension no valida'});
                }
            })
        }
       
    } else {
        res.status(200).send({message: 'No se ha subido fichero'});
    }
}

function getImageFile(req, res) {
    var imageFile = req.params.imageFile
    var path_file = './uploads/animals/' + imageFile

    fs.exists(path_file, function(exists) {
        if(exists){
            res.sendFile(path.resolve(path_file))
        }else{
            res.status(404).send({message: 'la imagen no existe'});
        }
    })
    
}

function deleteAnimal(req, res) {
    var animalId = req.params.id;
    Animal.findByIdAndRemove(animalId, (err, animalRemove)=>{
        if(err){
            res.status(500).send({message: 'Error en la peticion'});
        }else {
            if (!animalRemove) {
                res.status(404).send({message: 'No se ha borrado borrar'});

            } else {
                res.status(200).send({animal: animalRemove});
 
            }
        }
    })
}

module.exports = {
    pruebas,
    saveAnimal,
    getAnimals,
    getAnimal,
    updateAnimal,
    uploadImage,
    getImageFile,
    deleteAnimal
}