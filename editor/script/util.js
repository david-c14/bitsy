/* UTILS
miscellaneous utility functions for the editor
TODO: encapsulate in an object maybe? or is that overkill?
*/

function clamp(val, min, max) {
	return Math.max(Math.min(val, max), min);
}

// drawing utils
var TileType = {
	Tile : "TIL",
	Sprite : "SPR",
	Avatar : "AVA",
	Item : "ITM",
};

// todo : localize
function tileTypeToString(type) {
	if (type == TileType.Tile) {
		return "tile";
	}
	else if (type == TileType.Sprite) {
		return "sprite";
	}
	else if (type == TileType.Avatar) {
		return "avatar";
	}
	else if (type == TileType.Item) {
		return "item";
	}
}

function tileTypeToIdPrefix(type) {
	if (type == TileType.Tile) {
		return "TIL_";
	}
	else if (type == TileType.Sprite || type == TileType.Avatar) {
		return "SPR_";
	}
	else if (type == TileType.Item) {
		return "ITM_";
	}
}

function getDrawingDescription(d) {
	return tileTypeToString(d.type) + " " + d.id;
}

function getDrawingNameOrDescription(d) {
	return d.name ? d.name : getDrawingDescription(d);
}

// this seems not that helpful anymore..
function getDrawingDialogId(d) {
	var dialogId = null;

	if (d.type === TileType.Sprite || d.type === TileType.Item) {
		dialogId = d.dlg;
	}

	return dialogId;
}

function copyDrawingData(sourceDrawingData) {
	var copiedDrawingData = [];

	for (frame in sourceDrawingData) {
		copiedDrawingData.push([]);
		for (y in sourceDrawingData[frame]) {
			copiedDrawingData[frame].push([]);
			for (x in sourceDrawingData[frame][y]) {
				copiedDrawingData[frame][y].push(sourceDrawingData[frame][y][x]);
			}
		}
	}

	return copiedDrawingData;
}