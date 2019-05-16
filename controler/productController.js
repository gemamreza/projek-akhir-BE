const db = require('./../database')
const fs = require('fs')

module.exports = {
            addProduct : (req, res) => {
                try{
                    console.log(req.file)
                    if(req.validation) throw req.validation
                    if(req.file.size > 500000) throw {error : true , msg : 'Image too large'}

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
                var sql = `select * from products;`
                db.query(sql , (err,result) => {
                    if (err) throw err
                    res.send(result)
                })
            },
            editProduct : (req,res) => {
                var id = req.params.id
                if(req.file){
                    var data = JSON.parse(req.body.data)
                    var dataNew = {
                        nama : data.nama,
                        id_kategori : data.id_kategori,
                        deskripsi : data.deskripsi,
                        spesifikasi : data.spesifikasi,
                        harga  : data.harga,
                        diskon : data.diskon 
                    }
            
                    // UNTUK MENAMBAHKAN PROPERTI BARU DI OBJECT DATA
                    // {product_name , product_price, product_image}
                    dataNew.img = req.file.path
                    var sql2 = `update products set ? where id = ${id}`
                    db.query(sql2, dataNew , (err,result) => {
                        if(err) throw err
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
                   db.query(sql, (err , result) => {
                        if(err) throw err
                        res.send('Edit Data Success')
                    })
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
                var sql = `select id, id_kategori, nama, harga, diskon, img from products where id_kategori=${id};`
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
            }
}