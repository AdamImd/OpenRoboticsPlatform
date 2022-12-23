function $(doc) {
    return document.getElementById(doc);
}

window.onload = function () {
    document.getElementById("editor_code_doc_start").onclick = function () {
        button = this;
        button.onclick = null;
        var req = new XMLHttpRequest();
        req.onreadystatechange = function() { button.innerText += "." };
        req.onloadend = function () {
            if(this.status != 200){
                button.innerText = "ERROR: " + this.status + "(" + this.response.length + ")";
                this.open("GET", "./editor.js", true);
                this.send();
                return;
            }
            $("editor_code_doc").removeChild(button);
            eval(this.response);
        };
        button.innerText = "Loading";
        req.timeout = 0;
        req.open("GET", "./editor.js", true);
        req.send();
    };

    editor_nav_init();
};

function editor_nav_init() {
    nav = $("editor_nav_tree");
    tree = "";
    var req = new XMLHttpRequest();
    req.onloadend = function () {
        if(this.status == 200){
            path = ["/u/"]
            this.response.split("\x1F").forEach(element => {
                if(element.length != 0) {
                    if(element[0] == "\x1D"){
                        //console.log("Dir: " + element.substring(1));
                        tree += '<li> <span class="caret">'+
                        element.substring(1) + '/</span> <ul class="nested"> ';
                        path.push(path[path.length-1] + element.substring(1) + "/");
                    }
                    else if(element[0] == "\x1C"){
                        //console.log("File: " + element.substring(1));
                        tree += '<li id="' + path[path.length-1] + element.substring(1) + 
                             '" class="nav_file">-' + element.substring(1) + '</li>';
                    }
                    else if(element[0] == "\x1E"){
                        //console.log("End of Dir")
                        tree += '</ul></li>';
                        path.pop();
                    }        
                }
                nav.innerHTML = tree;
                folders = document.getElementsByClassName("caret")
                for(var i = 0; i < folders.length; i++){
                    folders.item(i).addEventListener("click", function() {
                        this.parentElement.querySelector(".nested").classList.toggle("active");
                        this.classList.toggle("caret-down");
                    });
                };
                files = document.getElementsByClassName("nav_file")
                for(var i = 0; i < files.length; i++){
                    files.item(i).addEventListener("click", function(event) {
                        if(!event.ctrlKey){
                            selected = document.getElementsByClassName("nav_selected")
                            len = selected.length;
                            for(var i = 0; i < len; i++){
                                selected.item(0).classList.remove("nav_selected");
                            }
                        }
                        this.classList.add("nav_selected");
                    });
                    files.item(i).addEventListener("dblclick", function() {
                        console.log(this.id);
                        editor_open_file(this.id)
                    });
                };
             });
        }

    }
    req.timeout = 0;
    req.open("GET", "./tree.bin", true);
    req.send();
}

function editor_open_file(file_path){
    console.log(file_path);
    socket = new WebSocket("ws://" + location.hostname + ":81/");
    socket.binaryType = "arraybuffer";
    socket.addEventListener("message", function(event){
        //console.log(LZString.decompressFromUint8Array(event.data));
        console.log(event.data);
        //socket.close();
    });
    socket.addEventListener("error", function(event){
        console.log(event);
        socket.close();
    });

    buffer = new ArrayBuffer(128)
    buffer_num = new Uint16Array(buffer);
    buffer_chr = new Uint8Array(buffer);
    buffer_num[0] = 1;
    for (let i = 0; i  < file_path.length; i++) {
        buffer_chr[2+i] = Math.min(file_path.charCodeAt(i), 255);
        console.log(file_path.charCodeAt(i))
    }

    socket.addEventListener("open", function(event){
        socket.send(buffer);
    });
}



function command_send_num(num){
    LZString.compressToUint8Array()
}


