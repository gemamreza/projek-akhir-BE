var multer = require('multer')

const storageConfig = multer.diskStorage({
    // FILE MAU DISIMPAN DIMANA
    destination : (req,file,cb) => {
        cb(null , './uploads')
    } ,
    // NAMA FILE
    filename : (req,file,cb) => {
        cb(null , 'PRD-' + Date.now() + '.' + file.mimetype.split('/')[1])
    } 
})

const filterConfig = (req, file, cb) => {
    if(file.mimetype.split('/')[1] === 'png' || file.mimetype.split('/')[1] === 'jpeg'){
        cb(null, true)
    }else{
        req.validation = {error : true , msg : 'File must be an image!'}
        cb(null, false)
    }
}

// STORAGE UNTUK MENGATUR PENYIMPANAN DAN NAMA FILE
// UNTUK FILTERING JENIS FILE
// UKURAN
var upload = multer({storage : storageConfig , fileFilter : filterConfig})

module.exports = upload