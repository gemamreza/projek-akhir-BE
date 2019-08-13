const db = require('../database')
const transporter = require('./../helper/nodemailer')

module.exports = {
    getAllTransactionByAdmin : (req, res) => {
        var sql = `select * from history;`
        db.query(sql, (err, result) => {
            if(err) throw err
            res.send(result)
        })
    },
    getHistory : (req, res) => {
        var sql = `select * from history where username = '${req.query.username}';`
        db.query(sql, (err, result) => {
            if(err) throw err
            res.send(result)
        })
    },
    getHistoryByDetail : (req, res) => {
        var id = req.params.id_order
        var sql = `select p.nama, qty, total from historydetail
                   join products p on id_produk = p.id where id_order=${id};`
        db.query(sql, (err, result) => {
            if(err) throw err
            res.send(result)
        })
    },
    updateStatus : (req, res) => {
        var id = req.params.id
        var sql = `update history set status='TRANSACTION DONE' where id=${id};`
        db.query(sql, (err, result) => {
            try{
                if(err) throw err
                var sqla = `select username from history`
                db.query(sqla, (err1, result1) => {
                    if(err1) throw err1
                    var user = result1[0].username
                    var sqlb = `select email from users where username='${user}'`
                    db.query(sqlb, (err2, result2) => {
                        if(err2) throw err2
                        var email = result2[0].email
                        var mailOptions = {
                            from : 'gadgetmarket.com <gadgetmarket@gmail.com>',
                            to : email,
                            subject : 'PAYMENT DONE',
                            html : `<h1>Terimakasih </h1>
                                    <h3>Transaksi berhasil, dan produk akan segera dikirim.</h3>`
                        }
                        transporter.sendMail(mailOptions, (err3, result3) => {
                            if(err3) throw err3
                            res.send('Transaksi Selesai')
                        })
                    })
                })
            } catch (err4) {
                res.send(err4)
            }
           
        })
    },
    updateCancelStatus : (req, res) => {
        var id = req.params.id
        var sql = `update history set status='INVALID PAYMENT' where id=${id};`
        db.query(sql, (err, result) => {
            try{
                var sqla = `select id, username from history`
                db.query(sqla, (err1, result1) => {
                    if(err1) throw err1
                    var user = result1[0].username
                    var sqlb = `select email from users where username='${user}'`
                    db.query(sqlb, (err2, result2) => {
                        if(err2) throw err2
                        var email = result2[0].email
                        var mailOptions = {
                            from : 'gadgetmarket.com <gadgetmarket@gmail.com>',
                            to : email,
                            subject : 'INVALID PAYMENT',
                            html : `<h1>INVALID</h1>
                                    <h3>Transaksi tertolak, mohon cek kembali gambar/nominal yang anda kirim</h3>
                                    <h3>Klik <a href="http://localhost:3000/payment/${id}"> Link Ini </a>
                                        untuk melakukan upload ulang</h3>`
                        }
                        transporter.sendMail(mailOptions, (err3, result3) => {
                            if(err3) throw err3
                            res.send('Pesan Terkirim')
                        })
                    })
                })
            } catch (err) {
                res.send(err)
            }  
        })
    },
    //  uploadTransaction : (req, res) => {
    //     try{
    //         if(req.validation) throw req.validation
    //         if(req.file.size > 500000) throw {error : true, msg : "Image Too Large"}
    //         var id = req.params.id
    //         var sqla = `select status, username from history where id=${id};`
    //         db.query(sqla, (err, result) => {
    //             if(result[0].status === 'ON PROSSES'){
    //                 res.send('Please Wait. Transaction is already under review!')
    //             } else if (result[0].status === 'TRANSACTION DONE'){
    //                 res.send('TRANSACTION HAS ALREADY DONE. THANK YOU!')
    //             }else {
                    
    //                 var newData = {bukti : req.file.path, status : 'ON PROSSES'}
    //                 var sqlb = `update history set ?
    //                         where id=${id};`
    //                 db.query(sqlb, newData, (err1, result1) => {
    //                     if(err1) throw err1
    //                 res.send('Upload Bukti Pembayaran Berhasil')
    //             })
    //                 }
    //             })
    //     } catch (err) {
    //         res.send(err)
    //     }
    // },
    uploadTransaction : (req, res) => {
        try{
            if(req.validation) throw req.validation
            if(req.file.size > 500000) throw {error : true, msg : "Image Too Large, Must 500kB or Below."}
            var id = req.query.id
            var user = req.query.username
            var sqla = `select status, username from history where id=${id} and username='${user}';`
            db.query(sqla, (err, result) => {
                // if(result[0].status === 'ON PROSSES'){
                //     res.send('Please Wait. Transaction is already under review!')  
                // } else if (result[0].status === 'TRANSACTION DONE'){
                //     res.send('TRANSACTION HAS ALREADY DONE. THANK YOU!')
                // } else if(result[0].username !== user){
                //     res.send("YOU DON'T HAVE THIS TRANSACTION")       
                if(result.length === 0){
                    res.send("YOU DON'T HAVE THIS TRANSACTION")
                } else {
                    if(result[0].status === 'ON PROSSES'){
                    res.send('Please Wait. Transaction is already under review!')
                    }  else if(result[0].status === 'TRANSACTION DONE'){
                    res.send('TRANSACTION HAS ALREADY DONE. THANK YOU!')
                    }  else {      
                    var newData = {bukti : req.file.path, status : 'ON PROSSES'}
                    var sqlb = `update history set ?
                            where id=${id} and username='${user}';`
                    db.query(sqlb, newData, (err1, result1) => {
                        if(err1) throw err1
                    res.send('Upload Bukti Pembayaran Berhasil')
                })
                    }}
                })
        } catch (err) {
            res.send(err)
        }
    },
    getStatus : (req, res) => {
        var sql = `select * from paymentstatus`;
        db.query(sql, (err, result) => {
            if (err) throw err
            res.send(result)
        })
    },
    getPayment : (req, res) => {
        var sql = `select status from history where username='${req.query.username}';`
        db.query(sql, (err, result) => {
            if(err) throw err
            req.send(result)
        })
    }
}