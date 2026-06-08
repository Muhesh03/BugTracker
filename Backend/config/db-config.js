const knex = require('knex');
const fs = require ('fs');
module.exports =  {
	
   client : "pg" ,
   //.......... local ..................
   connection : {
      host : '127.0.0.1' ,
      user : 'postgres' ,
      database : 'lutstrack2', 
      password : 'lutsel' 
   },
   pool: { 
      min: 0,
      max: 10 
   } 
        
   };

