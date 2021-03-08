/*
TODO
- why is the config separate from the card definition?
- is "register" the term I want?
*/

registerCard(function(card) {
	card.name = "paint";

	// naming? how are these defined?
	card.categories = [ "avatar", "tile", "sprite", "item", ];

	var drawingId = null;
	var imageSource = null;
	var frameIndex = 0;

	var bigPixelSize = 16;

	function drawBigPixel(index, x, y) { // todo : add square drawing func?
		for (var pY = 0; pY < bigPixelSize; pY++) {
			for (var pX = 0; pX < bigPixelSize; pX++) {
				gfx.drawPixel(index, (x * bigPixelSize) + pX, (y * bigPixelSize) + pY);
			}
		}
	}

	card.draw = function() {
		gfx.clear(0);

		if (imageSource) {
			for (var y = 0; y < tilesize; y++) {
				for (var x = 0; x < tilesize; x++) {
					if (imageSource[frameIndex][y][x] > 0) {
						drawBigPixel(1, x, y);
					}

					// grid
					gfx.drawPixel(1, x * bigPixelSize, y * bigPixelSize);
				}
			}
		}
	}

	card.menu = function() {
		menu.add({
			control: "label",
			text: "test label",
		});
	};

	card.select = function(id) {
		// test stuff...
		var spr = sprite[id];
		drawingId = spr.drw;

		imageSource = renderer.GetImageSource(drawingId).slice();
	};
});