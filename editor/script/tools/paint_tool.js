/*
TODO
- why is the config separate from the card definition?
- is "register" the term I want?

categories
- should they be part of the system?
- or handled by the card?
- to what extent are they part of the engine?
- how to handle localization and icons?
- it might help to have some kind of global worldData storage thingy

todo : what about localization??

todo : what's the best way to handle config for cards (especially pre-load config? is there pre-load config?)
*/

registerCard(function(card) {
	card.name = "paint";

	// naming? how are these defined? (data?)
	card.data = [ "AVA", "TIL", "SPR", "ITM", ];

	var dataStorage = {
		"AVA" : { store: sprite, filter: function(id) { return (id === "A"); }, },
		"SPR" : { store: sprite, filter: function(id) { return (id != "A"); }, },
		"TIL" : { store: tile, },
		"ITM" : { store: item, },
	};

	var curDataType = "AVA";
	var dataId = "A";
	var drawingId = null;
	var imageSource = null;
	var frameIndex = 0;

	var bigPixelSize = 16;
	var showGrid = true;

	// todo : will this be needed in the end? name?? (boot, load, start, init??)
	card.boot = function() {
		onSelect(dataId);
	};

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

					if (showGrid) {
						gfx.drawPixel(2, x * bigPixelSize, y * bigPixelSize);
					}
				}
			}
		}
	}

	card.click = function(x, y) {
		// convert screen coords to drawing coords
		var pX = Math.floor(x / bigPixelSize);
		var pY = Math.floor(y / bigPixelSize);

		imageSource[frameIndex][pY][pX] = (imageSource[frameIndex][pY][pX] > 0) ? 0 : 1;

		// somewhat hacky
		renderer.SetImageSource(drawingId, imageSource);

		// super hacky..
		refreshGameData();
	};

	card.menu = function() {
		menu.add({
			control: "toggle",
			text: "grid",
			icon: showGrid ? "visibility" : "visibility_off",
			value: showGrid,
			onclick: "toggleGrid",
		});

		menu.startGroup();

		menu.add({
			control: "label",
			text: "animation: ",
		});

		menu.add({
			control: "button",
			text: "frame 1",
			onclick: "onFrame1",
		});

		menu.add({
			control: "button",
			text: "frame 2",
			onclick: "onFrame2",
		});

		menu.endGroup();
	};

	card.toggleGrid = function(value) {
		showGrid = value;
	};

	card.onFrame1 = function() {
		frameIndex = 0;
	};

	card.onFrame2 = function() {
		frameIndex = 1;
	};

	card.prev = function() {
		var idList = Object.keys(dataStorage[curDataType].store);

		if (dataStorage[curDataType].filter) {
			idList = idList.filter(dataStorage[curDataType].filter);
		}

		var i = idList.indexOf(dataId);

		i--;
		if (i < 0) {
			i = (idList.length - 1);
		}

		onSelect(idList[i]);
	};

	card.next = function() {
		var idList = Object.keys(dataStorage[curDataType].store);

		if (dataStorage[curDataType].filter) {
			idList = idList.filter(dataStorage[curDataType].filter);
		}

		var i = idList.indexOf(dataId);

		i++;
		if (i >= idList.length) {
			i = 0;
		}

		onSelect(idList[i]);
	};

	card.add = function() {
		// TODO
	};

	card.copy = function() {
		// TODO
	};

	// todo : name too short??
	card.del = function() {
		// TODO
	};

	card.changeDataType = function(type) {
		console.log("data change! " + type);
		curDataType = type;

		var idList = Object.keys(dataStorage[curDataType].store);

		if (dataStorage[curDataType].filter) {
			idList = idList.filter(dataStorage[curDataType].filter);
		}

		onSelect(idList[0]);
	};

	function onSelect(id) {
		dataId = id;
		drawingId = dataStorage[curDataType].store[dataId].drw;
		imageSource = renderer.GetImageSource(drawingId).slice();
		frameIndex = 0;
	};

	// TODO : this might return once I have a universal way to handle data type navigation
	// card.select = function(id) {}
});