'use strict'

var mongoose = require('mongoose');
var uri = 'mongodb://localhost:27017/zoo';
var app = require('./app');
mongoose.Promise = global.Promise;

var port = process.env.PORT || 3789;


mongoose.connect(uri, {useMongoClient: true})
    .then(()=> {
       
       app.listen(port, ()=>{
           console.log('el servidor local con node y express esta corriendo correctamente')
       })
        
    })
    .catch(err => console.log(err))

