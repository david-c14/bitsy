installCard(function(card) {
	card.name = "settings";
	card.icon = "settings";
	card.sizeHint = "M";

	var curSettingsTab = "publish";

	card.menu = function() {
		menu.add({
			control: "tabs",
			name: "settingsTabs",
			value: curSettingsTab,
			event: "changeSettingsTab",
			tabs: [
				{ text: "publish", icon: "file", value: "publish", },
				{ text: "editor", icon: "tool", value: "editor", },
				{ text: "system", icon: "sprite", value: "system", },
			],
		});

		if (curSettingsTab === "publish") {
			menu.add({
				control: "label",
				text: "html page color:",
			});

			menu.add({
				control: "tabs",
				value: export_settings.bg_mode,
				event: "changeBackgroundColorMode",
				tabs: [
					{ text: "change with room", icon: "room", value: ExportBackgroundMode.Room, },
					{ text: "hex", icon: "text_edit", value: ExportBackgroundMode.Hex, },
				],
			});

			if (export_settings.bg_mode === ExportBackgroundMode.Room) {
				menu.startGroup();

				menu.add({ control: "label", text: "color:", });

				menu.add({
					control: "select",
					value: export_settings.bg_color_index,
					event: "changeBackgroundColorIndex",
					options: [
						{ text: "background color", value: 0, },
						{ text: "tile color", value: 1, },
						{ text: "sprite color", value: 2, },
					],
				});

				menu.endGroup();
			}
			else if (export_settings.bg_mode === ExportBackgroundMode.Hex) {
				menu.startGroup();

				menu.add({ control: "label", text: "hex color:", });

				menu.add({
					control: "text",
					value: export_settings.page_color,
					event: "changeHexColor",
				});

				menu.endGroup();
			};

			menu.add({
				control: "label",
				text: "game window size:",
			});

			menu.add({
				control: "tabs",
				name: "gameWindowMode",
				value: (export_settings.is_fixed_size ? "fixed" : "full"),
				event: "changePageSizeMode",
				tabs: [
					{ text: "full page", icon: "pagesize_full", value: "full", },
					{ text: "fixed size", icon: "pagesize_fixed", value: "fixed", },
				],
			});

			if (export_settings.is_fixed_size) {
				menu.startGroup();

				menu.add({
					control: "number",
					value: export_settings.size,
					event: "changeGameWindowSize",
				});

				menu.add({
					control: "label",
					text: "px",
				});

				menu.endGroup();
			}
		}
		else if (curSettingsTab === "editor") {
			menu.startGroup();

			menu.add({
				control: "label",
				text: "language:",
			});

			var languageList = localization.GetLanguageList();
			var languageOptions = [];
			for (var i = 0; i < languageList.length; i++) {
				languageOptions.push({
					text: languageList[i].name,
					value: languageList[i].id,
				});
			}

			menu.add({
				control: "select",
				// todo : standardize names with "tabs" control?
				options: languageOptions,
				value: localization.GetLanguage(),
				event: "selectEditorLanguage",
			});

			menu.endGroup();

			menu.add({
				control: "label",
				text: localization.GetStringOrFallback("language_translator_credit", "English text by Adam Le Doux"),
			});
		}
		else if (curSettingsTab === "system") {
			menu.startGroup();

			menu.add({
				control: "label",
				text: "font:",
			});

			var customFontName = "";
			if (localStorage.custom_font != null) {
				fontStorage = JSON.parse(localStorage.custom_font);
				customFontName += fontStorage.name;
			}

			menu.add({
				control: "select",
				value: (fontName === customFontName) ? "custom" : fontName,
				event: "selectFont",
				options: [
					{
						value: "ascii_small",
						text: localization.GetStringOrFallback("font_ascii_small", "ASCII Small"),
					},
					{
						value: "unicode_european_small",
						text: localization.GetStringOrFallback("font_unicode_european_small", "Unicode European Small"),
					},
					{
						value: "unicode_european_large",
						text: localization.GetStringOrFallback("font_unicode_european_large", "Unicode European Large"),
					},
					{
						value: "unicode_asian",
						text: localization.GetStringOrFallback("font_unicode_asian", "Unicode Asian"),
					},
					{
						value: "arabic",
						text: localization.GetStringOrFallback("font_arabic", "Arabic"),
					},
					{
						value: "custom",
						text: "Custom - " + customFontName, // todo - localize!
					},
				],
			});

			menu.endGroup();

			menu.add({
				control: "label",
				text: localization.GetString("font_" + fontName + "_description"),
			});

			menu.startGroup();

			menu.add({
				control: "button",
				text: "download font",
				icon: "download",
				event: "downloadFont",
			});

			menu.add({
				control: "button",
				text: "upload font",
				icon: "upload",
			});

			menu.endGroup();

			menu.startGroup();

			menu.add({
				control: "label",
				text: "text direction:",
			});

			menu.add({
				control: "tabs",
				tabs: [
					{ text: "Left to Right", value: TextDirection.LeftToRight, },
					{ text: "Right to Left", value: TextDirection.RightToLeft, },
				],
				value: textDirection,
				event: "changeTextDirection",
			});

			menu.endGroup();

			menu.startGroup();

			menu.add({
				control: "label",
				text: "super animations:",
			});

			var superAnimationsEnabled = (flags.SUPER_ANM === 1);

			menu.add({
				control: "toggle",
				value: superAnimationsEnabled,
				text: superAnimationsEnabled ? "on" : "off",
				icon: superAnimationsEnabled ? "checkmark" : "cancel",
				event: "toggleSuperAnimations",
			});

			menu.endGroup();
		}
	};

	card.changeSettingsTab = function(value) {
		curSettingsTab = value;
	};

	card.changeBackgroundColorMode = function(value) {
		export_settings.bg_mode = parseInt(value);
		localStorage.export_settings = JSON.stringify(export_settings);
	};

	card.changeBackgroundColorIndex = function(value) {
		export_settings.bg_color_index = parseInt(value);
		localStorage.export_settings = JSON.stringify(export_settings);
	}

	card.changeHexColor = function(value) {
		// todo : verify valid hex value?
		export_settings.page_color = value;
		localStorage.export_settings = JSON.stringify(export_settings);
	};

	card.changePageSizeMode = function(value) {
		// note : this is just a global object currently
		export_settings.is_fixed_size = (value === "fixed");
		localStorage.export_settings = JSON.stringify(export_settings);
	};

	card.changeGameWindowSize = function(value) {
		export_settings.size = value;
		localStorage.export_settings = JSON.stringify(export_settings);
	};

	card.selectEditorLanguage = function(value) {
		var language = value;
		pickDefaultFontForLanguage(language);
		on_change_language_inner(language);
	};

	card.selectFont = function(value) {
		if (value != "custom") {
			// fontName = value;
			// refreshGameData();
			switchFont(value, true);
		}
		else {
			if (localStorage.custom_font != null) {
				var fontStorage = JSON.parse(localStorage.custom_font);
				switchFont(fontStorage.name, true /*doPickTextDirection*/);
			}
			else {
				// fallback
				switchFont("ascii_small", true /*doPickTextDirection*/);
			}
		}
	};

	card.downloadFont = function() {
		exportFont();
	};

	card.toggleSuperAnimations = function(value) {
		flags.SUPER_ANM = value ? 1 : 0;
		refreshGameData();
	};

	card.changeTextDirection = function(value) {
		textDirection = value;
		refreshGameData();
	};
});