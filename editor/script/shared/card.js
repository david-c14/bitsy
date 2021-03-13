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

// TODO : I'm not sure this is the model I want for this
// this is sort of a push model, but maybe the UI should be pulling from the card??
menu.setName = function(name) {
	if (_curCardUI === null) {
		return;
	}

	_curCardUI.SetName(name);
}