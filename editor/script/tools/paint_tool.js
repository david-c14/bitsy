/*
TODO
- why is the config separate from the card definition?
- is "register" the term I want?
*/

registerCard(function(card) {
	card.name = "paint";

	// todo : I don't like the name of this...
	card.useCanvas = true;

	card.menu = function() {
		menu.add({
			control: "label",
			text: "test label",
		});
	};
});