var TextEditor = function() {
	var dialogRenderer = dialogModule.CreateRenderer();
	var dialogBuffer = dialogModule.CreateBuffer();
	var scriptInterpreter = scriptModule.CreateInterpreter();

	var canvas = document.createElement("canvas");
	canvas.width = 512; // todo -- remove??
	canvas.height = 512;
	canvas.tabIndex = 1;
	var context = canvas.getContext("2d");
	context.imageSmoothingEnabled = false; // does this do anything??

	dialogRenderer.AttachContext(context);
	dialogRenderer.SetTopLeft(true);

	var prevTime, deltaTime;
	function update() {
		var curTime = Date.now();
		deltaTime = curTime - prevTime;

		var textboxSize = dialogRenderer.ImageSize();
		canvas.width = textboxSize.width;
		canvas.height = textboxSize.height;

		if(dialogBuffer.IsActive()) {
			dialogRenderer.Draw( dialogBuffer, deltaTime );
			dialogBuffer.Update( deltaTime );
		}

		prevTime = curTime;
	}

	// canvas.addEventListener("keypress", function(e) {
	// 	e.preventDefault();

	// 	// console.log(e);
	// 	// curText = curText + e.key;
	// 	// updateText(curText);
	// 	// TODO : insert text directly into the buffer!!! don't rerun the whole script lol
	// });


	canvas.addEventListener("keydown", function(e) {
		// console.log(e);
		// console.log("KEY DOWN");

		// stop backspace from going to previous webpage
		e.preventDefault();

		if (e.key === "Backspace") {
			dialogBuffer.DeleteChar();
		}
		else {
			dialogBuffer.AddText(e.key);
			dialogBuffer.DoNextChar();
		}


		return false;
	});

	// canvas.addEventListener("keyup", function(e) {
	// 	console.log(e);
	// 	console.log("KEY UP");
	// 	e.preventDefault();
	// 	return false;
	// });

	canvas.addEventListener("mousedown", function(e) {
		console.log(e);
	});

	this.GetCanvas = function() {
		return canvas;
	}

	var curText = "";
	function updateText(text) {
		curText = text;

		var font = fontManager.Get(fontName); // hack -- relies on globals (pass font in w/ constructor?)
		dialogBuffer.SetFont(font);
		dialogRenderer.SetFont(font);

		dialogBuffer.Reset();
		dialogRenderer.Reset();

		scriptInterpreter.SetDialogBuffer( dialogBuffer );
		scriptInterpreter.Interpret( curText );

		dialogBuffer.Skip();
	}
	updateText(curText);

	this.SetText = function(text) {
		updateText(text);
	}

	prevTime = Date.now();
	setInterval(update, -1);
}; // TextEditor