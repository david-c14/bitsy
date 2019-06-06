var TextEditor = function() {
	var dialogRenderer = dialogModule.CreateRenderer();
	var dialogBuffer = dialogModule.CreateBuffer();
	var scriptInterpreter = scriptModule.CreateInterpreter();

	var canvas = document.createElement("canvas");
	canvas.width = 512; // todo -- remove??
	canvas.height = 512;
	var context = canvas.getContext("2d");

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

	this.GetCanvas = function() {
		return canvas;
	}

	this.SetText = function(text) {
		var font = fontManager.Get(fontName); // hack -- relies on globals (pass font in w/ constructor?)
		dialogBuffer.SetFont(font);
		dialogRenderer.SetFont(font);

		dialogBuffer.Reset();
		dialogRenderer.Reset();

		scriptInterpreter.SetDialogBuffer( dialogBuffer );
		scriptInterpreter.Interpret( text );

		dialogBuffer.Skip();
	}

	prevTime = Date.now();
	setInterval(update, -1);
}; // TextEditor