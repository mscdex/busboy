
Description
===========

A node.js module for parsing incoming HTML form data.


Requirements
============

* [node.js](http://nodejs.org/) -- v0.8.0 or newer


Install
============

    npm install busboy


Examples
========

* Parsing (multipart) with default options:

```javascript
var http = require('http'),
    inspect = require('util').inspect;

var Busboy = require('busboy');

http.createServer(function(req, res) {
  if (req.method === 'POST') {
    var busboy = new Busboy({ headers: req.headers });
    busboy.on('file', function(fieldname, file, filename) {
      console.log('File [' + fieldname +']: filename: ' + filename);
      file.on('data', function(data) {
        console.log('File [' + fieldname +'] got ' + data.length + ' bytes');
      });
      file.once('end', function() {
        console.log('File [' + fieldname +'] Finished');
      });
    });
    busboy.on('field', function(fieldname, val, valTruncated, keyTruncated) {
      console.log('Field [' + fieldname + ']: value: ' + inspect(val));
    });
    busboy.once('end', function() {
      console.log('Done parsing form!');
      res.writeHead(303, { Connection: 'close', Location: '/' });
      res.end();
    });
    req.pipe(busboy);
  } else if (req.method === 'GET') {
    res.writeHead(200, { Connection: 'close' });
    res.end('<html><head></head><body>\
               <form method="POST" enctype="multipart/form-data">\
                <input type="text" name="textfield"><br />\
                <input type="file" name="filefield"><br />\
                <input type="submit">\
              </form>\
            </body>');
  }
}).listen(8000, function() {
  console.log('Listening for requests');
});

// Example output, using http://nodejs.org/images/ryan-speaker.jpg as the file:
//
// Listening for requests
// File [filefield]: filename: ryan-speaker.jpg
// File [filefield] got 11971 bytes
// Field [textfield]: value: 'testing! :-)'
// File [filefield] Finished
// Done parsing form!
```

* Parsing (urlencoded) with default options:

```javascript
var http = require('http'),
    inspect = require('util').inspect;

var Busboy = require('busboy');

http.createServer(function(req, res) {
  if (req.method === 'POST') {
    var busboy = new Busboy({ headers: req.headers });
    busboy.on('file', function(fieldname, file, filename) {
      console.log('File [' + fieldname +']: filename: ' + filename);
      file.on('data', function(data) {
        console.log('File [' + fieldname +'] got ' + data.length + ' bytes');
      });
      file.once('end', function() {
        console.log('File [' + fieldname +'] Finished');
      });
    });
    busboy.on('field', function(fieldname, val, valTruncated, keyTruncated) {
      console.log('Field [' + fieldname + ']: value: ' + inspect(val));
    });
    busboy.once('end', function() {
      console.log('Done parsing form!');
      res.writeHead(303, { Connection: 'close', Location: '/' });
      res.end();
    });
    req.pipe(busboy);
  } else if (req.method === 'GET') {
    res.writeHead(200, { Connection: 'close' });
    res.end('<html><head></head><body>\
               <form method="POST">\
                <input type="text" name="textfield"><br />\
                <select name="selectfield">\
                  <option value="1">1</option>\
                  <option value="10">10</option>\
                  <option value="100">100</option>\
                  <option value="9001">9001</option>\
                </select><br />\
                <input type="checkbox" name="checkfield">Node.js rules!<br />\
                <input type="submit">\
              </form>\
            </body>');
  }
}).listen(8000, function() {
  console.log('Listening for requests');
});

// Example output:
//
// Listening for requests
// Field [textfield]: value: 'testing! :-)'
// Field [selectfield]: value: '9001'
// Field [checkfield]: value: 'on'
// Done parsing form!
```


API
===

_Busboy_ is a _WritableStream_

Busboy (special) events
-----------------------

* **file**(< _string_ >fieldname, < _ReadableStream_ >stream, < _string_ >filename) - Emitted for each new file form field found.

* **field**(< _string_ >fieldname, < _string_ >value, < _boolean_ >valueTruncated, < _boolean_ >fieldnameTruncated) - Emitted for each new non-file field found.


**Note:** The `stream` passed in on the 'file' event will also emit a 'limit' event (no arguments) if the `fileSize` limit is reached. If this happens, no more data will be available on the stream.


Busboy methods
--------------

* **(constructor)**(< _object_ >config) - Creates and returns a new Busboy instance with the following valid `config` settings:

    * **headers** - _object_ - These are the HTTP headers of the incoming request, which are used by individual parsers.

    * **highWaterMark** - _integer_ - highWaterMark from WritableStream (Default: WritableStream default).

    * **limits** - _object_ - Various limits on incoming data. Valid properties are:

        * **fieldNameSize** - _integer_ - Max field name size (Default: 100 bytes).

        * **fieldSize** - _integer_ - Max field value size (Default: 1MB).

        * **fields** - _integer_ - Max number of non-file fields (Default: Infinity).

        * **fileSize** - _integer_ - For multipart forms, the max file size (Default: Infinity).

        * **files** - _integer_ - For multipart forms, the max number of file fields (Default: Infinity).

        * **parts** - _integer_ - For multipart forms, the max number of parts (fields + files) (Default: Infinity).
