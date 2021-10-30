const redisClient = require('./signin').redisClient;

const requireAuth = (req, res, next) =>{
    //this is a middleware, next is called to move-on to next task
    const {authorization} = req.headers;
    if(!authorization){
        return res.status(401).json('unauthorized')
    }
    return redisClient.get(authorization, (err, reply)=>{
            if(err || !reply){
                return res.status(401).json('unauthorized')
            }
            console.log('user authorization pass')
        return next();
        })
}

//this requireAuth blocks the request until the criteria is fulfilled

module.exports = {
    requireAuth
}