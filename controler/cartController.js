const db = require('./../database')
const transporter = require('./../helper/nodemailer')
const Currency = require('format-currency')
const fs = require('fs')
const pdf = require('html-pdf')
const hbars = require('handlebars')

module.exports = {
        addToCart : (req, res) => {
            var data = req.body
            var sql = `select * from cart where username='${data.username}' and id_produk=${data.id_produk};`
                db.query(sql, (err, result) => {
                    try{
                        if(result.length > 0) {
                            var quantity= result[0].qty+data.qty

                            var sql2=`update cart set qty=${quantity} where username='${data.username}' and id_produk=${data.id_produk}`
                            db.query(sql2, (err1, result1) => {
                                if(err1) throw err1
                                res.send('Berhasil Edit QTY')
                            })
                        } else {
                            var sql3 = `insert into cart set ?`
                            db.query(sql3, data, (err3, result3) => {
                                if(err3) throw err3
                                res.send('Berhasil Menambahkan ke Cart')
                            })
                        }
                        } catch (err){
                            console.log(err)
                        } 
                } )
        },
        getCart : (req, res) => {
            var username = req.query.username
            var sql = `select cart.id, cart.id_produk, cart.username, p.nama, p.harga, p.diskon, qty from cart
                        join products as p on id_produk = p.id where cart.username='${username}'; `
            db.query(sql, (err, result) => {
                if(err) throw err
                res.send(result)
            })
        },
        editCart : (req, res) => {
            var id = req.params.id
            var qty = req.body.qty
            var sql = `update cart set qty=${qty} where id = ${id};`
            db.query(sql, (err, result) => {
                if(err) throw err
                res.send('Berhasil Edit Cart')
            })
        },
        deleteCart : (req, res) => {
            var id = req.params.id
            var sql = `delete from cart where id=${id};`
            db.query(sql, (err, result) => {
                if(err) throw err
                res.send('Berhasil Delete Cart!')
            })
        },
        countCart : (req, res) => {
            var sql = `select count(*) as count from cart where username='${req.query.username}';`
            db.query(sql, (err, result) => {
                if(err) throw err
                res.send(result)
            })
        },
        checkOut : (req, res) => {
            var date = new Date()
            var day = date.getDate()
            var month = date.getMonth()
            var year = date.getFullYear()

            var monthName = ['January','February','March','April','May','June','July','August','September', 'October', 'Desember']
            var tanggal = day + ' ' + monthName[month] + ' ' + year + ' ' + date.getHours() + ' : ' + date.getMinutes() + ' : ' + date.getSeconds()
            var data = req.body
            data.status = 'NOT YET PAID'
            var newData = {
                ...data,
                tanggal
            }
            var sql = `insert into history set ?`
            db.query(sql, newData, (err, result) => {
                try{
                if(err) throw err
                console.log(result)
                var sqla = `select cart.id, id_produk, username, p.nama, p.harga, p.diskon, qty from cart
                            join products p on id_produk = p.id where username='${newData.username}';`
                db.query(sqla, (err1, result1) => {
                    if(err1) throw err1
                    var sqlb = `select id from history where username='${newData.username}' and tanggal='${newData.tanggal}';`
                    db.query(sqlb, (err2, result2) => {
                        if(err2) throw err2
                        var id = result2[0].id
                        var newArray = []
                        result1.map((val) => {
                            newArray.push(`(${id},${val.id_produk},${val.qty}, ${val.harga - (val.harga * (val.diskon/100))})`)
                        })
                        var sqlc = `insert into historydetail (id_order, id_produk, qty, total) values ${newArray.join(',')};`
                        db.query(sqlc, (err3, result3) => {
                            if(err3) throw err3
                            var idArray = []
                            result1.map((val) => {
                                idArray.push(val.id)
                            }) 
                            var sqld = `delete from cart where id in (${idArray.join(',')})`
                            db.query(sqld, (err4, result4) => {
                                if(err4) throw err4
                                var sqle = `select email from users where username = '${data.username}';`
                                db.query(sqle, (err5, result5) => {
                                    if(err5) throw err5
                                    var id = result2[0].id
                                    var sqlf = `select total from history where id=${id};`
                                    db.query(sqlf, (err6, result6) => {
                                        if(err6) throw err6
                                        var idorder = result2[0].id
                                        console.log(idorder)
                                        var totalharga = result6[0].total
                                        var email = result5[0].email
                                        var sqlg = `select h.id, p.nama, p.harga, h.tanggal, p.diskon, qty, hd.total from historydetail as hd
                                                    join products p on id_produk = p.id 
                                                    join history h on id_order = h.id where id_order=${idorder};`
                                        db.query(sqlg, (err7, result7) => {
                                            if(err7) throw err7
                                            console.log(result7)
                                            fs.readFile('./pdf/invoice.html' , {encoding : 'utf-8'}, (err8, pdfResult) => {
                                                if(err8) throw err8
                                                var invoice = hbars.compile(pdfResult)
                                                var newArr = []
                                                result7.map((val, index) => {
                                                    newArr.push({
                                                        no : index+1,
                                                        nama : val.nama,
                                                        harga : Currency(val.harga),
                                                        tanggal : val.tanggal,
                                                        diskon : val.diskon,
                                                        qty : val.qty,
                                                        total : Currency(val.total),
                                                        totalharga : Currency(totalharga)
                                                    })
                                                })
                                                var data = {
                                                    newArr,
                                                    totalharga
                                                }
                                               var hasilHbars = invoice(data)
                                               var options = {
                                                format : 'A4',
                                                orientation : 'landscape',
                                                border : {
                                                    "top": "0.5in",          
                                                    "right": "0.5in",
                                                    "bottom": "0.5in",
                                                    "left": "0.5in"
                                                  }
                                                }
                                                pdf.create(hasilHbars, options).toStream((err9, hasilStream) => {
                                                    if(err9) throw err9
                                                    var optionsNod = {
                                                        from : 'gadgetmarket <www.gadget-market.com>',
                                                        to : email,
                                                        subject : 'Invoice Pembayaran',
                                                        html : `<h1>Ini adalah invoice untuk anda,
                                                                silakan klik link ini untuk pergi ke halaman Konfirmasi Pembayaran
                                                                Total belanja Anda adalah Rp. ${Currency(totalharga)} </h1>`,
                                                        attachments : [
                                                            {
                                                                filename : 'invoice.pdf',
                                                                content : hasilStream
                                                            }
                                                        ]
                                                    }
                                                    transporter.sendMail(optionsNod, (err10, resultMail) => {
                                                        if(err10) throw err10
                                                        res.send('Check Out Berhasil, Silakan Cek Email Anda.')
                                                    })
                                                })
                                            })
                                        })
                                    //     var total = result6[0].total
                                    //     var email = result5[0].email
                                    //     var mail = {
                                    //         from : 'gadgetmarket <gadgetmarket@gmail.com>',
                                    //         to : email,
                                    //         subject : 'INVOICE PEMBAYARAN',
                                    //         html : `<h1>Terimakasih Sudah Berbelanja di Toko Kami</h1>
                                                    
                                    //                 <p>Berikut total harga yang harus di transfer adalah Rp. ${Currency(total)} </p>`
                                    //     }
                                    //     transporter.sendMail(mail, (err7, result7) => {
                                    //         if(err7) throw err7
                                    //         res.send('Check Out Berhasil, Silakan Cek Email Anda.')
                                    //     })
                                    })
                                })
                            })
                        })
                    })
                })
                }catch (err) {
                    console.log(err)
                }
            })
        },
        showHistory : (req, res) => {
            var username = req.query.username
            var tanggal = req.query.tanggal
            var sql = `select id from history where username='${username}' and tanggal='${tanggal}';`
            db.query(sql, (err, result) => {
                if(err) throw err
                res.send(result)
            })
        }
}