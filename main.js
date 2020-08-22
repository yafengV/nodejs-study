const express = require("express")
const bodyParser = require("body-parser")
const opn = require("opn")
const multer  = require('multer')
const fs = require("fs")
const path = require("path")

var server = express()
server.use(bodyParser.json())
server.use(bodyParser.urlencoded({extended:false}))
server.use(express.static("./public"))

const delDir = function(path){
    let files = [];
    if(fs.existsSync(path)){
        files = fs.readdirSync(path);
        files.forEach((file, index) => {
            let curPath = path + "/" + file;
            if(fs.statSync(curPath).isDirectory()){
                delDir(curPath); //递归删除文件夹
            } else {
                fs.unlinkSync(curPath); //删除文件
            }
        });
        fs.rmdirSync(path);
    }
}

const uploadFolder = "./uploads";
const outputFolder = "./output"

const cleanData = function(){
    delDir(uploadFolder)
    delDir(outputFolder)
    fs.mkdirSync(uploadFolder)
    fs.mkdirSync(outputFolder)
};

cleanData();

// 通过 filename 属性定制
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadFolder);    // 保存的路径，备注：需要自己创建
    },
    filename: function (req, file, cb) {
        // 将保存文件名设置为 字段名 + 时间戳，比如 logo-1478521468943
        cb(null, Date.now() + "-" + file.originalname);  
    }
});
// 通过 storage 选项来对 上传行为 进行定制化
var upload = multer({ storage: storage })

//设置跨域访问
server.all('*', function(req, resp, next) {
    resp.setHeader('Content-Type','text/plain');
    resp.setHeader('Access-Control-Allow-Origin', "*")
    resp.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

server.post("/parser", function (req, resp) {
    console.log(req.body)
    resp.send('success')
})

server.post('/preUpload', function(req, resp){
    cleanData()
    resp.send({success: true})
})

server.post('/upload', upload.array('file'), function(req, res){
    var files = req.files

    for (const file of files) {
        console.log('文件类型：%s', file.mimetype);
        console.log('文件名：%s', file.filename);
        console.log('文件大小：%s', file.size);
        console.log('文件保存路径：%s', file.path);

        fs.copyFileSync(file.path, "./output/"+file.filename)
    }

    res.send({success: true});
});

server.get('/download', function(req, resp) {
    if (fs.existsSync(outputFolder)) {
        var files = fs.readdirSync(outputFolder)
        for (const file of files) {
            const filePath = path.resolve(path.join(outputFolder, file))
            if (fs.lstatSync(filePath).isFile) {
                resp.download(filePath)
            }
        }
    }
})

server.listen(5000, function(){
    console.log('server running')
})

opn("http://localhost:5000/index.html")

