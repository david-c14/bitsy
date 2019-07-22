/*
	PAINT
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
		self.curDrawingFrameIndex = 0;
		self.reloadDrawing();
	});

	// TODO: this is kind of a weird place for this to live
	this.GetCurDialogId = function() {
		// TODO : this can be simplified if I stop inferring the ID of dialog from the drawing ID
		var dialogId = null;
		if (self.GetCurDrawing().type === TileType.Sprite) {
			dialogId = object[curDrawingId].dlg;
			if(dialogId == null && dialog[curDrawingId] != null) {
				dialogId = curDrawingId;
			}
		}
		else if (self.GetCurDrawing().type === TileType.Item) {
			dialogId = object[curDrawingId].dlg;
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
		if (isPainting) {
			isPainting = false;
			UpdateImageSource();
			refreshGameData();

			events.Raise("paint_change_drawing", {id:curDrawingId});

			if( self.isCurDrawingAnimated ) {
				renderAnimationPreview( curDrawingId );
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

			renderAnimationPreview(curDrawingId);
		}
		else {
			self.isCurDrawingAnimated = false;
			document.getElementById("animatedCheckbox").checked = false;
			document.getElementById("animation").setAttribute("style","display:none;");
			document.getElementById("animatedCheckboxIcon").innerHTML = "expand_less";
		}

		if (self.GetCurDrawing().type === TileType.Tile) {
			self.updateWallCheckboxOnCurrentTile();
		}
		else {
			// TODO : need to account for player avatar too somewhere
			// TODO : this will eventually be replaced w/ scripting stuff
			reloadDialogUI()
		}

		// ??? what's the boolean for?
		updateDrawingNameUI( curDrawingId != "A" );

		// toggle type-specific UI
		if (self.GetCurDrawing().type != TileType.Tile) {
			document.getElementById("dialog").setAttribute("style","display:block;");
		}
		else {
			document.getElementById("dialog").setAttribute("style","display:none;");
		}

		if (self.GetCurDrawing().type === TileType.Tile) {
			document.getElementById("wall").setAttribute("style","display:block;");
		}
		else {
			document.getElementById("wall").setAttribute("style","display:none;");
		}

		if (self.GetCurDrawing().type === TileType.Item) {
			document.getElementById("showInventoryButton").setAttribute("style","display:inline-block;");
		}
		else {
			document.getElementById("showInventoryButton").setAttribute("style","display:none;");
		}

		// update paint canvas
		self.updateCanvas();
	}

	// have to expose for legacy reasons (per-room wall settings)
	this.updateWallCheckboxOnCurrentTile = function() {
		var isCurTileWall = false;

		if (self.GetCurDrawing().isWall == undefined || self.GetCurDrawing().isWall == null) {
			if (room[curRoom]) {
				isCurTileWall = (room[curRoom].walls.indexOf(curDrawingId) != -1);
			}
		}
		else {
			isCurTileWall = self.GetCurDrawing().isWall;
		}

		if (isCurTileWall) {
			document.getElementById("wallCheckbox").checked = true;
			document.getElementById("wallCheckboxIcon").innerHTML = "border_outer";
		}
		else {
			document.getElementById("wallCheckbox").checked = false;
			document.getElementById("wallCheckboxIcon").innerHTML = "border_clear";
		}
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
				var i = room[roomId].walls.indexOf(curDrawingId);
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

	// TODO .. seperate into its own little tool someday?
	/* ANIMATION CONTROLS */
	function AddAnimation() {
		//set editor mode
		self.isCurDrawingAnimated = true;
		self.curDrawingFrameIndex = 0;

		//mark drawing as animated
		self.GetCurDrawing().animation.isAnimated = true;
		self.GetCurDrawing().animation.frameIndex = 0;
		self.GetCurDrawing().animation.frameCount = 2;

		//add blank frame (or restore removed animation)
		if (self.GetCurDrawing().cachedAnimation != null) {
			restoreDrawingAnimation(self.GetCurDrawing().drw, self.GetCurDrawing().cachedAnimation);
		}
		else {
			addNewFrameToDrawing(self.GetCurDrawing().drw);
		}

		// TODO RENDERER : refresh images

		//refresh data model
		refreshGameData();
		self.reloadDrawing();

		// reset animations
		resetAllAnimations();
	}

	function RemoveAnimation() {
		//set editor mode
		self.isCurDrawingAnimated = false;

		//mark drawing as non-animated
		self.GetCurDrawing().animation.isAnimated = false;
		self.GetCurDrawing().animation.frameIndex = 0;
		self.GetCurDrawing().animation.frameCount = 0;

		//remove all but the first frame
		cacheDrawingAnimation( self.GetCurDrawing(), self.GetCurDrawing().drw );
		removeDrawingAnimation( self.GetCurDrawing().drw );

		// TODO RENDERER : refresh images

		//refresh data model
		refreshGameData();
		self.reloadDrawing();

		// reset animations
		resetAllAnimations();
	}

	function addNewFrameToDrawing(drwId) {
		// copy first frame data into new frame
		var imageSource = renderer.GetImageSource(drwId);
		var firstFrame = imageSource[0];
		var newFrame = [];
		for (var y = 0; y < tilesize; y++) {
			newFrame.push([]);
			for (var x = 0; x < tilesize; x++) {
				newFrame[y].push( firstFrame[y][x] );
			}
		}
		imageSource.push( newFrame );
		renderer.SetImageSource(drwId, imageSource);
	}

	function removeDrawingAnimation(drwId) {
		var imageSource = renderer.GetImageSource(drwId);
		var oldImageData = imageSource.slice(0);
		renderer.SetImageSource( drwId, [ oldImageData[0] ] );
	}

	// let's us restore the animation during the session if the user wants it back
	function cacheDrawingAnimation(object,sourceId) {
		var imageSource = renderer.GetImageSource(sourceId);
		var oldImageData = imageSource.slice(0);
		object.cachedAnimation = [ oldImageData[1] ]; // ah the joys of javascript
	}

	function restoreDrawingAnimation(sourceId,cachedAnimation) {
		var imageSource = renderer.GetImageSource(sourceId);
		for (f in cachedAnimation) {
			imageSource.push( cachedAnimation[f] );
		}
		renderer.SetImageSource(sourceId, imageSource);
	}

	this.toggleAnimated = function(checked) {
		if (checked) {
			AddAnimation();

			document.getElementById("animation").setAttribute("style","display:block;");
			document.getElementById("animatedCheckboxIcon").innerHTML = "expand_more";
			renderAnimationPreview(curDrawingId);
		}
		else {
			RemoveAnimation();

			document.getElementById("animation").setAttribute("style","display:none;");
			document.getElementById("animatedCheckboxIcon").innerHTML = "expand_less";
		}

		// renderPaintThumbnail(curDrawingId);
	}

	var animationThumbnailRenderer = new ThumbnailRenderer();
	function renderAnimationThumbnail(imgId,id,frameIndex) {
		animationThumbnailRenderer.Render(imgId, curDrawingId, frameIndex);
	}

	function renderAnimationPreview(id) {
		// console.log("RENDRE ANIM PREVIW");
		renderAnimationThumbnail( "animationThumbnailPreview", id );
		renderAnimationThumbnail( "animationThumbnailFrame1", id, 0 );
		renderAnimationThumbnail( "animationThumbnailFrame2", id, 1 );
	}

	this.NextDrawing = function() {
		var ids = sortedObjectIdList();
		var objectIndex = ids.indexOf(curDrawingId);
		objectIndex = (objectIndex + 1) % ids.length;
		events.Raise("select_drawing", {id:ids[objectIndex]});
	}

	this.PrevDrawing = function() {
		var ids = sortedObjectIdList();
		var objectIndex = ids.indexOf(curDrawingId);
		objectIndex = (objectIndex - 1) % ids.length;
		if (objectIndex < 0) {
			objectIndex = (ids.length-1);
		}
		events.Raise("select_drawing", {id:ids[objectIndex]});
	}

	// TODO : need to make this work for ALL object types (currently creates sprites)
	this.newDrawing = function() {
		curDrawingId = nextObjectId(sortedObjectIdList());
		makeObject(curDrawingId, "SPR"); // TODO multiple types!
		self.reloadDrawing(); //hack for ui consistency (hack x 2: order matters for animated tiles)
		self.updateCanvas();
		refreshGameData();
		events.Raise("paint_add_drawing", {id:curDrawingId});
	}

	this.DuplicateDrawing = function() {
		var copyType = self.GetCurDrawing().type;

		//copy drawing data
		var sourceImageData = renderer.GetImageSource( self.GetCurDrawing().drw );
		var copiedImageData = [];
		for (f in sourceImageData) {
			copiedImageData.push([]);
			for (y in sourceImageData[f]) {
				copiedImageData[f].push([]);
				for (x in sourceImageData[f][y]) {
					copiedImageData[f][y].push( sourceImageData[f][y][x] );
				}
			}
		}

		var copyId = nextObjectId(sortedObjectIdList());

		makeObject( copyId, copyType, copiedImageData );

		if (copyType === TileType.Tile) {
			object[copyId].isWall = self.GetCurDrawing().isWall;
		}

		refreshGameData();

		if (copyType === TileType.Item) {
			updateInventoryItemUI();
		}

		events.Raise("paint_add_drawing", {id:copyId});
		events.Raise("select_drawing", {id:copyId});
	}

	// TODO - may need to extract this for different tools beyond the paint tool (put it in core.js?)
	this.deleteDrawing = function() {
		var shouldDelete = true;

		// TODO ... make nicer prompt not using default browser stuff?
		// TODO .. if I had UNDO / REDO this warning wouldn't be necessary
		shouldDelete = confirm("Are you sure you want to delete this drawing?");

		if (shouldDelete) {
			// TODO: Let's see what happens if we don't have this guard
			// if (Object.keys(object).length <= 1) {
			// 	alert("You can't delete your last object!");
			// 	return;
			// }

			var tempType = self.GetCurDrawing().type;

			// delete any dialog the object may be attached to
			// (TODO: do I really want this when I allow multiple objects to reference scripts?)
			var dialogId = self.GetCurDrawing().dlg;
			// hacky --- I really want to get rid of this feature!! (I can import it away I think)
			if (dialogId == null && tempType === TileType.Sprite) {
				dialogId = curDrawingId;
			}
			if (dialogId && dialog[dialogId]) {
				delete dialog[dialogId];
			}

			// delete object definition
			delete object[curDrawingId];

			// remove references to object in rooms
			if (tempType === TileType.Tile) {
				findAndReplaceTileInAllRooms(curDrawingId, "0");
			}
			else {
				removeAllObjects(curDrawingId);
			}

			refreshGameData();

			events.Raise("paint_delete_drawing", {id:curDrawingId});

			self.NextDrawing();
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