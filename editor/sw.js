/* 
SERVICE WORKER

TODO / NOTES:
- is the root directory the right place for this?
- wow I really need to clean up and re-organize my scripts..
- do I want to add any fallbacks if we're offline and objects aren't in the cache?
*/

var cacheVersionId = "bitsy-cache-v1";

self.addEventListener("install", function(event) {
	event.waitUntil(
		caches.open(cacheVersionId).then(function(cache) {
			return cache.addAll([
				"./manifest.json",
				"./index.html",
				"./app.js",
				"./image/cat5.png",
				"./style/bitsyStyle.css",
				"./style/editorAnimations.css",
				"./script/generated/resources.js",
				"./script/engine/color_util.js",
				"./script/engine/font.js",
				"./script/engine/transition.js",
				"./script/engine/script.js",
				"./script/engine/dialog.js",
				"./script/engine/renderer.js",
				"./script/engine/bitsy.js",
				"./script/shared/gfx.js",
				"./script/shared/card.js",
				"./script/shared/card_ui.js",
				"./script/tools/settings_tool.js",
				"./script/tools/paint_tool.js",
				"./script/util.js",
				"./script/icons.js",
				"./script/paint.js",
				"./script/room.js",
				"./script/room_markers.js",
				"./script/explorer.js",
				"./script/localization.js",
				"./script/event_manager.js",
				"./script/palette.js",
				"./script/color_picker.js",
				"./script/gif.js",
				"./script/exporter.js",
				"./script/dialog_editor.js",
				"./script/editor.js",
				"./script/inventory.js",
				"./style/googleNunito.css",
			]);
		})
	);
});

self.addEventListener("fetch", function(event) {
	// if the object exists in the cache, return it, otherwise try the network
	event.respondWith(
		caches.match(event.request).then(function(response) {
			return response || fetch(event.request);
		})
	);
});