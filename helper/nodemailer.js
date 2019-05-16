const nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth : {
        user : 'gemamreza@gmail.com',
        pass : 'nqrnhkuitorghwlj'
    },
    tls : {
        rejectUnauthorized : false
    }
})

module.exports = transporter
