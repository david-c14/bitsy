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
				control: "label",
				text: "<insert color controls>",
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

			menu.add({
				control: "label",
				text: "<insert language select>",
			});

			menu.endGroup();

			menu.add({
				control: "label",
				text: "<insert langauge credit>",
			});
		}
		else if (curSettingsTab === "system") {
			menu.startGroup();

			menu.add({
				control: "label",
				text: "font:",
			});

			menu.add({
				control: "label",
				text: "<insert font select>",
			});

			menu.endGroup();

			menu.add({
				control: "label",
				text: "<insert font description>",
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
				control: "label",
				text: "<insert text direction select>",
			});

			menu.endGroup();

			menu.add({
				control: "label",
				text: "(option for languages that read right to left)",
			});

			menu.add({
				control: "label",
				text: "animation:",
			});

			menu.add({
				control: "label",
				text: "<TODO: animation settings>",
			});
		}
	};

	card.changeSettingsTab = function(value) {
		curSettingsTab = value;
	};

	card.changePageSizeMode = function(value) {
		curPageSizeMode = value;
	};
});