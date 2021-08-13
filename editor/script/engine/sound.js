function Sound() {

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

	var curSong = ["C", "E", "G", "A", "G", "F", "D", "E"];
	var tempoBpm = 120; // 120 bpm = slow end of allegro
	var beatLengthMs = 60000 / tempoBpm;
	var noteLengthMs = beatLengthMs * 0.8;
	var noteIndex = 0;
	var beatCounter = 0;

	// is this how I want to structure this?
	this.Update = function(dt) {
		beatCounter += dt;

		if (beatCounter >= beatLengthMs) {
			var note = curSong[noteIndex];
			var freq = noteFrequencies[noteCode[note]];
			bitsyPlayNote(freq, noteLengthMs, 11, 75, -2);

			noteIndex = (noteIndex + 1) % curSong.length; // loop
			beatCounter = 0;
		}
	};

	this.PlayMusic = function(song) {
		curSong = song;
		noteIndex = 0;
	};
}