// store if log categories are enabled
var DebugLogCategory = {
	bitsy : false,
	editor : false,
};

function bitsyLog(message, category) {
	if (!category) {
		category = "bitsy";
	}

	if (DebugLogCategory[category] === true) {
		console.log(category + "::" + message);
	}
}

/* SOUND */
var audioContext;
var oscillator;

// init audio context and square wave oscillator
audioContext = new AudioContext();
oscillator = audioContext.createOscillator();
oscillator.type = "square";
oscillator.start();

function bitsyPlayNote(frequency, length) {
	oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime); // frequency in hertz
	oscillator.connect(audioContext.destination);
	setTimeout(function() { oscillator.disconnect(); }, length);
}