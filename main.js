const express = require("express")
const bodyParser = require("body-parser")
const opn = require("opn")
const multer  = require('multer')
const fs = require("fs")
const path = require("path")
const jszip = require("jszip")

const zip = new jszip()

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
        startZIP(outputFolder, (zipPath) => {
            resp.download(zipPath, (error)=>{
                console.error(error)
            })
        })
    }
})

server.get('/downloadTest', function(req, resp){
    var params = req.query
    console.log(params)
    var path = __dirname  + '/output/' + params.filename
    resp.download(path, (error) => {
        console.log(error)
    })
})

server.listen(5000, function(){
    console.log('server running')
})

opn("http://localhost:5000/index.html")

//读取目录及文件
const readDir = function(obj, nowPath) {
    let files = fs.readdirSync(nowPath);//读取目录中的所有文件及文件夹（同步操作）
    files.forEach(function (fileName, index) {//遍历检测目录中的文件
        console.log(fileName, index);//打印当前读取的文件名
        let fillPath = nowPath + "/" + fileName;
        let file = fs.statSync(fillPath);//获取一个文件的属性
        if (file.isDirectory()) {//如果是目录的话，继续查询
            let dirlist = zip.folder(fileName);//压缩对象中生成该目录
            readDir(dirlist, fillPath);//重新检索目录文件
        } else {
            obj.file(fileName, fs.readFileSync(fillPath));//压缩目录添加文件
        }
    });
}

//开始压缩文件
const startZIP = function(dir, callback) {
    var currPath = __dirname;//文件的绝对路径 当前当前js所在的绝对路径
    var targetDir = path.join(currPath, dir);
    readDir(zip, targetDir);
    zip.generateAsync({//设置压缩格式，开始打包
        type: "nodebuffer",//nodejs用
        compression: "DEFLATE",//压缩算法
        compressionOptions: {//压缩级别
            level: 9
        }
    }).then(function (content) {
        var zipPath = targetDir  + "/result.zip"
        fs.writeFileSync(zipPath, content, "utf-8");//将打包的内容写入 当前目录下的 result.zip中
        callback(zipPath)
    });
}
