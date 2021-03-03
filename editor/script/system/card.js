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




// HACKY sticking my prototype menu stuff in here...
var menu = {}; // todo : should this be just part of the card module?

function setCurCardView(cardUI) {
	_curCardUI = cardUI;
}

_curCardUI = null;

menu.add = function(options) {
	if (_curCardUI === null) {
		return;
	}

	// todo : now are we putting too much in the ui layer??
	_curCardUI.AddControl(options);
}

menu.startGroup = function() {
	if (_curCardUI === null) {
		return;
	}

	_curCardUI.StartGroup();
}

menu.endGroup = function() {
	if (_curCardUI === null) {
		return;
	}

	_curCardUI.EndGroup();
}