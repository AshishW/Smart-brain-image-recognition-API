const redisClient = require('./signin').redisClient;

const handleSignout = (req, res) =>{
  const {authorization} = req.headers;
  if(authorization){
      redisClient.del(authorization);
      return res.json('sign out successful')
  }
  else{
    return res.status(401).json('error signing out')
  }
}

module.exports = {
    handleSignout
}