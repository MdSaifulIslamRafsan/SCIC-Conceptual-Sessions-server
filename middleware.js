const bcrypt = require('bcrypt');
const hashPassword = (req, res, next) =>{
const {password} = req.body;
    const hash = bcrypt.hashSync(password, 10);
    req.body.password = hash;

next()
}
module.exports= {hashPassword}