const jwt = require('jsonwebtoken');
const redis = require('redis');

//setup redis and create client:
const redisClient = redis.createClient({host: '127.0.0.1'});

const handleSignin = (db, bcrypt, req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return Promise.reject('incorrect form submission');
  }
  return db.select('email', 'hash').from('login') //return keyword used to return the promise
    .where('email', '=', email)
    .then(data => {
      const isValid = bcrypt.compareSync(password, data[0].hash);
      if (isValid) {
        return db.select('*').from('users')
          .where('email', '=', email)
          .then(user => user[0])
          .catch(err => Promise.reject('unable to get user'))
      } else {
        Promise.reject('wrong credentials')
      }
    })
    .catch(err => Promise.reject('oops!'))
}

const signToken = (email) => {
  const jwtPayload = {email}
  return jwt.sign(jwtPayload, 'JWT_SECRET', {expiresIn: '2 days'})
}

const setToken = (token, id) =>{
   return Promise.resolve(redisClient.set(token, id))
}

const createSessions = (user) =>{
  //JWT token, return user data
  const {id, email} = user;
  const token = signToken(email);
  return setToken(token, id)
          .then(() => ({success: 'true', userId: id, token: token}) )
          .catch(console.log)
}

/* //example using async-await
  const createSessions = async (user) =>{ 
  //JWT token, return user data
  const {id, email} = user;
  const token = signToken(email);
  try {
    await setToken(token, id);
    return ({ success: 'true', userId: id, token: token });
  } catch (message) {
    return console.log(message);
  }
}

*/

const getAuthTokenId = (req, res) =>{
  const {authorization} = req.headers;
  return redisClient.get(authorization, (err, reply)=>{
    if(err || !reply){
      return res.status(400).json("unauthorized");
    }
    return res.json({id: reply})
  })
}

const signinAuthentication = (db, bcrypt) =>(req, res)=>{
   const {authorization} = req.headers;   
   return authorization ? getAuthTokenId(req, res) :
    handleSignin(db, bcrypt, req, res)
     .then(data=>{
        return data.id && data.email ? createSessions(data) : Promise.reject(data)
       })
       .then(session=> res.json(session))
     .catch(err=>res.status(400).json(err))
}


module.exports = {
  signinAuthentication,
  redisClient: redisClient,
  signToken,
  setToken,
  createSessions,
  getAuthTokenId
}