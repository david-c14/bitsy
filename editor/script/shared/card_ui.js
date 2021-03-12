function CardUI() {
	function createIconElement(id) {
		// todo : supply this externally?
		return iconUtils.CreateIcon(id);
	}

	this.CreateCardView = function(config) {
		return new CardView(config);
	};

	// todo ... not sure where thie metadata should actually live??
	var dataCategories = {};

	dataCategories["AVA"] = {
		name : "avatar",
		iconId : "avatar",
	};

	dataCategories["SPR"] = {
		name : "sprite",
		iconId : "sprite",
	};

	dataCategories["TIL"] = {
		name : "tile",
		iconId : "tile",
	};

	dataCategories["ITM"] = {
		name : "item",
		iconId : "item",
	};

	// shared controls (should these go in their own file??)
	function createLabel(options) {
		var label = document.createElement("span");

		if (options.icon) {
			label.appendChild(iconUtils.CreateIcon(options.icon));
		}

		if (options.text) {
			var textSpan = document.createElement("span");
			textSpan.innerText = options.text;
			label.appendChild(textSpan);
		}

		return label;
	}

	function createButton(options) {
		var button = document.createElement("button");

		if (options.icon) {
			button.appendChild(iconUtils.CreateIcon(options.icon));
		}

		if (options.text) {
			var textSpan = document.createElement("span");
			textSpan.innerText = options.text;
			button.appendChild(textSpan);
		}

		// "onclick" so many places makes the names confusing
		if (options.onclick) {
			button.onclick = options.onclick;
		}

		return button;
	}

	// hacky to track this globally??
	var menuToggleCount = 0;

	function createToggle(options) {
		var toggle = document.createElement("span");

		var checkbox = document.createElement("input");
		checkbox.type = "checkbox";
		checkbox.id = "menu_toggle_" + menuToggleCount;
		checkbox.checked = options.value;

		if (options.onclick) {
			checkbox.onclick = options.onclick;
		}

		menuToggleCount++;

		toggle.appendChild(checkbox);

		var label = document.createElement("label");
		label.setAttribute("for", checkbox.id);

		if (options.icon) {
			label.appendChild(iconUtils.CreateIcon(options.icon));
		}

		if (options.text) {
			var textSpan = document.createElement("span");
			textSpan.innerText = options.text;
			label.appendChild(textSpan);
		}

		toggle.appendChild(label);

		return toggle;
	}

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

		if (card.data) {
			if (card.data.length > 1) {
				// todo : rename DATA TYPE SELECT??? */
				/* CATEGORY SELECT */
				var categorySelect = document.createElement("form");
				categorySelect.classList.add("cardui-category");
				toolRoot.appendChild(categorySelect);

				for (var i = 0; i < card.data.length; i++) {
					var category = dataCategories[card.data[i]];

					var categoryOption = document.createElement("input");
					categoryOption.type = "radio";
					categoryOption.name = card.name + "-category";
					categoryOption.id = card.name + "-category-" + card.data[i];
					categoryOption.value = card.data[i];
					categorySelect.appendChild(categoryOption);

					categoryOption.onclick = function(e) {
						if (card.changeDataType) {
							card.changeDataType(e.target.value);
						}

						UpdateMenu();
					};

					var categoryLabel = document.createElement("label");
					categoryLabel.setAttribute("for", categoryOption.id);
					categorySelect.appendChild(categoryLabel);

					categoryLabel.appendChild(createIconElement(category.iconId));

					var categoryName = document.createElement("span");
					categoryName.innerText = category.name;
					categoryLabel.appendChild(categoryName);
				}
			}

			/* NAV BAR */
			var nameControl;

			// create nav bar
			var nav = document.createElement("div");
			nav.classList.add("cardui-nav");
			toolRoot.appendChild(nav);

			nameControl = document.createElement("span");
			nameControl.classList.add("cardui-nav-name");
			nameControl.innerText = "NAME";
			nav.appendChild(nameControl);

			var prevControl = document.createElement("button");
			prevControl.appendChild(createIconElement("previous"));
			nav.appendChild(prevControl);

			var nextControl = document.createElement("button");
			nextControl.appendChild(createIconElement("next"));
			// nextControl.onclick = OnNext;
			nav.appendChild(nextControl);

			var addControl = document.createElement("button");
			addControl.appendChild(createIconElement("add"));
			nav.appendChild(addControl);

			var copyControl = document.createElement("button");
			copyControl.appendChild(createIconElement("copy"));
			nav.appendChild(copyControl);

			var delControl = document.createElement("button");
			delControl.appendChild(createIconElement("delete"));
			nav.appendChild(delControl);

			// HACK : for now I'm just routing these directly to the card..
			prevControl.onclick = function() {
				if (card.prev) {
					card.prev();
				}

				UpdateMenu();
			};

			nextControl.onclick = function() {
				if (card.next) {
					card.next();
				}

				UpdateMenu();
			};

			addControl.onclick = function() {
				if (card.add) {
					card.add();
				}

				UpdateMenu();
			};

			copyControl.onclick = function() {
				if (card.copy) {
					card.copy();
				}

				UpdateMenu();
			};

			delControl.onclick = function() {
				if (card.del) {
					card.del();
				}

				UpdateMenu();
			};
		}

		if (card.draw) {
			// todo : should the canvas stuff in here go into its own object? "standard-bitsy-card-ui" or something?
			var canvas = document.createElement("canvas");
			canvas.classList.add("cardui-canvas");
			toolRoot.appendChild(canvas);
		}

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

		var _curGroup;

		function StartGroup() {
			_curGroup = document.createElement("div");
			_curGroup.classList.add("cardui-menu-group");
		}
		this.StartGroup = StartGroup;

		function EndGroup() {
			menu.appendChild(_curGroup);
			_curGroup = null;
		}
		this.EndGroup = EndGroup;

		this.AddControl = function(options) {
			var isGroupActive = (_curGroup != null);

			if (!isGroupActive) {
				StartGroup();
			}

			var control;

			// todo : how much of this should be here? how much in card_ui.js?
			if (options.control === "label") {
				control = createLabel({
					text: options.text,
					icon: options.icon,
				});
			}
			else if (options.control === "button") {
				control = createButton({
					text: options.text,
					icon: options.icon,
					value: options.value,
					onclick: function() {
						// console.log("CLICK " + options.text);
						card[options.event](options.value);
						UpdateMenu();
					},
				});
			}
			else if (options.control === "toggle") {
				control = createToggle({
					text: options.text,
					icon: options.icon,
					value: options.value,
					onclick: function(e) {
						card[options.event](e.target.checked);
						UpdateMenu();
					},
				});
			}

			if (control) {
				_curGroup.appendChild(control);
			}

			if (!isGroupActive) {
				EndGroup();
			}
		};

		// init
		if (card.draw) {
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
		}

		// ??? correct name and place?
		this.Boot = function() {
			card.boot();
			UpdateMenu();
		}
	}
}