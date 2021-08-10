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
var threshold;

// init audio context and square wave oscillator
audioContext = new AudioContext();

oscillator = audioContext.createOscillator();
oscillator.type = "square";

// experimenting with more complex stuff
// threshold = audioContext.createWaveShaper();
// var curve = new Float32Array(8);
// curve[0] = -1;
// curve[1] = -1;
// curve[2] = -1;
// curve[3] = -1;
// curve[4] = 1;
// curve[5] = 1;
// curve[6] = 1;
// curve[7] = 1;
// threshold.curve = curve;
// oscillator.connect(threshold);

oscillator.start();

var inputNode = oscillator;
var outputNode = oscillator;

function bitsyPlayNote(frequency, length) {
	inputNode.frequency.setValueAtTime(frequency, audioContext.currentTime); // frequency in hertz
	outputNode.connect(audioContext.destination);
	setTimeout(function() { outputNode.disconnect(); }, length);
}