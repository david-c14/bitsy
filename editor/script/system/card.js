/*
TODO / NOTES
- general decisions to make include...
	- what should the naming conventions be for the APIs? flat functions?? namespaced? uppercase or lowercase?
- what should the name of this system be?
	- card? io? sys?
*/

// public
function registerCard(initFunc) { // todo : should this be a free floating func?
	var c = {};
	initFunc(c);

	_cardRegistry[c.name] = initFunc;
}

var card = {};

// private
_cardRegistry = {}; // todo : name? cardInitRegistry?

// methods
card.load = function(name) { // todo : name? card.create()??
	var c = {};
	_cardRegistry[name](c);

	return c;
}