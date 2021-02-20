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

	var trackIndex = 0;
	var trackLen = 16;
	var noteLen = 400; // default is 120 bpm right now -- where should this be stored?

	// todo : name? beat, play, step, onbeat, run, next, roll
	card.roll = function() {
		var note = testTuneIndexed[trackIndex];
		var freq = noteFrequencies[note];

		sound.setChannel(freq);
		sound.playChannel(noteLen);

		trackIndex = (trackIndex + 1) % trackLen;
	};
});