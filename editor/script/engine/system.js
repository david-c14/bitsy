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
var squareWaveNode;
var volumeNode;

// volume
var volumeMax = 0.15;
var volumeMin = 0.0;
var volumeIncrement = 0.01;
var volumeInterval = null;

// init audio context and square wave oscillator
audioContext = new AudioContext();

squareWaveNode = audioContext.createOscillator();
squareWaveNode.type = "square";

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

volumeNode = audioContext.createGain();
volumeNode.gain.value = volumeMin;

squareWaveNode.connect(volumeNode);
squareWaveNode.start();

var inputNode = squareWaveNode;
var outputNode = volumeNode;

function bitsyPlayNote(frequency, length, envelopeStart, envelopeStepTime, envelopeIncrement) {
	volumeNode.gain.value = (envelopeStart * volumeIncrement); // todo : min & max, etc

	if (volumeInterval != null) {
		clearInterval(volumeInterval);
	}

	volumeInterval = setInterval(
		function() { volumeNode.gain.value = Math.max(volumeMin, volumeNode.gain.value + (envelopeIncrement * volumeIncrement)); },
		envelopeStepTime);

	inputNode.frequency.setValueAtTime(frequency, audioContext.currentTime); // frequency in hertz
	outputNode.connect(audioContext.destination);

	setTimeout(function() { outputNode.disconnect(); }, length);
}