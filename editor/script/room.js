/*
	ROOM
*/

/*
TODO:
drawingId -> drawingId.id
paintMode -> drawingId.type

what other methods do I need to move into this class? exit stuff??
- exits
- endings
- items
- etc.
*/
function RoomTool(canvas) {
	var self = this; // feels a bit hacky

	var curDrawingId = "A"; // TODO.. change this initial ID later?
	function GetCurDrawing(){
		return object[curDrawingId];
	}
	events.Listen("select_drawing", function(event) {
		curDrawingId = event.id;
		// TODO... what else needs to go here?
	});

	// edit flags
	var isDragAddingTiles = false;
	var isDragDeletingTiles = false;

	// render flags
	this.drawMapGrid = true;
	this.drawCollisionMap = false;
	this.areMarkersVisible = false;

	this.markers = null;

	function onMouseDown(e) {
		var off = getOffset(e);
		off = mobileOffsetCorrection(off,e,(tilesize*mapsize*scale));
		var x = Math.floor( off.x / (tilesize*scale) );
		var y = Math.floor( off.y / (tilesize*scale) );
		// console.log(x + " " + y);

		if( self.editDrawingAtCoordinateCallback != null && e.altKey ) {
			self.editDrawingAtCoordinateCallback(x,y); // "eye dropper"
			return;
		}

		var isEditingMarker = false;

		if (self.areMarkersVisible) {
			if (self.markers.IsPlacingMarker()) {
				if (!self.markers.IsMarkerAtLocation(x,y)) {
					self.markers.PlaceMarker(x,y);
					self.drawEditMap();
				}
				isEditingMarker = true;
			}
			else if (self.markers.TrySelectMarkerAtLocation(x,y)) {
				self.markers.StartDrag(x,y);
				self.drawEditMap();
				isEditingMarker = true;
			}
		}

		if (!isEditingMarker && GetCurDrawing().id != null) {
			//add tiles/sprites to map
			// TODO ... see if I can consolidate this code so there is less duplication
			if (GetCurDrawing().type === TileType.Tile) {
				if (room[curRoom].tilemap[y][x] === "0") {
					console.log("ADD");
					//add
					//row = row.substr(0, x) + drawingId + row.substr(x+1);
					console.log( room[curRoom].tilemap );
					room[curRoom].tilemap[y][x] = GetCurDrawing().id;
					isDragAddingTiles = true;
				}
				else {
					//delete (better way to do this?)
					//row = row.substr(0, x) + "0" + row.substr(x+1);
					room[curRoom].tilemap[y][x] = "0";
					isDragDeletingTiles = true;
				}
				//room[curRoom].tilemap[y] = row;
			}
			// TODO... avatar case
			else if (GetCurDrawing().type === TileType.Sprite) {
				var otherSprite = getSpriteAt(x,y);
				var isThisSpriteAlreadyHere = sprite[GetCurDrawing().id].room === curRoom &&
											sprite[GetCurDrawing().id].x === x &&
											sprite[GetCurDrawing().id].y === y;

				if (otherSprite) {
					//remove other sprite from map
					sprite[otherSprite].room = null;
					sprite[otherSprite].x = -1;
					sprite[otherSprite].y = -1;
				}

				if (!isThisSpriteAlreadyHere) {
					//add sprite to map
					sprite[GetCurDrawing().id].room = curRoom;
					sprite[GetCurDrawing().id].x = x;
					sprite[GetCurDrawing().id].y = y;
					//row = row.substr(0, x) + "0" + row.substr(x+1); //is this necessary? no
				}
				else {
					//remove sprite from map
					sprite[GetCurDrawing().id].room = null;
					sprite[GetCurDrawing().id].x = -1;
					sprite[GetCurDrawing().id].y = -1;
				}
			}
			else if (GetCurDrawing().type == TileType.Item ) {
				// TODO : is this the final behavior I want?

				var otherItem = getItem(curRoom,x,y);
				var isThisItemAlreadyHere = otherItem != null && otherItem.id === GetCurDrawing().id;

				if(otherItem) {
					getRoom().objects.splice( getRoom().objects.indexOf(otherItem), 1 );
				}

				if(!isThisItemAlreadyHere) {
					getRoom().objects.push( {id:GetCurDrawing().id, x:x, y:y} );
				}
			}
			refreshGameData();
			self.drawEditMap();
		}
	}

	function onMouseMove(e) {
		if( self.markers.GetSelectedMarker() != null && self.markers.IsDraggingMarker() ) {
			// drag marker around
			var off = getOffset(e);
			off = mobileOffsetCorrection(off,e,(tilesize*mapsize*scale));
			var x = Math.floor(off.x / (tilesize*scale));
			var y = Math.floor(off.y / (tilesize*scale));

			self.markers.ContinueDrag(x,y);
			self.drawEditMap();
		}
		else {
			editTilesOnDrag(e);
		}
	}

	function onMouseUp(e) {
		editTilesOnDrag(e);
		isDragAddingTiles = false;
		isDragDeletingTiles = false;

		self.markers.EndDrag();
	}

	function editTilesOnDrag(e) {
		var off = getOffset(e);
		off = mobileOffsetCorrection(off,e,(tilesize*mapsize*scale));
		var x = Math.floor(off.x / (tilesize*scale));
		var y = Math.floor(off.y / (tilesize*scale));
		// var row = room[curRoom].tilemap[y];
		if (isDragAddingTiles) {
			if ( room[curRoom].tilemap[y][x] != GetCurDrawing().id ) {
				// row = row.substr(0, x) + drawingId + row.substr(x+1);
				// room[curRoom].tilemap[y] = row;
				room[curRoom].tilemap[y][x] = GetCurDrawing().id;
				refreshGameData();
				self.drawEditMap();
			}
		}
		else if (isDragDeletingTiles) {
			if ( room[curRoom].tilemap[y][x] != "0" ) {
				// row = row.substr(0, x) + "0" + row.substr(x+1);
				// room[curRoom].tilemap[y] = row;
				room[curRoom].tilemap[y][x] = "0";
				refreshGameData();
				self.drawEditMap();
			}
		}
	}

	function onTouchStart(e) {
		e.preventDefault();
		// console.log(e.touches[0]);
		var fakeEvent = { target:e.target, clientX:e.touches[0].clientX, clientY:e.touches[0].clientY };
		// console.log(fakeEvent);
		onMouseDown( fakeEvent );
	}

	function onTouchMove(e) {
		e.preventDefault();
		var fakeEvent = { target:e.target, clientX:e.touches[0].clientX, clientY:e.touches[0].clientY };
		onMouseMove( fakeEvent );
	}

	function onTouchEnd(e) {
		e.preventDefault();
		// var fakeEvent = { target:e.target, clientX:e.touches[0].clientX, clientY:e.touches[0].clientY };
		// map_onMouseUp( fakeEvent );
		isDragAddingTiles = false;
		isDragDeletingTiles = false;
	}

	this.editDrawingAtCoordinateCallback = null;

	var mapEditAnimationLoop;

	this.listenEditEvents = function() {
		canvas.addEventListener("mousedown", onMouseDown);
		canvas.addEventListener("mousemove", onMouseMove);
		canvas.addEventListener("mouseup", onMouseUp);
		canvas.addEventListener("mouseleave", onMouseUp);
		canvas.addEventListener("touchstart", onTouchStart);
		canvas.addEventListener("touchmove", onTouchMove);
		canvas.addEventListener("touchend", onTouchEnd);

		mapEditAnimationLoop =
			setInterval( function() {
				if (!isPlayMode) {
					animationCounter = animationTime + 1; // hack
					updateAnimation();
					self.drawEditMap();
				}
				else {
					console.log("BLINKY BUG :(");
					self.unlistenEditEvents(); // hacky attempt to prevent blinky bug (not sure what the real cause is)
				}
			}, animationTime ); // update animation in map mode
	}

	this.unlistenEditEvents = function() {
		canvas.removeEventListener("mousedown", onMouseDown);
		canvas.removeEventListener("mousemove", onMouseMove);
		canvas.removeEventListener("mouseup", onMouseUp);
		canvas.removeEventListener("mouseleave", onMouseUp);
		canvas.removeEventListener("touchstart", onTouchStart);
		canvas.removeEventListener("touchmove", onTouchMove);
		canvas.removeEventListener("touchend", onTouchEnd);

		clearInterval( mapEditAnimationLoop );
	}

	this.drawEditMap = function() {
		//clear screen
		ctx.fillStyle = "rgb("+getPal(curPal())[0][0]+","+getPal(curPal())[0][1]+","+getPal(curPal())[0][2]+")";
		ctx.fillRect(0,0,canvas.width,canvas.height);

		//draw map
		drawRoom( room[curRoom] );

		//draw grid
		if (self.drawMapGrid) {
			ctx.fillStyle = getContrastingColor();
			for (var x = 1; x < mapsize; x++) {
				ctx.fillRect(x*tilesize*scale,0*tilesize*scale,1,mapsize*tilesize*scale);
			}
			for (var y = 1; y < mapsize; y++) {
				ctx.fillRect(0*tilesize*scale,y*tilesize*scale,mapsize*tilesize*scale,1);
			}
		}

		//draw walls
		if (self.drawCollisionMap) {
			ctx.fillStyle = getContrastingColor();
			for (y in room[curRoom].tilemap) {
				for (x in room[curRoom].tilemap[y]) {
					if( isWall(x,y,curRoom) ) {
						ctx.fillRect(x*tilesize*scale,y*tilesize*scale,tilesize*scale,tilesize*scale);
					}
				}
			}
		}

		//draw exits (and entrances) and endings
		if (self.areMarkersVisible) {
			var w = tilesize * scale;
			var markerList = self.markers.GetMarkerList();

			for (var i = 0; i < markerList.length; i++) {
				var marker = markerList[i]; // todo name
				marker.Draw(ctx,curRoom,w,self.markers.GetSelectedMarker() == marker);
			}

			ctx.globalAlpha = 1;
		}
	}

	events.Listen("palette_change", function(event) {
		self.drawEditMap();
	});
} // RoomTool()

/* METHODS */
function togglePlayMode(e) {
	if (e.target.checked) {
		on_play_mode();
	}
	else {
		on_edit_mode();
	}

	updatePlayModeButton();
}
/* TODO 
- make a PlayModeController objec?
- share:
	- on_play_mode
	- on_edit_mode
*/