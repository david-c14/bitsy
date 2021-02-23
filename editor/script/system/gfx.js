/*
TODO
- naming
- api
*/

// public
var gfx = {};

var gfxAttachCanvas = function(canvas) {
	canvas.width = 512; // hardcoded :(
	canvas.height = 512;
	_context = canvas.getContext("2d");
};

// private
var _context;
var _palette = [
	[0, 0, 0],
	[255, 255, 255],
	[255, 255, 255],
];

// methods
gfx.setPaletteColor = function(index, r, g, b) { // todo : rgb? hex? other format?
	_palette[index] = [r, g, b];
};

gfx.clear = function(index) {
	_context.fillStyle = "rgb(" + _palette[index][0] + "," + _palette[index][1] + "," + _palette[index][2] + ")";
	_context.fillRect(0, 0, 512, 512);
};