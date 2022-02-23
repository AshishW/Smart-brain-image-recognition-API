const signToken = require('./signin').signToken;
const setToken = require('./signin').setToken;
const createSessions = require('./signin').createSessions;
const getAuthTokenId = require('./signin').getAuthTokenId;

// const redisClient = require('./signin').redisClient;

const handleRegister = (db, bcrypt, req, res) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    return Promise.reject('incorrect form submission');
  }
  const hash = bcrypt.hashSync(password);
    return db.transaction(trx => {
      trx.insert({
        hash: hash,
        email: email
      })
      .into('login')
      .returning('email')
      .then(loginEmail => {
        return trx('users')
          .returning('*')
          .insert({
            email: loginEmail[0],
            name: name,
            joined: new Date()
          })
          .then(user => user[0])
      })
      .then(trx.commit)
      .catch(trx.rollback)
    })
    .catch(err => Promise.reject('unable to register'))
}


const registerAuthentication = (db, bcrypt) => (req, res) =>{
  const {authorization} = req.headers;   
  return authorization ? getAuthTokenId(req, res) :
   handleRegister(db, bcrypt, req, res)
    .then(data=>{
       return data.id && data.email ? createSessions(data) : Promise.reject(data)
      })
      .then(session=> res.json(session))
    .catch(err=>res.status(400).json(err))
}


module.exports = {
  registerAuthentication,
};


