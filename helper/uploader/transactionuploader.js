var multer = require('multer')

const storageConfig = multer.diskStorage({
    destination : (req,file,cb) => {
        cb(null , './uploads/transaction')
    } ,
    filename : (req,file,cb) => {
        cb(null , 'TRA-' + Date.now() + '.' + file.mimetype.split('/')[1])
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

var transaction = multer({storage : storageConfig , fileFilter : filterConfig})

module.exports = transaction