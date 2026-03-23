const knex = require('knex');
const fs = require ('fs');
module.exports =  {
	
   client : "pg" ,
   //.......... local ..................
   connection : {
      host : '127.0.0.1' ,
      user : 'postgres' ,
      database : 'bugtracker', 
      password : 'lutsel' 
   },
   pool: { 
      min: 0,
      max: 10 
   } 
        
   };

// };
// // Backend/db.js
// const { Pool } = require('pg');   // Import pg Pool
// const knexConfig = require('./knexfile'); // your config

// // Create real Pool from your config
// const pool = new Pool(knexConfig.connection);

// module.exports = pool;



// Backend/db.js
// const knex = require('knex');
// const fs = require('fs'); 


// const pool = knex({
//   client: 'pg',
//   connection: {
//     host: '127.0.0.1',
//     user: 'postgres',
//     password: 'lutsel',
//     database: 'bugtracker'
//   },
//   pool: { min: 0, max: 10 }
// });

// module.exports = pool;
