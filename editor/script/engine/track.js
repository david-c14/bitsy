registerCard(function(card) {
	card.name = "track";

	var testTune = [
		440, 523.25, 587.33, 659.25,
		698.46, 783.99, 880.00, 987.77,
		440, 523.25, 880.00, 987.77,
		698.46, 783.99, 587.33, 659.25,
	];

	var trackIndex = 0;
	var trackLen = 16;
	var noteLen = 400; // default is 120 bpm right now -- where should this be stored?

	// todo : name? beat, play, step, onbeat, run, next, roll
	card.roll = function() {
		sound.setChannel(testTune[trackIndex]);
		sound.playChannel(noteLen);

		trackIndex = (trackIndex + 1) % trackLen;
	};
});