/*
TODO / NOTES
- what should the name of the parent directory be: system, hardware, api?
- square wave channel
- square wave properties
	X frequency
	- duty (currently stuck at 50%)
	- length
	- volume?
- how should duty options be represented?
- what do I do about the global state in here?
- allow changes to duty (aka "pulse width") of square wave
- misc ideas:
	- arpeggiator
	- randomizer for notes
	- somehow play SFX as notes?
		- or allow an SFX track.. (this may be easier)
	- wild idea: (script callback track -- could be used for the sfx thing)

idea for icon:
SPR b
00000000
11111111
11111111
10100101
11111111
11000011
10111101
00000000
NAME cassette
*/

// public
var sound = {};

// private
var _audioContext;
var _oscillator;

// methods
// todo : name? boot, init, start
sound.init = function() {
	_audioContext = new AudioContext();
	_oscillator = _audioContext.createOscillator();
	_oscillator.type = "square";
	_oscillator.start();
}

sound.setChannel = function(freq) {
	_oscillator.frequency.setValueAtTime(freq, _audioContext.currentTime); // frequency in hertz
}

sound.stopChannel = function() {
	_oscillator.disconnect();
}

// todo : how many channels? how should they be named?
// todo : what should length units be? seconds? ms?
sound.playChannel = function(len) {
	_oscillator.connect(_audioContext.destination);

	if (len) {
		setTimeout(sound.stopChannel, len);
	}
}