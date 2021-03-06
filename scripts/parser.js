$(document).ready(function($){
    $('#fileinput').on('change', function(event) {
        readMultipleFiles(event);
    });
});

var readMultipleFiles = function(event) {
    // Clear the DOM
    $('#playlist').empty();

    // Retrieve all the files from the FileList object
    var files = event.target.files;

    if (files) {
        for (var i = 0, f; f = files[i]; i++) {
            var reader = new FileReader();
            reader.onload = (function (f) {
                return function (e) {
                    var contents = e.target.result,
                        filename = f.name,
                        extension = filename.substr((filename.lastIndexOf('.')+1));

                    // Append additional info
                    $('#filename').empty().append('<h3>' + filename + '</h3> <span class="badge">' + extension + '</span>');

                    // Choose the right parser
                    switch(extension) {
                        case 'm3u':
                            parseM3u(contents);
                            break;
                        case 'pls':
                            parsePls(contents);
                            break;
                        case 'txt':

                            break;
                        case 'xml':
                            parseXml(contents, extension);
                            break;
                        case 'nml': // Native Instruments: Traktor
                            parseXml(contents, extension);
                            break;
                        case 'asx': // Windows Media Player
                            parseXml(contents, extension);
                            break;
                        case 'wpl': // Windows Media Player
                            parseWpl(contents);
                            break;
                    }
                };
            })(f);
            reader.readAsText(f);
        }
    } else {
        $('#playlist').append("Failed to load files");
    }
};

var parseXml = function(contents, extension) {
    var i = 0, j = i,
        fileFilter = 'entry',
        fileArtist = '',
        fileTitle = '',
        iDetect = false,
        iFilter = 'key',
        item = '';

    // Check if playlist comes from iTunes
    $(contents).find(iFilter).each(function() {
        fileFilter = iFilter;
        iDetect = true;
        return;
    });

    $(contents).find(fileFilter).each(function() {
        // Choose the right content parser
        if (iDetect) { // iTunes
            item = $(this).text();
            // Extract the needed content
            if(item === 'Name') {
                fileTitle = $(this).next().text();
                fileArtist = $(this).next().next().next().text();
            }
        } else {
            switch(extension) {
                case 'asx': // Windows Media Player
                    // Extract the needed content
                    fileArtist = $(this).find('author').text();
                    fileTitle = $(this).find('title').text();
                    break;
                case 'nml': // Native Instruments: Traktor
                    // Extract the needed content
                    fileArtist = $(this).attr('artist');
                    fileTitle = $(this).attr('title');
                    break;
            }
        }
        
        // Only execute if artist or title are present
        if(fileArtist || fileTitle) {
            i++;
            j = (i < 10 ? j = '0' + i : j = i);
            // Append it to the DOM
            sendOutput(i, j, fileArtist, fileTitle);
            // Reset the vars
            fileArtist = '';
            fileTitle = '';
        }
    });
};

var parseWpl = function(contents) {
    var i = 0, j = i,
        fileFilter = 'media',
        fileArtist = '',
        fileTitle = '',
        lineFilter = '',
        outLine = '';

    var splitEx = /-(.+)?/,
        uscoreEx = /_/g,
        extensionEx = /.mp3|.wma|.wav|.3gp|.aiff|.flac|.m4a|.ogg|.ra|.rm/gi;

    $(contents).find(fileFilter).each(function() {
        // Extract the needed content
        lineFilter = $(this).attr('src');

        outLine = lineFilter.substring(lineFilter.lastIndexOf('\\') + 1, lineFilter.length).replace(uscoreEx, ' ');
        fileArtist = outLine.split(splitEx)[0];
        fileTitle = outLine.split(splitEx)[1].replace(extensionEx,'');;

        // Only execute if artist or title are present
        if(fileArtist || fileTitle) {
            i++;
            j = (i < 10 ? j = '0' + i : j = i);
            // Append it to the DOM
            sendOutput(i, j, fileArtist, fileTitle);
        }
    });
};

var parseM3u = function(contents) {
    var i = 0, j = i, k = i,
        fileFilter = '#extinf',
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

    // Let's go!
    lines = contents.split(lineEx);
    for(i; i < lines.length; i++) {
        fileLine = lines[i].toLowerCase().indexOf(fileFilter);
        if (fileLine === 0) {
            k++;
            j = (k < 10 ? j = '0' + k : j = k);
            currLine = lines[i].match(matchEx);
            outLine = currLine[2];
            fileArtist = outLine.split(splitEx)[0];
            fileTitle = outLine.split(splitEx)[1];
            // Append it to the DOM
            sendOutput(k, j, fileArtist, fileTitle);
        }
    }
};

var parsePls = function(contents) {
    var i = 0, j = i, k = i,
        fileFilter = 'title',
        fileArtist = '',
        fileTitle = '',
        fileLine = '',
        currLine = '',
        outLine = '',
        lines = '';

    // Regular expressions
    var lineEx = /[\r\n]+/g, // tolerate both Windows and Unix linebreaks
        matchEx = /([^,]*)=(.*)/m,
        uscoreEx = /_/g,
        splitEx = /-(.+)?/;

    // Let's go!
    lines = contents.split(lineEx);
    for(i; i < lines.length; i++) {
        fileLine = lines[i].toLowerCase().indexOf(fileFilter);
        if (fileLine === 0) {
            k++;
            j = (k < 10 ? j = '0' + k : j = k);
            currLine = lines[i].match(matchEx);
            outLine = currLine[2].replace(uscoreEx, ' ');
            fileArtist = outLine.split(splitEx)[0];
            fileTitle = outLine.split(splitEx)[1];
            // Append it to the DOM
            sendOutput(k, j, fileArtist, fileTitle);
        }
    }
};

// Append to HTML
var sendOutput = function(i, j, artist, title) {
    var fileOutput = '';

    fileOutput += '<div class="input-group">\n';
    fileOutput += '<span class="input-group-addon">'+j+'</span>\n';
    fileOutput += '<div class="col-lg-6 inputLeft"><input type="text" class="form-control" name="artist" id="name_'+i+'" value="' + artist.trim() + '"></div>\n';
    fileOutput += '<div class="col-lg-6 inputLeft"><input type="text" class="form-control" name="title" id="title_'+i+'" value="' + title.trim() + '"></div>\n';
    fileOutput += '</div>';

    $('#playlist').append(fileOutput);
};

/*
--- *.m3u working example - Extended M3U ---
#EXTM3U
#EXTINF:123, Sample artist - Sample title
C:\Documents and Settings\I\My Music\Sample.mp3
#EXTINF:321,Example Artist - Example title
C:\Documents and Settings\I\My Music\Greatest Hits\Example.ogg
*/
