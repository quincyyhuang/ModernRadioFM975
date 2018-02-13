var audio = document.getElementById('audio')
const electron = require('electron')
let app = electron.remote.app
var currentStatus = 'pause'
var hls = null
var playOrPause = function () {
    if (currentStatus == 'pause') {
        hls = new Hls()
        hls.loadSource('http://live.xmcdn.com/live/73/64.m3u8')
        hls.attachMedia(audio)
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
            audio.play()
        })
        $("#playButton").removeClass("oi-media-play").addClass("oi-media-stop")
        currentStatus = 'play'
    } else if (currentStatus == 'play') {
        audio.pause()
        hls.destroy()
        $("#playButton").removeClass("oi-media-stop").addClass("oi-media-play")
        currentStatus = 'pause'
    }
}

$("#playButton").click(playOrPause)
if (app.db.get('autoplay').value()) $("#playButton").click()