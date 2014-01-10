$(document).ready(function($){
    $('#fileinput').on('change', function(event) {
        readMultipleFiles(event);
    });
});

function readMultipleFiles(event) {
    $('#wrap').empty();
    //Retrieve all the files from the FileList object
    var files = event.target.files,
        output = $("#wrap");

    if (files) {
        for (var i = 0, f; f = files[i]; i++) {
            var reader = new FileReader();
            reader.onload = (function (f) {
                return function (e) {
                    var contents = e.target.result,
                        filename = f.name,
                        extension = filename.substr( (filename.lastIndexOf('.') +1) );

                    $('#wrap').append('filename: ' + filename + '<br />');
                    $('#wrap').append('extension: ' + extension + '<br />');

                    //console.log('contents: ', contents);

                    // choose the right parser
                    switch(extension) {

                        case 'm3u':
                            parseM3u(contents);
                            break;
                        case 'pls':

                            break;
                        case 'txt':

                            break;

                        case 'xml': // Native Instruments: Traktor
                            parseXml(contents);
                            break;
                        case 'nml': // Native Instruments: Traktor
                            parseXml(contents);
                            break;
                        case 'asx': // Windows Media Player

                            break;
                        case 'wpl': // Windows Media Player

                            break;
                    }
                };
            })(f);
            reader.readAsText(f);
        }
    } else {
        alert("Failed to load files");
    }
}

var parseXml = function(contents) {
    var i = 0, j = i,
        xml = $.parseXML(contents),
        fileFilter = 'ENTRY',
        fileArtist = '',
        fileTitle = '';

    $(xml).find(fileFilter).each(function() {
        // extract the needed content
        fileArtist = $(this).attr('ARTIST');
        fileTitle = $(this).attr('TITLE');

        // only execute if artis or title are present
        if(fileArtist || fileTitle) {
            i++;
            j = (i < 10 ? j = '0' + i : j = i);
            // append it to the DOM
            sendOutput(i, j, fileArtist, fileTitle);
        }
    });
}

var parseM3u = function(contents) {
    var i = 0, j = i, k = i,
        m3u = contents,
        fileComment = '#EXTINF',
        fileArtist = '',
        fileTitle = '',
        fileLine = '',
        currLine = '',
        outLine = '',
        lines = '';

    // Regular expressions
    var lineEx = /[\r\n]+/g, // tolerate both Windows and Unix linebreaks
        matchEx = /([^,]*),(.*)/m,
        splitEx = /-(.+)?/;

    // let's go!
    lines = m3u.split(lineEx);
    for(i; i < lines.length; i++) {
        fileLine = lines[i].indexOf(fileComment);
        if (fileLine === 0) {
            k++;
            j = (k < 10 ? j = '0' + k : j = k);
            currLine = lines[i].match(matchEx);
            outLine = currLine[2];
            fileArtist = outLine.split(splitEx)[0];
            fileTitle = outLine.split(splitEx)[1];
            // append it to the DOM
            sendOutput(k, j, fileArtist, fileTitle);
        }
    }
}

var sendOutput = function(i, j, artist, title) {
    var fileOutput = '';
    fileOutput += j + '. - ';
    fileOutput += '<input type="text" name="artist" id="+i+" value="' + artist.trim() + '">';
    fileOutput += ' - ';
    fileOutput += '<input type="text" name="title" id="+i+" value="' + title.trim() + '">';
    fileOutput += '<br />';
    $('#wrap').append(fileOutput);
}

/*
--- m3u working example - Extended M3U ---
#EXTM3U
#EXTINF:123, Sample artist - Sample title
C:\Documents and Settings\I\My Music\Sample.mp3
#EXTINF:321,Example Artist - Example title
C:\Documents and Settings\I\My Music\Greatest Hits\Example.ogg
*/
