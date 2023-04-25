var init = async function init(){
    await require("/w/com/print.js");
    await require_HTTP("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js");
    await require_HTTP("https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js");

    videoElement = $("video");

    const pose = new Pose({locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
    }});
    pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: true,
        smoothSegmentation: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });
    pose.onResults(onResults);

    const camera = new Camera(videoElement, {
        onFrame: async () => {
            await pose.send({image: videoElement});
        },
        width: 1280,
        height: 720
    });
    camera.start();
};

function onResults(results) {
    if (!results.poseLandmarks) {
        grid.updateLandmarks([]);
        return;
    }
}

init();