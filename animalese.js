// animalese.js
// (C) 2014 Josh Simmons
// http://github.com/acedio/animalese.js

var letterSecsForFile = {
  "animalese.wav": 0.15,
  "borges.wav": 0.32,
};

var Animalese = function (letters_file, onload) {
  this.Animalese = function (script, shorten, pitch, bpm) {
    function shortenWord(str) {
      if (str.length > 1) {
        return str[0] + str[str.length - 1];
      }
      return str;
    }

    var processed_script = script;
    if (shorten) {
      processed_script = script
        .replace(/[^a-z]/gi, " ")
        .split(" ")
        .map(shortenWord)
        .join("");
    }

    var data = [];

    var sample_freq = 44100;
    var library_letter_secs = letterSecsForFile[letters_file];
    var library_samples_per_letter = Math.floor(
      library_letter_secs * sample_freq
    );
    var output_letter_secs = letterSecsForFile[letters_file]; //0.075;
    var output_samples_per_letter = Math.floor(
      output_letter_secs * sample_freq
    );
    const samples_per_beat = Math.floor((60 / +bpm) * sample_freq);
    if (output_samples_per_letter > samples_per_beat) {
      output_samples_per_letter = samples_per_beat;
    }

    // Write out a beat's worth of samples each iteration.
    for (var c_index = 0; c_index < processed_script.length; c_index++) {
      var c = processed_script.toUpperCase()[c_index];
      const base_offset = c_index * samples_per_beat;
      if (c >= "A" && c <= "Z") {
        var library_letter_start =
          library_samples_per_letter * (c.charCodeAt(0) - "A".charCodeAt(0));

        for (var i = 0; i < output_samples_per_letter; i++) {
          data[base_offset + i] = this.letter_library[
            44 + library_letter_start + Math.floor(i * pitch)
          ];
        }
      } else {
        // non pronouncable character or space
        for (var i = 0; i < output_samples_per_letter; i++) {
          data[base_offset + i] = 127;
        }
      }
      for (var j = output_samples_per_letter; j < samples_per_beat; ++j) {
        data[base_offset + j] = 127;
      }
    }

    var wave = new RIFFWAVE();
    wave.header.sampleRate = sample_freq;
    wave.header.numChannels = 1;
    wave.Make(data);

    return wave;
  };

  var xhr = new XMLHttpRequest();
  xhr.open("GET", letters_file);
  xhr.responseType = "arraybuffer";
  var req = this;
  xhr.onload = function (e) {
    req.letter_library = new Uint8Array(this.response);
    onload();
  };
  xhr.send();
};
