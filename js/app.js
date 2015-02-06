(function() {
  var dropZone = document.getElementById("drop-zone");
  var AudioContext = window.AudioContext || window.webkitAudioContext;

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
      dropZone.innerHTML = "Loading complete, processing...";
      return loadSong(fileName, result.target.result);
    };
    reader.onerror = function(e) {
      dropZone.innerHTML = "Error loading. See console for more details.";
      return console.log(reader.error);
    };
    reader.readAsArrayBuffer(e.dataTransfer.files[0]);

    return false;
  });

  var loadSong = function(name, data) {
    var ctx = new AudioContext();
    ctx.decodeAudioData(data, function(buffer) {
      var source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
    });
  };

}).call(this);