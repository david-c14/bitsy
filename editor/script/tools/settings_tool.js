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

		if (curSettingsTab === "editor") {
			menu.add({
				control: "label",
				text: "language:",
			});
		}
		else if (curSettingsTab === "system") {
			menu.add({
				control: "label",
				text: "font:",
			});

			menu.add({
				control: "label",
				text: "text direction:",
			});

			menu.add({
				control: "label",
				text: "animation:",
			});
		}
		else if (curSettingsTab === "publish") {
			menu.add({
				control: "label",
				text: "html page color:",
			});

			menu.add({
				control: "label",
				text: "game window size:",
			});
		}
	};

	card.changeSettingsTab = function(value) {
		curSettingsTab = value;
	};
});