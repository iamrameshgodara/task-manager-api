const jwt = require('jsonwebtoken')
const User = require('../models/user')
require('dotenv').config()
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decoded = jwt.verify(token,process.env.JWT_SECRET) //check token is correct not expired
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token }) //decoded has _id property dwe preloaded in model

        if (!user) {
            throw new Error()
        }
        req.token = token
        req.user = user
        next()
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate' })
    }
}
module.exports = auth
