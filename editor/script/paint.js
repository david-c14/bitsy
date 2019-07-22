/*
	PAINT

TODO :
- create a select drawing event
- can I remove the reference to the room tool??
*/
function PaintTool(canvas) {
	// TODO : variables
	var self = this; // feels a bit hacky

	var paint_scale = 32;
	var curPaintBrush = 0;
	var isPainting = false;
	this.isCurDrawingAnimated = false; // TODO eventually this can be internal
	this.curDrawingFrameIndex = 0; // TODO eventually this can be internal
	this.drawPaintGrid = true;

	// engine object
	var curDrawingId = "A"; // TODO.. change this initial ID later?
	this.GetCurDrawing = function() {
		return object[curDrawingId];
	}
	events.Listen("select_drawing", function(event) {
		curDrawingId = event.id;
		// TODO... what else needs to go here?
	});

	// TODO: this is kind of a weird place for this to live
	this.GetCurDialogId = function() {
		// TODO : this can be simplified if I stop inferring the ID of dialog from the drawing ID
		var dialogId = null;
		if (self.GetCurDrawing().type === TileType.Sprite) {
			dialogId = object[self.GetCurDrawing().id].dlg;
			if(dialogId == null && dialog[self.GetCurDrawing().id] != null) {
				dialogId = self.GetCurDrawing().id;
			}
		}
		else if (self.GetCurDrawing().type === TileType.Item) {
			dialogId = object[self.GetCurDrawing().id].dlg;
		}
		return dialogId;
	}

	// renderer object access
	var imageSource = null;
	function ReloadImageSource() {
		if (renderer === null || renderer === undefined) {
			return;
		}

		imageSource = (renderer.GetImageSource(self.GetCurDrawing().drw)).slice();
	}
	function UpdateImageSource() {
		if (imageSource === null || imageSource === undefined) {
			return;
		}

		renderer.SetImageSource(self.GetCurDrawing().drw, imageSource);
	}
	function GetFrameData(frameIndex) {
		if (imageSource === null || imageSource === undefined) {
			ReloadImageSource();
		}

		return imageSource[frameIndex];
	}


	this.explorer = null; // TODO: hacky way to tie this to a paint explorer -- should use events instead

	//paint canvas & context
	canvas.width = tilesize * paint_scale;
	canvas.height = tilesize * paint_scale;
	var ctx = canvas.getContext("2d");

	// paint events
	canvas.addEventListener("mousedown", onMouseDown);
	canvas.addEventListener("mousemove", onMouseMove);
	canvas.addEventListener("mouseup", onMouseUp);
	canvas.addEventListener("mouseleave", onMouseUp);
	canvas.addEventListener("touchstart", onTouchStart);
	canvas.addEventListener("touchmove", onTouchMove);
	canvas.addEventListener("touchend", onTouchEnd);

	// TODO : 
	function onMouseDown(e) {
		if (isPlayMode) {
			return; //can't paint during play mode
		}

		console.log("PAINT TOOL!!!");
		console.log(e);

		var off = getOffset(e);

		off = mobileOffsetCorrection(off,e,(tilesize));

		var x = Math.floor(off.x);
		var y = Math.floor(off.y);

		// non-responsive version
		// var x = Math.floor(off.x / paint_scale);
		// var y = Math.floor(off.y / paint_scale);

		if (curDrawingData()[y][x] == 0) {
			curPaintBrush = 1;
		}
		else {
			curPaintBrush = 0;
		}
		curDrawingData()[y][x] = curPaintBrush;
		self.updateCanvas();
		isPainting = true;
	}

	function onMouseMove(e) {
		if (isPainting) {
			var off = getOffset(e);

			off = mobileOffsetCorrection(off,e,(tilesize));

			var x = Math.floor(off.x);// / paint_scale);
			var y = Math.floor(off.y);// / paint_scale);
			curDrawingData()[y][x] = curPaintBrush;
			self.updateCanvas();
		}
	}

	function onMouseUp(e) {
		console.log("?????");
		if (isPainting) {
			isPainting = false;
			updateDrawingData();
			refreshGameData();
			roomTool.drawEditMap(); // TODO : events instead of direct coupling

			if(self.explorer != null) {
				self.explorer.RenderThumbnail( self.GetCurDrawing().id );
			}
			if( self.isCurDrawingAnimated ) {
				renderAnimationPreview( roomTool.drawing.id );
			}
		}
	}

	function onTouchStart(e) {
		e.preventDefault();
		var fakeEvent = { target:e.target, clientX:e.touches[0].clientX, clientY:e.touches[0].clientY };
		onMouseDown(fakeEvent);
	}

	function onTouchMove(e) {
		e.preventDefault();
		var fakeEvent = { target:e.target, clientX:e.touches[0].clientX, clientY:e.touches[0].clientY };
		onMouseMove(fakeEvent);
	}

	function onTouchEnd(e) {
		e.preventDefault();
		onMouseUp();
	}

	this.updateCanvas = function() {
		//background
		ctx.fillStyle = "rgb("+getPal(curPal())[0][0]+","+getPal(curPal())[0][1]+","+getPal(curPal())[0][2]+")";
		ctx.fillRect(0,0,canvas.width,canvas.height);

		//pixel color
		if (self.GetCurDrawing().type === TileType.Tile) {
			ctx.fillStyle = "rgb("+getPal(curPal())[1][0]+","+getPal(curPal())[1][1]+","+getPal(curPal())[1][2]+")";
		}
		else if (self.GetCurDrawing().type === TileType.Sprite || self.GetCurDrawing().type === TileType.Item) {
			ctx.fillStyle = "rgb("+getPal(curPal())[2][0]+","+getPal(curPal())[2][1]+","+getPal(curPal())[2][2]+")";
		}

		//draw pixels
		for (var x = 0; x < 8; x++) {
			for (var y = 0; y < 8; y++) {
				// draw alternate frame
				if (self.isCurDrawingAnimated && curDrawingAltFrameData()[y][x] === 1) {
					ctx.globalAlpha = 0.3;
					ctx.fillRect(x*paint_scale,y*paint_scale,1*paint_scale,1*paint_scale);
					ctx.globalAlpha = 1;
				}
				// draw current frame
				if (curDrawingData()[y][x] === 1) {
					ctx.fillRect(x*paint_scale,y*paint_scale,1*paint_scale,1*paint_scale);
				}
			}
		}

		//draw grid
		if (self.drawPaintGrid) {
			ctx.fillStyle = getContrastingColor();

			for (var x = 1; x < tilesize; x++) {
				ctx.fillRect(x*paint_scale,0*paint_scale,1,tilesize*paint_scale);
			}
			for (var y = 1; y < tilesize; y++) {
				ctx.fillRect(0*paint_scale,y*paint_scale,tilesize*paint_scale,1);
			}
		}
	}

	function curDrawingData() {
		var frameIndex = (self.isCurDrawingAnimated ? self.curDrawingFrameIndex : 0);
		return GetFrameData(frameIndex);
	}

	// todo: assumes 2 frames
	function curDrawingAltFrameData() {
		var frameIndex = (self.curDrawingFrameIndex === 0 ? 1 : 0);
		return GetFrameData(frameIndex);
	}

	// TODO : redundant
	function updateDrawingData() {
		UpdateImageSource();
	}

	// NOTE: This does some global UI stuff now
	// but it's still better than the old version
	this.reloadDrawing = function() {
		ReloadImageSource();

		// animation UI
		if (self.GetCurDrawing() && self.GetCurDrawing().animation.isAnimated) {
			self.isCurDrawingAnimated = true;
			document.getElementById("animatedCheckbox").checked = true;

			if (self.curDrawingFrameIndex == 0)
			{
				document.getElementById("animationKeyframe1").className = "animationThumbnail left selected";
				document.getElementById("animationKeyframe2").className = "animationThumbnail right unselected";
			}
			else if (self.curDrawingFrameIndex == 1)
			{
				document.getElementById("animationKeyframe1").className = "animationThumbnail left unselected";
				document.getElementById("animationKeyframe2").className = "animationThumbnail right selected";
			}

			document.getElementById("animation").setAttribute("style","display:block;");
			document.getElementById("animatedCheckboxIcon").innerHTML = "expand_more";

			renderAnimationPreview(self.GetCurDrawing().id);
		}
		else {
			self.isCurDrawingAnimated = false;
			document.getElementById("animatedCheckbox").checked = false;
			document.getElementById("animation").setAttribute("style","display:none;");
			document.getElementById("animatedCheckboxIcon").innerHTML = "expand_less";
		}

		if (self.GetCurDrawing().type === TileType.Tile) {
			updateWallCheckboxOnCurrentTile();
		}
		else {
			// TODO : need to account for player avatar too somewhere
			// TODO : this will eventually be replaced w/ scripting stuff
			reloadDialogUI()
		}

		// ??? what's the boolean for?
		updateDrawingNameUI( self.GetCurDrawing().id != "A" );

		// update paint canvas
		self.updateCanvas();
	}

	this.selectDrawing = function(drawingId) {
		curDrawingId = drawingId;
		self.reloadDrawing();
		self.updateCanvas();
	}

	this.toggleWall = function(checked) {
		if (self.GetCurDrawing().type != TileType.Tile) {
			return;
		}

		if (self.GetCurDrawing().isWall == undefined || self.GetCurDrawing().isWall == null) {
			// clear out any existing wall settings for this tile in any rooms
			// (this is back compat for old-style wall settings)
			for (roomId in room) {
				var i = room[roomId].walls.indexOf(self.GetCurDrawing().id);
				if(i > -1) {
					room[roomId].walls.splice(i, 1);
				}
			}
		}

		self.GetCurDrawing().isWall = checked;

		refreshGameData();

		// a bit hacky
		if(toggleWallUI != null && toggleWallUI != undefined) {
			toggleWallUI(checked);
		}
	}

	this.newDrawing = function() {
		// TODO : simplify please..
		if (self.GetCurDrawing().type == TileType.Tile) {
			newTile();
		}
		else if (self.GetCurDrawing().type == TileType.Sprite) {
			newSprite();
		}
		else if (self.GetCurDrawing().type == TileType.Item) {
			newItem();
		}

		// update paint explorer
		self.explorer.AddThumbnail(self.GetCurDrawing().id);
		self.explorer.ChangeSelection(self.GetCurDrawing().id);
		// super hacky
		document.getElementById("paintExplorerFilterInput").value = "";
		// this is a bit hacky feeling
		self.explorer.Refresh(self.GetCurDrawing().type, true /*doKeepOldThumbnails*/, document.getElementById("paintExplorerFilterInput").value /*filterString*/, true /*skipRenderStep*/);
	}

	// TODO .. replace ALL of these with one method?
	// TODO -- sould these newDrawing methods be internal to PaintTool?
	function newTile(id) {
		if (id)
			self.drawing.id = id; //this optional parameter lets me override the default next id
		else
			self.drawing.id = nextTileId();

		makeTile(self.drawing.id);
		self.reloadDrawing(); //hack for ui consistency (hack x 2: order matters for animated tiles)

		self.updateCanvas();
		refreshGameData();

		tileIndex = Object.keys(tile).length - 1;
	}

	function newSprite(id) {
		if (id)
			self.drawing.id = id; //this optional parameter lets me override the default next id
		else
			self.drawing.id = nextSpriteId();

		makeSprite(self.drawing.id);
		self.reloadDrawing(); //hack (order matters for animated tiles)

		self.updateCanvas();
		refreshGameData();

		spriteIndex = Object.keys(sprite).length - 1;
	}

	function newItem(id) {
		if (id)
			self.drawing.id = id; //this optional parameter lets me override the default next id
		else
			self.drawing.id = nextItemId();

		makeItem(self.drawing.id);
		self.reloadDrawing(); //hack (order matters for animated tiles)

		self.updateCanvas();
		updateInventoryItemUI();
		refreshGameData();

		itemIndex = Object.keys(item).length - 1;
	}

	// TODO - may need to extract this for different tools beyond the paint tool (put it in core.js?)
	this.deleteDrawing = function() {
		var shouldDelete = true;
		shouldDelete = confirm("Are you sure you want to delete this drawing?");

		if ( shouldDelete ) {
			self.explorer.DeleteThumbnail( self.drawing.id );

			if (self.drawing.type == TileType.Tile) {
				if ( Object.keys( tile ).length <= 1 ) { alert("You can't delete your last tile!"); return; }
				delete tile[ self.drawing.id ];
				findAndReplaceTileInAllRooms( self.drawing.id, "0" );
				refreshGameData();
				// TODO RENDERER : refresh images
				roomTool.drawEditMap();
				nextTile();
			}
			else if( self.drawing.type == TileType.Avatar || self.drawing.type == TileType.Sprite ){
				if ( Object.keys( sprite ).length <= 2 ) { alert("You can't delete your last sprite!"); return; }

				// todo: share with items
				var dlgId = sprite[ self.drawing.id ].dlg == null ? self.drawing.id : sprite[ self.drawing.id ].dlg;
				if( dlgId && dialog[ dlgId ] )
					delete dialog[ dlgId ];

				delete sprite[ self.drawing.id ];

				refreshGameData();
				// TODO RENDERER : refresh images
				roomTool.drawEditMap();
				nextSprite();
			}
			else if( self.drawing.type == TileType.Item ){
				if ( Object.keys( item ).length <= 1 ) { alert("You can't delete your last item!"); return; }

				var dlgId = item[ self.drawing.id ].dlg;
				if( dlgId && dialog[ dlgId ] )
					delete dialog[ dlgId ];

				delete item[ self.drawing.id ];

				removeAllItems( self.drawing.id );
				refreshGameData();
				// TODO RENDERER : refresh images
				roomTool.drawEditMap();
				nextItem();
				updateInventoryItemUI();
			}

			self.explorer.ChangeSelection( self.drawing.id );
		}
	}

	events.Listen("palette_change", function(event) {
		self.updateCanvas();

		if( self.isCurDrawingAnimated ) {
			// TODO -- this animation stuff needs to be moved in here I think?
			renderAnimationPreview( drawing.id );
		}
	});
}