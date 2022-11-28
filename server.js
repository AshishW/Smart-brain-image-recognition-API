const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const knex = require('knex');
require('dotenv').config();

const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');
const signout = require('./controllers/signout');
const removeAccount = require('./controllers/removeAccount');
const auth = require('./controllers/authorization');


const db = knex({
  // connect to your own database here: (deployment)
  client: 'pg',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  }
});

// uncomment the below code in local environment
// const db = knex({
//   // connect to your own database here: (local env)
//   client: 'pg',
//   connection: {
//     host : process.env.DB_HOST,
//     user : process.env.DB_USER,
//     password : process.env.DB_PASS,
//     database : process.env.DB_DATABASE
//   }
// });

const app = express();

app.use(cors())
app.use(express.json());

app.get('/', (req, res)=> { res.send('hi') })
app.post('/signin', signin.signinAuthentication(db, bcrypt))
app.post('/register', register.registerAuthentication(db, bcrypt))
app.get('/profile/:id', auth.requireAuth, (req, res) => { profile.handleProfileGet(req, res, db)})
app.put('/profile/:id', auth.requireAuth, (req, res) => {profile.handleProfileUpdate(req, res, db)})
app.put('/image', auth.requireAuth, (req, res) => { image.handleImage(req, res, db)})
app.post('/imageurl', auth.requireAuth, (req, res) => { image.handleApiCall(req, res)})
app.put('/signout', auth.requireAuth, (req, res)=> {signout.handleSignout(req, res)})
app.delete('/removeAccount/:id',(req, res) => {removeAccount.deleteAccount(req, res, db)})
app.listen(process.env.PORT || 3001, ()=> {
  console.log('app is running on port 3001');
})
