// tracker tool card

registerCard(function(card) {
	card.name = "tracker"; // name? tracker-tool?

	// draw loop
	card.draw = function() {
		// console.log("draw!!");

		// use default bitsy palette
		gfx.setPaletteColor(0, 0, 82, 204);
		gfx.setPaletteColor(1, 128, 159, 255);
		gfx.setPaletteColor(2, 255, 255, 255);

		// clear screen
		gfx.clear(0);

		gfx.drawPixel(1, 0, 0);
		gfx.drawPixel(1, 8, 8);
		gfx.drawPixel(2, 16, 16);
		gfx.drawPixel(2, 127, 127);
	};
});