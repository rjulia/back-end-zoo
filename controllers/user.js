'use strict'
//modulos
var bcrypt = require('bcrypt-nodejs');
var fs = require('fs');
var path = require('path')

//models

var User = require('../models/user');

//servicio

var jwt = require('../services/jwt')


//actions

function pruebas(req, res){

    res.status(200).send({
        message: 'probando el controllador de usuarios y acciones de pruebas'
    });
}

function saveUser(req, res) {
    //create object to user
    var user = new User();

    //get params
    var params = req.body;

    //assing values 

    if (params.password && params.name && params.surname && params.email) {
        user.name = params.name;
        user.surname = params.surname;
        user.email = params.email;
        user.role = 'ROLE_USER';
        user.image = null;

        User.findOne({ email: user.email.toLowerCase() }, (err, issetUser) => {
            if (err) {
                res.status(500).send({ messsage: 'este email ya esta registrado' })

            } else {
                if (!issetUser) {
                    bcrypt.hash(params.password, null, null, function (err, hash) {
                        user.password = hash;
                        user.save((err, userStored) => {
                            if (err) {
                                res.status(500).send({ messsage: 'error al guardar el usuario' })
                            } else {
                                if (!userStored) {
                                    res.status(400).send({ messsage: 'no se a registrado el usuario' })
                                } else {
                                    res.status(200).send({ user: userStored })
                                }
                            }
                        })
                    });
                } else {
                    res.status(200).send({ message: 'el ususario no puede registrarse' })
                }
            }
        })
        //crytp password

    } else {
        res.status(200).send({ message: 'debes registrar mejor los usuario' })
    }

    // res.status(200).send({
    //     message: 'Metodo registro'
    // });
}


function login(req, res) {

    var params = req.body;
    var email = params.email;
    var password = params.password
    console.log( 'estoy aqui')
    console.log(params)
    User.findOne({ email: email.toLowerCase()}, (err, user) => {
        if (err) {
            res.status(500).send({ messsage: 'este email ya esta registrado' })

        } else {
            if (user) {
                bcrypt.compare(password, user.password, (err, check)=>{
                    if(check){

                        //ciomprobar el token uy generar
                        if(params.gettokken){
                            //devolver el token
                            console.log('aqui llega'),
                            res.status(200).send({
                                token: jwt.createToken(user)
                            })

                        } else{
                            res.status(200).send({user});
                        }

                    }else{
                        res.status(404).send({ messsage: 'Usuario no ha podido logearse correctamente'});
                    }
                })
                
            } else {
                res.status(404).send({ messsage: 'Usuario no ha podido login'});
            }

        }
    });
    //res.status(200).send({ message: 'Metodo logi' })
}

function updateUser(req, res) {

    var userId = req.params.id;
    var update = req.body;
    if (userId != req.user.sub) {
        return res.status(500).send({message: 'notienes permiso par aactualizar el usaurio'})
    }
    User.findByIdAndUpdate(userId, update, {new: true}, (err, userUpdated) => {
        if(err){
            res.status(500).send({
                message: 'Error Actualizar usuario'
            });
        } else {
            if (!userUpdated) {
                res.status(404).send({message: 'No se a podido Actualizar usuario'});
            }else{
                res.status(200).send({ user: userUpdated});
            }
        }
    })
   
}

function uploadImage(req, res) {
    var userId = req.params.id;
    var file_name = ' No subido...'

    if (req.files) {
        var file_path = req.files.image.path;
        var file_split = file_path.split('\\');
        var file_name = file_split[2];
        var ext_split = file_name.split('\.')

        var file_ext = ext_split[1]

        if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif' ) {
            if (userId != req.user.sub) {
                return res.status(500).send({message: 'notienes permiso par actualizar la imagen'})
            }
            User.findByIdAndUpdate(userId, {image: file_name}, {new: true}, (err, userUpdated) => {
                if(err){
                    res.status(500).send({
                        message: 'Error Actualizar usuario'
                    });
                } else {
                    if (!userUpdated) {
                        res.status(404).send({message: 'No se a podido Actualizar usuario'});
                    }else{
                        res.status(200).send({ user: userUpdated, image: file_name});
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
    var path_file = './uploads/users/' + imageFile

    fs.exists(path_file, function(exists) {
        if(exists){
            res.sendFile(path.resolve(path_file))
        }else{
            res.status(404).send({message: 'la imagen no existe'});
        }
    })
    
}

function getKeeper(req, res) {
    User.find({role: 'ROLE_ADMIN'}).exec((err, users)=>{
        if (err) {
            res.status(500).send({message: 'error en la peticion de keeper'});
        }else {
            if (!users) {
                res.status(404).send({message: 'No hay cuidadores'});
            } else {
                res.status(200).send({users});
            }
        }
    })
}

//exports methods

module.exports = {
    pruebas,
    saveUser,
    login,
    updateUser, 
    uploadImage,
    getImageFile,
    getKeeper
};