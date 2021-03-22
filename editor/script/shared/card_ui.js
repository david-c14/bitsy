function CardUI() {
	function createIconElement(id) {
		// todo : supply this externally?
		return iconUtils.CreateIcon(id);
	}

	this.CreateCardView = function(card) {
		return new CardView(card);
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
		label.classList.add("cardui-label");

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

	// todo : should I pick a more generic name than tab? switcher? segments? options? radio? select?
	function createTabs(options) {
		var tabForm = document.createElement("form");
		tabForm.classList.add("cardui-tab-group");

		for (var i = 0; i < options.tabs.length; i++) {
			var t = options.tabs[i];

			// todo : do I want an auto-value?
			// var value = (t.value != undefined ? t.value : "" + i);
			var value = (t.value != undefined ? t.value : null);

			var tabInput = document.createElement("input");
			tabInput.type = "radio";
			tabInput.name = options.name;
			tabInput.id = options.name + "-" + value;
			tabInput.value = value;
			tabForm.appendChild(tabInput);

			if (value === options.value) {
				tabInput.checked = true;
			}

			tabInput.onclick = function(e) {
				if (options.onclick) {
					options.onclick(e);
				}
			};

			var tabLabel = document.createElement("label");
			tabLabel.classList.add("cardui-tab-item");
			tabLabel.setAttribute("for", tabInput.id);
			tabForm.appendChild(tabLabel);

			if (t.icon) {
				tabLabel.appendChild(createIconElement(t.icon));
			}

			if (t.text) {
				var tabName = document.createElement("span");
				tabName.innerText = t.text;
				tabLabel.appendChild(tabName);
			}
		}

		return tabForm;
	}

	function createDialogField(options) {
		// todo : eventually I want to simplify this widget code a lot, but for now I'm just wrapping it
		var widget = dialogTool.CreateWidget(
			options.name,
			options.parentId,
			options.dlgId);
		// ,
		// 	true,
		// 	function(id) {
		// 		obj.dlg = id;
		// 	},
		// 	{
		// 		CreateFromEmptyTextBox: true,
		// 		OnCreateNewDialog: function(id) {
		// 			obj.dlg = id;
		// 			refreshGameData();
		// 		},
		// 		GetDefaultName: function() {
		// 			var desc = paintTool.drawing.getNameOrDescription();
		// 			return CreateDefaultName(desc + " dialog", dialog, true); // todo : localize
		// 		}, // todo : localize
		// 	});

		return widget.GetElement();
	}

	function createThumbnail(options) {
		var thumbnailImg = document.createElement("img");
		thumbnailImg.classList.add('cardui-thumbnail');

		if (options.selected) {
			thumbnailImg.classList.add('cardui-selected');
		}

		thumbnailImg.onclick = options.onclick;

		var tileType;

		if (options.type === "AVA") {
			tileType = TileType.Avatar;
		}
		else if (options.type === "SPR") {
			tileType = TileType.Sprite;
		}
		else if (options.type === "TIL") {
			tileType = TileType.Tile;
		}
		else if (options.type === "ITM") {
			tileType = TileType.Item;
		}

		// TODO : I really need to get rid of this annoying construct
		var drawingId = new DrawingId(tileType, options.id);

		var thumbnailRenderer = new ThumbnailRenderer();

		thumbnailRenderer.Render(
			null, // imgId
			drawingId,
			options.frame,
			thumbnailImg);

		return thumbnailImg;
	};

	function createNumberInput(options) {
		var input = document.createElement("input");
		input.classList.add("cardui-number");
		input.type = "number";
		input.value = options.value;
		input.onchange = options.onchange;

		return input;
	};

	function createTextInput(options) {
		var input = document.createElement("input");
		input.classList.add("cardui-text");
		input.type = "text";
		input.value = options.value;
		input.onchange = options.onchange;

		return input;
	};

	function createSelect(options) {
		var select = document.createElement("select");
		select.classList.add("cardui-select");
		select.onchange = options.onchange;

		for (var i = 0; i < options.options.length; i++) {
			var option = document.createElement("option");
			option.innerText = options.options[i].text;
			option.value = options.options[i].value;
			option.selected = (options.value === options.options[i].value);
			select.appendChild(option);
		}

		return select;
	};

	// todo : confusing naming with the system cards??? CardView? CardDisplay? CardWindow?
	function CardView(card) {
		var self = this; // todo : I don't love this pattern..

		/* CARD MODULE */
		// card = config.card;

		/* EVENT HANDLERS */
		var onGrabHandler = null;
		var onCloseHandler = null;

		/* ROOT ELEMENT */
		var cardRoot = document.createElement("div");
		cardRoot.classList.add("cardui-card");
		cardRoot.id = card.name + "Tool"; //config.id;

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
		cardIcon.appendChild(createIconElement(card.icon)); //config.iconId));
		titleBar.appendChild(cardIcon);

		var titleText = document.createElement("span");
		titleText.classList.add("cardui-title");
		titleText.innerText = card.name; // config.title;
		titleBar.appendChild(titleText);

		// var closeButton = document.createElement("button");
		// closeButton.classList.add("cardui-close"); // todo : generic button class?
		// closeButton.appendChild(createIconElement("close"));
		// closeButton.onclick = function(e) {
		// 	if (onCloseHandler) {
		// 		onCloseHandler(e);
		// 	}
		// };
		// titleBar.appendChild(closeButton);

		titleBar.appendChild(createButton({
			icon: "close",
			onclick: function(e) {
				if (onCloseHandler) {
					onCloseHandler(e);
				}
			},
		}));

		/* TOOL MAIN ELEMENT */
		var toolRoot = document.createElement("div");
		toolRoot.classList.add("cardui-main");

		if (card.sizeHint === "XS") {
			toolRoot.classList.add("cardui-size-xsmall");
		}
		else if (card.sizeHint === "S") {
			toolRoot.classList.add("cardui-size-small");
		}
		else if (card.sizeHint === "M") {
			toolRoot.classList.add("cardui-size-medium");
		}
		else if (card.sizeHint === "L") {
			toolRoot.classList.add("cardui-size-large");
		}
		else {
			// make small the default
			toolRoot.classList.add("cardui-size-small");
		}


		cardRoot.appendChild(toolRoot);

		if (card.data) {
			if (card.data.length > 1) {
				var dataTabs = [];

				for (var i = 0; i < card.data.length; i++) {
					var category = dataCategories[card.data[i]];
					dataTabs.push({ text: category.name, icon: category.iconId, value: card.data[i], });
				}

				toolRoot.appendChild(createTabs({
					name: card.name + "-data-tabs",
					tabs: dataTabs,
					value: card.data[0],
					onclick: function(e) {
						if (card.changeDataType) {
							card.changeDataType(e.target.value);
						}

						UpdateMenu();
					}
				}));
			}

			/* NAV BAR */
			var nameControl;

			// create nav bar
			var nav = document.createElement("div");
			nav.classList.add("cardui-nav");
			toolRoot.appendChild(nav);

			nameControl = document.createElement("input");
			nameControl.classList.add("cardui-nav-name");
			nameControl.type = "text";
			nameControl.onchange = function(e) {
				if (card.changeDataName) {
					card.changeDataName(e.target.value);
				}
			};
			// nameControl.innerText = "NAME";
			nav.appendChild(nameControl);

			nav.appendChild(createButton({
				icon: "previous",
				onclick: function() {
					if (card.prev) {
						card.prev();
					}

					UpdateMenu();
				}
			}));

			nav.appendChild(createButton({
				icon: "next",
				onclick: function() {
					if (card.next) {
						card.next();
					}

					UpdateMenu();
				}
			}));

			nav.appendChild(createButton({
				icon: "add",
				onclick: function() {
					if (card.add) {
						card.add();
					}

					UpdateMenu();
				}
			}));

			nav.appendChild(createButton({
				icon: "copy",
				onclick: function() {
					if (card.copy) {
						card.copy();
					}

					UpdateMenu();
				}
			}));

			nav.appendChild(createButton({
				icon: "delete",
				onclick: function() {
					if (card.del) {
						card.del();
					}

					UpdateMenu();
				}
			}));
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

			if (nameControl) {
				if (card.getDataName) {
					nameControl.value = card.getDataName();
				}
				else {
					nameControl.value = "";
				}
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
			else if (options.control === "tabs") {
				control = createTabs({
					name: options.name, // todo : auto-generate this??
					value: options.value,
					tabs: options.tabs,
					onclick: function(e) {
						card[options.event](e.target.value);
						UpdateMenu();
					},
				});
			}
			else if (options.control === "dialog") {
				control = createDialogField({
					name: options.name,
					dlgId: options.id, // todo : better name??
					parentId: cardRoot.id, // is this the right thing?
				});
			}
			else if (options.control === "thumbnail") {
				control = createThumbnail({
					type: options.type,
					id: options.id,
					frame: options.frame,
					selected: options.selected,
					onclick: function() {
						if (options.event) {
							card[options.event](options.value);
							UpdateMenu();
						}
					},
				});
			}
			else if (options.control === "number") {
				control = createNumberInput({
					value: options.value,
					onchange: function(e) {
						if (options.event) {
							card[options.event](e.target.value);
							UpdateMenu();
						}
					},
				});
			}
			else if (options.control === "text") {
				control = createTextInput({
					value: options.value,
					onchange: function(e) {
						if (options.event) {
							card[options.event](e.target.value);
							UpdateMenu();
						}
					},
				});
			}
			else if (options.control === "select") {
				control = createSelect({
					options: options.options, // naming is funny
					value: options.value,
					onchange: function(e) {
						if (options.event) {
							card[options.event](e.target.value);
							UpdateMenu();
						}
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

				if (card.cursorDown) {
					card.cursorDown(x, y);
					didCursorAction = true;
				}
			};

			var didCursorAction = false;

			canvas.onmousemove = function(e) {
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


				if (card.cursorMove) {
					card.cursorMove(x, y);
					didCursorAction = true;
				}
			};

			canvas.onmouseup = function(e) {
				var tempDidCursorAction = didCursorAction;
				didCursorAction = false;

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


				if (card.cursorUp) {
					card.cursorUp(x, y);
					tempDidCursorAction = true;
				}

				if (tempDidCursorAction) {
					UpdateMenu();
				}
			};

			// draw loop
			setInterval(function() {
				gfxAttachCanvas(canvas);

				if (card.draw) {
					card.draw();
				}
			}, -1); // todo : what should the interval be really? not constant..
		}

		// this.SetName = function(name) {
		// 	nameControl.value = name;
		// };

		// ??? correct name and place?
		this.Boot = function() {
			if (card.boot) {
				card.boot();
			}

			UpdateMenu();
		}

		this.Refresh = function() {
			UpdateMenu();
		};
	}
}