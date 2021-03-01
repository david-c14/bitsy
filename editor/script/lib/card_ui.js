function CardUI() {
	function createIconElement(id) {
		// todo : supply this externally?
		return iconUtils.CreateIcon(id);
	}

	this.CreateCardView = function(config) {
		return new CardView(config);
	};

	// todo : confusing naming with the system cards??? CardView? CardDisplay? CardWindow?
	function CardView(config) {
		var self = this; // todo : I don't love this pattern..

		/* CARD MODULE */
		card = config.card;

		/* EVENT HANDLERS */
		var onGrabHandler = null;
		var onCloseHandler = null;

		/* ROOT ELEMENT */
		var cardRoot = document.createElement("div");
		cardRoot.classList.add("cardui-card");
		cardRoot.id = config.id;

		/* TITLE BAR */
		var titleBar = document.createElement("div");
		titleBar.classList.add("cardui-titlebar");
		titleBar.onmousedown = function(e) {
			if (onGrabHandler) {
				onGrabHandler(e);
			}
		};
		cardRoot.appendChild(titleBar);

		var cardIcon = document.createElement("span");
		cardIcon.classList.add("cardui-icon");
		cardIcon.appendChild(createIconElement(config.iconId));
		titleBar.appendChild(cardIcon);

		var titleText = document.createElement("span");
		titleText.classList.add("cardui-title");
		titleText.innerText = config.title;
		titleBar.appendChild(titleText);

		var closeButton = document.createElement("button");
		closeButton.classList.add("cardui-close"); // todo : generic button class?
		closeButton.appendChild(createIconElement("close"));
		closeButton.onclick = function(e) {
			if (onCloseHandler) {
				onCloseHandler(e);
			}
		};
		titleBar.appendChild(closeButton);

		/* TOOL MAIN ELEMENT */
		var toolRoot = document.createElement("div");
		toolRoot.classList.add("cardui-main");
		cardRoot.appendChild(toolRoot);

		var nav = document.createElement("div");
		nav.classList.add("cardui-nav");
		toolRoot.appendChild(nav);

		// todo : should the canvas stuff in here go into its own object? "standard-bitsy-card-ui" or something?
		var canvas = document.createElement("canvas");
		canvas.classList.add("cardui-canvas");
		toolRoot.appendChild(canvas);

		// name? settings? options? controls?
		var menu = document.createElement("div");
		menu.classList.add("cardui-menu");
		toolRoot.appendChild(menu);

		function UpdateMenu() {
			setCurCardView(self);

			menu.innerHTML = "";

			if (card.menu) {
				card.menu();
			}
		}

		this.GetCard = function() {
			return card;
		};

		this.GetElement = function() {
			return cardRoot;
		};

		this.OnGrab = function(f) {
			onGrabHandler = f;
		};

		this.OnClose = function(f) {
			onCloseHandler = f;
		};

		// todo : replace with config options?
		// hacky but useful for now to integrate with existin card system
		this.AddStyle = function(className) {
			cardRoot.classList.add(className);
		};

		// input
		canvas.onmousedown = function(e) {
			// HACKY COPY FROM PAINT TOOL
			e.preventDefault();

			if (isPlayMode) {
				return; //can't paint during play mode
			}

			console.log("PAINT TOOL!!!");
			console.log(e);

			var off = getOffset(e);

			off = mobileOffsetCorrection(off,e,(128)); // todo : hardcoded size..

			var x = Math.floor(off.x);
			var y = Math.floor(off.y);
			// END


			console.log("CLICK " + x + " " + y);

			// todo : what are the actual callbacks I want to support?
			if (card.click) {
				card.click(x, y);
			}

			UpdateMenu();
		};

		// draw loop
		setInterval(function() {
			gfxAttachCanvas(canvas);

			if (card.draw) {
				card.draw();
			}
		}, -1); // todo : what should the interval be really? not constant..

		// init menu
		UpdateMenu();
	}

}