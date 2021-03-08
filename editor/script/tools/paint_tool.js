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
		// use current palette
		var r = room[curRoom];
		var colors = palette[r.pal].colors;
		// console.log(colors);
		gfx.setPaletteColor(0, colors[0][0], colors[0][1], colors[0][2]);
		gfx.setPaletteColor(1, colors[1][0], colors[1][1], colors[1][2]);
		gfx.setPaletteColor(2, colors[2][0], colors[2][1], colors[2][2]);

		gfx.clear(0);

		if (imageSource) {
			for (var y = 0; y < tilesize; y++) {
				for (var x = 0; x < tilesize; x++) {
					if (imageSource[frameIndex][y][x] > 0) {
						drawBigPixel(1, x, y);
					}

					// grid
					gfx.drawPixel(2, x * bigPixelSize, y * bigPixelSize);
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