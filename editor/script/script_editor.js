// TODO : rename? factory?
function ScriptEditor() {
	this.CreateEditor = function(scriptStr) {
		var scriptRootNode = scriptInterpreter.Parse( scriptStr );
		return new BlockNodeEditor(scriptRootNode);
	}
} // ScriptEditor

// TODO : name? editor or viewer? or something else?
function BlockNodeEditor(blockNode) {
	var div = document.createElement("div");
	div.classList.add("blockNode");

	var dialogNodeList = [];
	function addGatheredDialogNodes() {
		if (dialogNodeList.length > 0) {
			var dialogNodeEditor = new DialogNodeEditor(dialogNodeList);
			div.appendChild(dialogNodeEditor.GetElement());

			dialogNodeList = [];
		}
	}

	for (var i = 0; i < blockNode.children.length; i++) {
		var childNode = blockNode.children[i];
		if (childNode.type === "sequence" || childNode.type === "cycle" || childNode.type === "shuffle") {
			addGatheredDialogNodes();

			var sequenceNodeEditor = new SequenceNodeEditor(childNode);
			div.appendChild(sequenceNodeEditor.GetElement());
		}
		else {
			// gather dialog nodes
			dialogNodeList.push(childNode);
		}
	}

	addGatheredDialogNodes();

	this.GetElement = function() {
		return div;
	}
}

function DialogNodeEditor(dialogNodeList) {
	// TODO : pull out boiler plate code
	var div = document.createElement("div");
	div.classList.add("dialogNode");

	// TODO: I still find this hacky
	var fakeDialogRoot = scriptUtils.CreateDialogBlock(dialogNodeList);

	var textArea = document.createElement("textarea");
	textArea.value = fakeDialogRoot.Serialize();
	div.appendChild(textArea);

	this.GetElement = function() {
		return div;
	}
}

function SequenceNodeEditor(sequenceNode) {
	var div = document.createElement("div");
	div.classList.add("sequenceNode");

	for (var i = 0; i < sequenceNode.options.length; i++) {
		var optionBlockNode = sequenceNode.options[i];
		var optionBlockNodeEditor = new BlockNodeEditor(optionBlockNode);
		div.appendChild(optionBlockNodeEditor.GetElement());
	}

	this.GetElement = function() {
		return div;
	}
}