if ("serviceWorker" in navigator) {
	console.log("service workers exist :)");

	navigator.serviceWorker.register("sw.js").then(function (reg){
		console.log("service worker registered!");
	}).catch(function(error) {
		console.log("service worker registration failed :(");
		console.log("service worker error: " + error);
	});
}