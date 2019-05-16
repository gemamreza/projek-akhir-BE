const db = require('../database')
const fs = require('fs')

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
        var sql = `update history set status='ON PROSSES' where id=${id};`
        db.query(sql, (err, result) => {
            if(err) throw err
            res.send('/product/transaction')
        })
    },
    updateCancelStatus : (req, res) => {
        var id = req.params.id
        var sql = `update history set status='ON PROSSES' where id=${id};`
        db.query(sql, (err, result) => {
            if(err) throw err
            res.send('/product/transaction')
        })
    },
    uploadTransaction : (req, res) => {
        try{
        var id = req.params.id
        // var username = req.params.username
        if(req.validation) throw req.validation
        if(req.file.size > 500000) throw {error : true, msg : "Image Too Large"}
        var newData = {bukti : req.file.path, status : 'TRANSACTION PAID'}
        var sql = `update history set ?
                   where id=${id};`
        db.query(sql, newData, (err, result) => {
            if(err) throw err
            res.send('Upload Bukti Pembayaran Berhasil')
        })
    } catch (err) {
        res.send(err)
    }
    }
}