// const redisClient = require('./signin').redisClient;

const deleteAccount = (req, res, db) =>{
    const {id} = req.params;
    db('users').where({id}).del()
     .then(db('login').where({id}).del())
     .then(res.status(200).json('deleted account'))
     .catch(err => res.status(400).json('oops! cannot delete account'))
}

module.exports = {
    deleteAccount
}