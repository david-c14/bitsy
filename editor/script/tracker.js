// tracker tool card

registerCard(function(card) {
	card.name = "tracker"; // name? tracker-tool?

	var curTrack = "1"; // hack : hardcoded

	// draw loop
	card.draw = function() {
		// console.log("draw!!");

		// use default bitsy palette
		gfx.setPaletteColor(0, 0, 82, 204);
		gfx.setPaletteColor(1, 128, 159, 255);
		gfx.setPaletteColor(2, 255, 255, 255);

		// clear screen
		gfx.clear(0);

		// mock tracker ui
		for (var row = 0; row < 4; row ++) {
			for (var col = 0; col < 4; col ++) {
				var trackIndex = (row * 4) + col;
				var instruction = track[curTrack].instructions[trackIndex];

				gfx.drawPixel(1, 15 + (col * 32), 15 + (row * 32));

				if (instruction != null) {
					// hacky! (many reasons including global access of trackCard)
					var offset = trackCard.getNoteCode(instruction.op);
					gfx.drawPixel(2, 15 + (col * 32) + offset, 15 + (row * 32));
				}
			}
		}
	};
});