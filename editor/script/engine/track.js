/*
TODO
- experiment with registering new types of content??
*/

registerCard(function(card) {
	card.name = "track";

	var testTune = [
		440, 523.25, 587.33, 659.25,
		698.46, 783.99, 880.00, 987.77,
		440, 523.25, 880.00, 987.77,
		698.46, 783.99, 587.33, 659.25,
	];

	var testTuneIndexed = [
		0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
		8, 6, 3, 1,
	];

	var noteFrequencies = [
		261.63, // C (octave 4)
		277.18, // C#
		293.66, // D
		311.13, // D#
		329.63, // E
		349.23, // F
		369.99, // F#
		392.00, // G
		415.30, // G#
		440.00, // A
		466.16, // A#
		493.88, // B
	];

	var noteCode = {
		"C" : 0,
		"C#" : 1,
		"D" : 2,
		"D#" : 3,
		"E" : 4,
		"F" : 5,
		"F#" : 6,
		"G" : 7,
		"G#" : 8,
		"A" : 9,
		"A#" : 10,
		"B" : 11,
	};

	var curTrack = null;

	var trackIndex = 0;
	var trackLen = 16;
	var noteLen = 400; // default is 120 bpm right now -- where should this be stored?

	// todo : name? beat, play, step, onbeat, run, next, roll
	card.roll = function() {
		if (!curTrack || !(curTrack in track)) {
			return;
		}

		var instruction = track[curTrack].instructions[trackIndex];

		if (instruction.op === "0") { // todo : give this a note code?
			// rest
			sound.stopChannel();
		}
		else {
			var note = noteCode[instruction.op];
			var freq = noteFrequencies[note];
			sound.setChannel(freq);
			sound.playChannel(noteLen);
		}

		trackIndex = (trackIndex + 1) % trackLen;
	};

	// hacky to expose?
	card.getNoteCode = function(noteId) {
		return noteCode[noteId];
	};

	card.getNoteFromCode = function(code) {
		return Object.keys(noteCode)[code];
	};

	// SUPER HACKY
	card.getCurNote = function() {
		return trackIndex;
	}

	// todo : name? play, change? what about if we want silence?
	card.setTrack = function(id) {
		curTrack = id;
		trackIndex = 0;
	}
});