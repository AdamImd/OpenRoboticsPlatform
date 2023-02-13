function $(doc) {
    return document.getElementById(doc);
}

window.addEventListener("load", async function () {
    $("iframe_load").onclick = function () {
        $("sensor_iframe").src = "https://192.168.0.1/w/sensor_iframe.html"
    }
});

