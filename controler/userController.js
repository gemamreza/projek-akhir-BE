const db =require('../database')
const Crypto = require('crypto')
const transporter = require('../helper/nodemailer')
const verify = require('../helper/emailer/verify')


module.exports = {
    register : (req,res) => {
            var data = req.body
            data.verified = 'false'
            data.role = 'user'
            var sql = `select username
                       from users
                       where username = '${data.username}';`
            db.query(sql , (err,result) => {
                try{
                if(err) throw {error:true , msg : 'Error from database'}
                if(result.length > 0) throw {error : true, msg : 'Username has been taken'}
                var hashPassword = Crypto.createHmac('sha256','secretabc')
                                   .update(data.password).digest('hex')
                data = {...data , password : hashPassword}
                var sql2 = `insert into users set ?`
                db.query(sql2,data, (err,result) => {
                    if(err) throw err
                    var mailOptions = verify(data.username,data.password,data.email)
                        transporter.sendMail(mailOptions, (err,res1) => {
                            if(err) throw {error : true , msg : 'Error saat pengiriman email'}
                            res.send('Register Success, please check your email to verify')                            
                        })
                })
                }catch(err){
                res.send(err)
                }
            })
    
    },
    verification : (req, res) => {
        var username = req.body.username
        var password = req.body.password
        var sql = `update users set verified = 'true' where username='${username}'
                   and password = '${password}';`
                db.query(sql, (err, result) => {
                    if(err) throw err
                    res.send('Email Berhasil di Verifikasi')
                })
        
    },
    login : (req, res) => {
        var username = req.query.username
        var password = req.query.password
        var passwordHash = Crypto.createHmac('sha256','secretabc').update(password).digest('hex')
        var sql = `select * from users where username='${username}' and password='${passwordHash}';`
        db.query(sql , (err,result)=>{
            try{
                if(err) throw err
                res.send(result)
            }catch(err){
                res.send(err)
            }
            
        })
        
    },
    getUsers : (req, res) => {
        var username = req.query.username
        var sql = `select * from users where username='${username}'`
        db.query(sql, (err, result) => {
            if(err) throw err
            res.send(result)
        })
    }
}