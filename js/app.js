(function() {
  var dropZone = document.getElementById("drop-zone");
  var AudioContext = window.AudioContext || window.webkitAudioContext;
  var tracks = {};
  var trackId = 0;

  dropZone.addEventListener("dragover", function(e) {
    e.preventDefault();
    return false;
  });

  dropZone.addEventListener("drop", function(e) {
    // Swallow the event
    e.preventDefault();
    e.stopPropagation();

    var fileName = e.dataTransfer.files[0].name;
    dropZone.innerHTML = "Loading..." + fileName;
    
    // Set up the reader
    var reader = new FileReader();
    reader.onload = function (result) {
      dropZone.innerHTML = "Drop songs here.";
      return loadSong(fileName, result.target.result);
    };
    reader.onerror = function(e) {
      dropZone.innerHTML = "Error loading. See console for more details.";
      return console.log(reader.error);
    };
    reader.readAsArrayBuffer(e.dataTransfer.files[0]);

    return false;
  });

  var trackTemplate = document.getElementById('track-template').innerHTML;
  Mustache.parse(trackTemplate);

  var loadSong = function(name, data) {
    var ctx = new AudioContext();
    ctx.decodeAudioData(data, function(buffer) {
      // Create a new track
      var source = setupSource(ctx, buffer);
      source.start(0);

      var id = trackId++;
      tracks[id] = {
        context: ctx,
        source: source,
        buffer: buffer,
        playing: true
      };

      // Create the element from the template
      var rendered = Mustache.render(trackTemplate, {
        name: name,
        id: id
      });

      var trackDiv = document.createElement('div');
      trackDiv.classList.add('track');
      trackDiv.id = 'track-' + id;
      trackDiv.innerHTML = rendered;
      document.body.appendChild(trackDiv);

      // Set up the play stop button
      var playStopButton = document.querySelector('#track-' + id + ' .play-stop-button', trackDiv);
      playStopButton.addEventListener('click', function(e) {
        var track = tracks[id];
        if (track.playing) {
          track.playing = false;
          playStopButton.innerHTML = "Start"
          track.source.stop(0);
          track.source = null;
        } else {
          track.playing = true;
          playStopButton.innerHTML = "Stop"
          track.source = setupSource(track.context, track.buffer);
          track.source.start(0);
        }
        // Swallow the event
        e.preventDefault();
        e.stopPropagation();
        return false;
      });
    });
  };

  var setupSource = function(ctx, buffer) {
    var source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    return source;
  };

}).call(this);