const {desktopCapturer} = require('electron')
const fs = require('fs')
var ACRCloud = require('../module/ACRCloud')
var chunks = []

var soundhound = function() {
    console.log('start capture, default capture time is 10s')
    desktopCapturer.getSources({types: ['screen']}, (error, sources) => {
        if (error) throw error
        for (var i = 0; i < sources.length; i++) {
            if (sources[i].name == 'Entire screen') {
                // Start to capture audio
                navigator.mediaDevices.getUserMedia({
                    audio: {
                        mandatory: {
                            chromeMediaSource: 'desktop'
                        }
                    },
                    video: {
                        mandatory: {
                            chromeMediaSource: 'desktop',
                            minWidth: 128,
                            maxWidth: 128,
                            minHeight: 72,
                            maxHeight: 72
                        }
                    }
                })
                .then((stream) => {
                    var mediaRecorder = new MediaRecorder(stream, {mimeType : 'video/webm'})
                    mediaRecorder.start()
                    var timeout = setTimeout(() => {
                        mediaRecorder.stop()
                        $('#stop').unbind('click')
                        console.log('stop capture')
                    }, 10000)

                    mediaRecorder.onstop = function(e) {
                        var blob = new Blob(chunks, { 'type' : 'video/webm' })
                        var reader = new FileReader()
                        reader.readAsArrayBuffer(blob)
                        reader.addEventListener("loadend", function() {
                            var result = reader.result
                            var buffer = Buffer.from(result)
                            ACRCloud.identify(buffer, (error, response, body) => {
                                if (error) throw error
                                var info = JSON.parse(body)
                                // Display the information
                                if (info.status.code != 0) {
                                    var errorString
                                    switch (info.status.code) {
                                        case 1001:
                                            errorString = i18n.__('SoundhoundStatus1001')
                                            break
                                        case 2000:
                                            errorString = i18n.__('SoundhoundStatus2000')
                                            break
                                        case 3000:
                                            errorString = i18n.__('SoundhoundStatus3000')
                                            break
                                        case 2005:
                                            errorString = i18n.__('SoundhoundStatus2005')
                                            break
                                        case 2004:
                                            errorString = i18n.__('SoundhoundStatus2004')
                                            break
                                        case 2002:
                                            errorString = i18n.__('SoundhoundStatus2002')
                                            break
                                        default:
                                            errorString = i18n.__('SoundhoundStatusUnknown')
                                            break
                                    }
                                    $('.container').html('<div class="row"><div class="col-12 text-center"><p><b>' + errorString + '</b></p></div></div>')
                                } else {
                                    var name = []
                                    for (var i = 0; i < info.metadata.music[0].artists.length; i++) name.push(info.metadata.music[0].artists[i].name)
                                    name = name.join(' & ')
                                    info.metadata.music[0].artists = name
                                    var html = `
                                    <div class="row text-center mt-1">
                                        <div class="col-4"><p style="font-size: 0.8em">${i18n.__('SoundhoundDivTitle')}</p></div>
                                        <div class="col-8"><p><b>${info.metadata.music[0].title}</b></p></div>
                                    </div>
                                    <div class="row text-center">
                                        <div class="col-4"><p style="font-size: 0.8em">${i18n.__('SoundhoundDivArtists')}</p></div>
                                        <div class="col-8"><p><b>${info.metadata.music[0].artists}</b></p></div>
                                    </div>
                                    <div class="row text-center">
                                        <div class="col-4"><p style="font-size: 0.8em">${i18n.__('SoundhoundDivAlbum')}</p></div>
                                        <div class="col-8"><p><b>${info.metadata.music[0].album.name}</b></p></div>
                                    </div>
                                    <div class="row text-center">
                                        <div class="col-4"><p style="font-size: 0.8em">${i18n.__('SoundhoundDivReleaseDate')}</p></div>
                                        <div class="col-8"><p><b>${info.metadata.music[0].release_date}</b></p></div>
                                    </div>
                                    `
                                    $('.container').html(html)
                                }
                                chunks = []
                            })
                        })
                    }

                    mediaRecorder.ondataavailable = function(e) {
                        chunks.push(e.data)
                    }

                    $('#stop').click( function () {
                        clearTimeout(timeout)
                        mediaRecorder.stop()
                        console.log('stop capture')
                    })
                })
                .catch((e) => {
                    console.log(e)
                })
                return
            }
        }
    })
}

soundhound()