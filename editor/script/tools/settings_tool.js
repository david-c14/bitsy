installCard(function(card) {
	card.name = "settings";
	card.icon = "settings";
	card.sizeHint = "M";

	var curSettingsTab = "publish";
	var curPageSizeMode = "full";

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
				tabs: [
					{ text: "change with room", icon: "room", },
					{ text: "from palette", icon: "colors", },
					{ text: "hex code", icon: "text_edit", },
				],
			});

			menu.add({
				control: "label",
				text: "game window size:",
			});

			menu.add({
				control: "tabs",
				name: "gameWindowMode",
				value: curPageSizeMode,
				event: "changePageSizeMode",
				tabs: [
					{ text: "full page", icon: "pagesize_full", value: "full", },
					{ text: "fixed size", icon: "pagesize_fixed", value: "fixed", },
				],
			});

			if (curPageSizeMode === "fixed") {
				menu.startGroup();

				menu.add({
					control: "number",
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

			menu.add({
				control: "select",
				value: fontName,
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
						text: "Custom", // todo - localize!
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
					{ text: "Left to Right", value: "LTR", },
					{ text: "Right to Left", value: "RTL", },
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

	card.changePageSizeMode = function(value) {
		curPageSizeMode = value;
	};

	card.selectEditorLanguage = function(value) {
		var language = value;
		pickDefaultFontForLanguage(language);
		on_change_language_inner(language);
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