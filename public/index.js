function onClick() {
    $.ajax({
        type: "POST",
        url: "/parser",
        data: {data:'hello world'},
        success: function (response) {
            alert(response)
            console.log(response)
        }
    });
}

function preUploadFiles(files) {
    $.ajax({
        type: "post",
        url: "/preUpload",
        success: function (response) {
            const result = JSON.parse(response)
            if (result.success) {
                uploadFiles(files)
            }
        }
    });
}

function uploadFiles(files) {
    var fd = new FormData();
    for (var i = 0; i < files.length; i++) {
        var file = files[i]
        fd.append("file", file);
    }
    $.ajax({
        url: "/upload",
        method: "POST",
        data: fd,
        contentType: false,
        processData: false,
        cache: false,
        success: function(data){
            const obj = JSON.parse(data)
            if(obj.success) {
                downloadFiles()
            }
        }
    });
}

function downloadFiles() {
    download('', 'download')
}

function downloadTest() {
    download('test.txt', 'downloadTest')
}


function download(filename, path) {
    var href = path
    if (filename.length > 0) {
        href += '?filename='+ filename
    }
    var element = document.createElement('a');
    element.setAttribute('href', href);
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

$(document).ready(function(){
    var files = [];
    $("#upload-file").change(function(){
        files = this.files;
    });
    $("#upload-btn").click(function(){
        preUploadFiles(files)
    });
    $('#download-btn').click(function(){
        downloadTest()
    })
});