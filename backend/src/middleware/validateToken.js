const jwt = require('jsonwebtoken')
const UserModel = require("../models/user")

const validateToken = (req, res, next) => {
  try {
    const token = req.headers.cookie.split('auth=')[1]
    if(!token) throw new Error('token not found')
    jwt.verify(token, process.env.jwtsecret, (err, decoded) => {
      if(err) throw new Error('token invalid')
      if(decoded.exp*1000 - Date.now() < 1000*60*60) {
        UserModel.find({_id: decoded.id}, (err, user) => {
          if(err) throw new Error('user not found')
          user.generateToken((err, token) => {
            if(err) throw new Error('error while generating token')
            else {
              res.cookie("auth", token)
            }
          })
        })
      }
      res.header("session", JSON.stringify(decoded))
      return next()
    })
  }
  catch(err) {
    if(req.method === 'GET')
      return res.status(403).redirect('/login')
    else 
      return res.status(403).send({
        'success': false,
        'msg': 'Not authorized'
      })
  }
}

module.exports = validateToken