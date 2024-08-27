const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const hashPassword = (req, res, next) =>{
const {password} = req.body;
    const hash = bcrypt.hashSync(password, 10);
    req.body.password = hash;

next()
}

const verifyToken =  (req, res, next) =>{
    const token =  req.headers?.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.SECRET_TOKEN);
    console.log({decoded});

    
}
module.exports= {hashPassword, verifyToken}