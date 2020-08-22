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
    $.ajax({
        type: "get",
        url: "/download",
        success: function (response) {
            console.log(response)
        }
    });
}

$(document).ready(function(){
    var files = [];
    $("#upload-file").change(function(){
        files = this.files;
    });
    $("#upload-btn").click(function(){
        preUploadFiles(files)
    });
});