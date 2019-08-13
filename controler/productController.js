const db = require('./../database')
const fs = require('fs')

module.exports = {
            addProduct : (req, res) => {
                try{
                    if(req.validation) throw req.validation
                    if(req.file.size > 500000) throw {error : true , msg : "Image Too Large, Must 500kB or Below."}

                    var newData = JSON.parse(req.body.product)
                    newData.img = req.file.path
                    var sql = 'insert into products set ?'
                    db.query(sql,newData, (err,result) => {
                        if(err) throw err
                        res.send('Sukses!')
                    })
                }catch(err){
                    res.send(err)
                }
                        
            },
            getAll : (req, res ) => {
                var sql = `select p.id, p.nama, p.id_kategori, p.deskripsi, p.spesifikasi, p.harga, p.diskon, p.img, c.category from products as p
                           join category as c on id_kategori = c.id;`
                db.query(sql , (err,result) => {
                    if (err) throw err
                    res.send(result)
                })
            },
            editProduct : (req,res) => {
                try{
                    var id = req.params.id
                    if(req.validation) throw req.validation
                    if(req.file){
                        console.log(req.file)
                        var data = JSON.parse(req.body.data)
                        var dataNew = {
                            nama : data.nama,
                            id_kategori : data.id_kategori,
                            deskripsi : data.deskripsi,
                            spesifikasi : data.spesifikasi,
                            harga  : data.harga,
                            diskon : data.diskon 
                        }
                
                        dataNew.img = req.file.path
                        if(req.file.size > 500000) throw {error : true , msg : "Image Too Large, Must 500kB or Below."}
                        var sql2 = `update products set ? where id = ${id}`
                        db.query(sql2, dataNew , (err,result) => {
                            if(err) throw {error : true, msg : "Can't upload file"}
                            res.send('Update Data Success')
                            fs.unlinkSync(req.body.imageBefore)
                        })
                
                        }else{
                        var sql = `update products set 
                                   nama = '${req.body.nama}',
                                   id_kategori = ${req.body.id_kategori},
                                   deskripsi = '${req.body.deskripsi}',
                                   spesifikasi = '${req.body.spesifikasi}',
                                   harga = ${req.body.harga},
                                   diskon = ${req.body.diskon}
                                   where id = ${id}` 
                       db.query(sql, (err1 , result1) => {
                            if(err1) throw err1
                            res.send('Edit Data Success')
                        })
                    }
                }catch(err){
                    res.send(err)
                }
            },
            
            delete : (req,res)=>{
                var id = req.params.id
                var path = req.body.img
                    
                    sql1=`delete from products where id=${id}`
                    db.query(sql1, (err1,result1)=>{
                        try{
                            if(err1) throw err1
                            fs.unlinkSync(path) 
                            sql2 =' select * from products'
                            db.query(sql2, (err2, result2)=>{
                                try{
                                    if(err2) throw err2
                                    res.send(result2)
                                }
                                catch(err2){
                                    res.send(err2.message)
                                }
                            })
                        }
                        catch(err1){
                            res.send(err1.message)
                        }
                    })
            },
            getProductByCat : (req, res) => {
                var id = req.params.id
                var sql = `select p.id, id_kategori, c.category, nama, harga, diskon, img from  products as p
                           join category as c on id_kategori = c.id where id_kategori=${id};`
                db.query(sql, (err, result) => {
                    if(err) throw(err)
                    res.send(result)
                })
            },
            getProductByCatonAdmin : (req, res) => {
                var category = req.params.category
                var sql = `select p.id, id_kategori, nama, harga, deskripsi, spesifikasi, diskon, img, c.category from  products as p
                           join category as c on id_kategori = c.id where id_kategori=${category};`
                db.query(sql, (err, result) => {
                    if(err) throw(err)
                    res.send(result)
                })
            },
            getCategory : (req, res) => {
                var sql = `select * from category;`
                db.query(sql, (err, result) => {
                    if(err) throw(err)
                    res.send(result)
                })
            },
            addCategory : (req, res) => {
                var category = req.body.category
                var sql = `insert into category (category) values ('${category}');`
                db.query(sql, category, (err, result) => {
                    if(err) throw err
                    res.send('Tambah Kategori Berhasil!')
                })
            },
            deleteCategory : (req, res) => {
                var id = req.params.id
                var sql = `delete from category where id=${id};`
                db.query(sql, (err, result) => {
                    if(err) throw err
                    res.send('Hapus Kategori Sukses!')
                })
            },
            editCategory : (req, res) => {
                var id = req.params.id
                var nama = req.body.category
                var sql = `update category set category='${nama}' where id=${id};`
                db.query(sql, nama, (err, result) => {
                    if(err) throw err
                    res.send('Berhasil Edit') 
                })
            },
            getProductDetail : (req, res) => {
                var id = req.params.id
                var sql = `select id, nama, deskripsi, spesifikasi, harga, diskon, img from products where id=${id};`
                db.query(sql, (err, result) => {
                    if(err) throw err
                    res.send(result)
                })
            },
            addToLatestSeen : (req, res) => {
                var sql = `insert into lastseen (idproduk, username) values (${req.body.id},'${req.body.username}')`;
                db.query(sql, (err, result) => {
                    if(err) throw err
                    res.send(result)
                })
            },
            getLatestSeen : (req, res) => {
                var user = req.params.username
                var sql = `select l.id, p.id, p.nama, p.harga, p.diskon, p.img, u.username from lastseen as l
                           join products as p on idproduk = p.id
                           join users as u on l.username = u.username 
                           where l.username='${user}'
                           order by l.id desc
                           limit 3;`
                db.query(sql, (err, result) => {
                    if(err) throw err
                    res.send(result)
                })
            }
}