//https://github.com/pieroxy/lz-string/blob/master/libs/lz-string.min.js
var LZString=function(){function o(o,r){if(!t[o]){t[o]={};for(var n=0;n<o.length;n++)t[o][o.charAt(n)]=n}return t[o][r]}var r=String.fromCharCode,n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",e="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$",t={},i={compressToBase64:function(o){if(null==o)return"";var r=i._compress(o,6,function(o){return n.charAt(o)});switch(r.length%4){default:case 0:return r;case 1:return r+"===";case 2:return r+"==";case 3:return r+"="}},decompressFromBase64:function(r){return null==r?"":""==r?null:i._decompress(r.length,32,function(e){return o(n,r.charAt(e))})},compressToUTF16:function(o){return null==o?"":i._compress(o,15,function(o){return r(o+32)})+" "},decompressFromUTF16:function(o){return null==o?"":""==o?null:i._decompress(o.length,16384,function(r){return o.charCodeAt(r)-32})},compressToUint8Array:function(o){for(var r=i.compress(o),n=new Uint8Array(2*r.length),e=0,t=r.length;t>e;e++){var s=r.charCodeAt(e);n[2*e]=s>>>8,n[2*e+1]=s%256}return n},decompressFromUint8Array:function(o){if(null===o||void 0===o)return i.decompress(o);for(var n=new Array(o.length/2),e=0,t=n.length;t>e;e++)n[e]=256*o[2*e]+o[2*e+1];var s=[];return n.forEach(function(o){s.push(r(o))}),i.decompress(s.join(""))},compressToEncodedURIComponent:function(o){return null==o?"":i._compress(o,6,function(o){return e.charAt(o)})},decompressFromEncodedURIComponent:function(r){return null==r?"":""==r?null:(r=r.replace(/ /g,"+"),i._decompress(r.length,32,function(n){return o(e,r.charAt(n))}))},compress:function(o){return i._compress(o,16,function(o){return r(o)})},_compress:function(o,r,n){if(null==o)return"";var e,t,i,s={},p={},u="",c="",a="",l=2,f=3,h=2,d=[],m=0,v=0;for(i=0;i<o.length;i+=1)if(u=o.charAt(i),Object.prototype.hasOwnProperty.call(s,u)||(s[u]=f++,p[u]=!0),c=a+u,Object.prototype.hasOwnProperty.call(s,c))a=c;else{if(Object.prototype.hasOwnProperty.call(p,a)){if(a.charCodeAt(0)<256){for(e=0;h>e;e++)m<<=1,v==r-1?(v=0,d.push(n(m)),m=0):v++;for(t=a.charCodeAt(0),e=0;8>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}else{for(t=1,e=0;h>e;e++)m=m<<1|t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t=0;for(t=a.charCodeAt(0),e=0;16>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}l--,0==l&&(l=Math.pow(2,h),h++),delete p[a]}else for(t=s[a],e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;l--,0==l&&(l=Math.pow(2,h),h++),s[c]=f++,a=String(u)}if(""!==a){if(Object.prototype.hasOwnProperty.call(p,a)){if(a.charCodeAt(0)<256){for(e=0;h>e;e++)m<<=1,v==r-1?(v=0,d.push(n(m)),m=0):v++;for(t=a.charCodeAt(0),e=0;8>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}else{for(t=1,e=0;h>e;e++)m=m<<1|t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t=0;for(t=a.charCodeAt(0),e=0;16>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1}l--,0==l&&(l=Math.pow(2,h),h++),delete p[a]}else for(t=s[a],e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;l--,0==l&&(l=Math.pow(2,h),h++)}for(t=2,e=0;h>e;e++)m=m<<1|1&t,v==r-1?(v=0,d.push(n(m)),m=0):v++,t>>=1;for(;;){if(m<<=1,v==r-1){d.push(n(m));break}v++}return d.join("")},decompress:function(o){return null==o?"":""==o?null:i._decompress(o.length,32768,function(r){return o.charCodeAt(r)})},_decompress:function(o,n,e){var t,i,s,p,u,c,a,l,f=[],h=4,d=4,m=3,v="",w=[],A={val:e(0),position:n,index:1};for(i=0;3>i;i+=1)f[i]=i;for(p=0,c=Math.pow(2,2),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;switch(t=p){case 0:for(p=0,c=Math.pow(2,8),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;l=r(p);break;case 1:for(p=0,c=Math.pow(2,16),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;l=r(p);break;case 2:return""}for(f[3]=l,s=l,w.push(l);;){if(A.index>o)return"";for(p=0,c=Math.pow(2,m),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;switch(l=p){case 0:for(p=0,c=Math.pow(2,8),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;f[d++]=r(p),l=d-1,h--;break;case 1:for(p=0,c=Math.pow(2,16),a=1;a!=c;)u=A.val&A.position,A.position>>=1,0==A.position&&(A.position=n,A.val=e(A.index++)),p|=(u>0?1:0)*a,a<<=1;f[d++]=r(p),l=d-1,h--;break;case 2:return w.join("")}if(0==h&&(h=Math.pow(2,m),m++),f[l])v=f[l];else{if(l!==d)return null;v=s+s.charAt(0)}w.push(v),f[d++]=s+v.charAt(0),h--,s=v,0==h&&(h=Math.pow(2,m),m++)}}};return i}();"function"==typeof define&&define.amd?define(function(){return LZString}):"undefined"!=typeof module&&null!=module&&(module.exports=LZString);