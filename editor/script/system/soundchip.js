/*
TODO / NOTES
- what should the name of the parent directory be: system, hardware, api?
- square wave channel
- square wave properties
	- frequency
	- duty
	- length
	- volume?
- how should duty options be represented?
- what do I do about the global state in here?
*/

var audioContext;
var oscillator;

// todo : name? boot, init, start
function initSound() {
	audioContext = new AudioContext();
	oscillator = audioContext.createOscillator();
	oscillator.type = "square";
	oscillator.start();
}

// todo : how many channels? how should they be named?
// todo : what should length units be? seconds? ms?
function playSoundChannel(freq, len) {
	oscillator.frequency.setValueAtTime(freq, audioContext.currentTime); // frequency in hertz
	oscillator.connect(audioContext.destination);

	if (len) {
		setTimeout(stopSoundChannel, len);
	}
}

function stopSoundChannel() {
	oscillator.disconnect();
}