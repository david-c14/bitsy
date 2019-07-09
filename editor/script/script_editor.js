/*
- TODO
	- add / remove nodes
	- move nodes (by dragging them)
	- make nesting clear
	- use real dialog renderer
	- minimize / maximize blocks
	- share more code between node editors
	- make order of nodes clearer (some kind of arrow?)
	- update game when nodes change
		- insert sequence nodes and so on if you try to type supported code into a dialog node text editor
*/

// TODO : rename? factory?
function ScriptEditor() {
	this.CreateEditor = function(scriptStr) {
		var scriptRootNode = scriptInterpreter.Parse( scriptStr );
		return new BlockNodeEditor(scriptRootNode, null, true);
	}
} // ScriptEditor

// TODO : name? editor or viewer? or something else?
function BlockNodeEditor(blockNode, notifyChangeHandler, isEven) {
	Object.assign( this, new NodeEditorBase(isEven) );

	this.div.classList.add("blockNode");

	// var minimizeButton = document.createElement("button");
	// minimizeButton.innerText = "minimize";
	// this.div.appendChild(minimizeButton);

	var childEditors = [];

	function InitChildEditors(div) {
		childNodeEditors = [];

		var dialogNodeList = [];
		function AddGatheredDialogNodes(div) {
			if (dialogNodeList.length > 0) {
				var dialogNodeEditor = new DialogNodeEditor(dialogNodeList, OnChange, isEven);
				div.appendChild(dialogNodeEditor.GetElement());

				dialogNodeList = [];

				childEditors.push(dialogNodeEditor);
			}
		}

		for (var i = 0; i < blockNode.children.length; i++) {
			var childNode = blockNode.children[i];
			if (childNode.type === "sequence" || childNode.type === "cycle" || childNode.type === "shuffle") {
				AddGatheredDialogNodes(div);

				var sequenceNodeEditor = new SequenceNodeEditor(childNode, OnChange, isEven);
				div.appendChild(sequenceNodeEditor.GetElement());

				childEditors.push(sequenceNodeEditor);
			}
			else {
				// gather dialog nodes
				dialogNodeList.push(childNode);
			}
		}

		AddGatheredDialogNodes(div);
	}

	this.Serialize = function() {
		// TODO: I **need** to get rid of the triple quotes thing it sucks
		return '"""\n' + blockNode.Serialize() + '\n"""';
	}

	var self = this; // hacky!!!
	function OnChange(requiresChildNodeRefresh) {
		var updatedChildren = [];
		for (var i = 0; i < childEditors.length; i++) {
			updatedChildren = updatedChildren.concat(childEditors[i].GetNodes());
		}

		console.log(updatedChildren);

		blockNode.children = updatedChildren;
		console.log(blockNode.Serialize());

		// TODO : I'm a little worried this will get hard to handle
		if (requiresChildNodeRefresh) {
			self.div.innerHTML = "";
			InitChildEditors(self.div); // is this wasteful???
		}

		if (notifyChangeHandler != null) {
			notifyChangeHandler();
		}
	}

	this.SetNotifyChangeHandler = function(handler) {
		notifyChangeHandler = handler;
	}

	InitChildEditors(this.div);
}

function DialogNodeEditor(dialogNodeList, notifyChangeHandler, isEven) {
	Object.assign( this, new NodeEditorBase(isEven) );
	// Object.assign( this, new SelectableElement(this) );

	this.div.classList.add("dialogNode");

	var span = document.createElement("span");
	span.innerText = "show dialog";
	span.style.display = "block";
	this.div.appendChild(span);

	// TODO: I still find this hacky
	var fakeDialogRoot = scriptUtils.CreateDialogBlock(dialogNodeList);

	var textArea = document.createElement("textarea");
	textArea.value = fakeDialogRoot.Serialize();
	this.div.appendChild(textArea);

	var OnChangeText = function() {
		console.log(textArea.value);
		fakeDialogRoot = scriptInterpreter.Parse(textArea.value);
		dialogNodeList = fakeDialogRoot.children;
		// TODO -- how do I make sure everything updates correctly??

		var requiresChildNodeRefresh = false;
		if (dialogNodeList.length > 0) {
			var lastChild = dialogNodeList[dialogNodeList.length - 1];
			if (lastChild.type === "sequence" || lastChild.type === "cycle" || lastChild.type === "shuffle") {
				requiresChildNodeRefresh = true;
			}
		}

		notifyChangeHandler(requiresChildNodeRefresh);
	}
	textArea.addEventListener("change", OnChangeText);
	textArea.addEventListener("keyup", OnChangeText);

	var deleteButton = document.createElement("button");
	deleteButton.innerText = "delete";
	deleteButton.onclick = function() {
		dialogNodeList = [];
		notifyChangeHandler(true /*requiresChildNodeRefresh*/);
	}
	this.div.appendChild(deleteButton);

	this.GetNodes = function() {
		return dialogNodeList;
	}
}

function SequenceNodeEditor(sequenceNode, notifyChangeHandler, isEven) {
	Object.assign( this, new NodeEditorBase(isEven) );
	// Object.assign( this, new SelectableElement(this) );

	this.div.classList.add("sequenceNode");

	var span = document.createElement("span");
	span.innerText = sequenceNode.type;
	this.div.appendChild(span);

	for (var i = 0; i < sequenceNode.options.length; i++) {
		var optionBlockNode = sequenceNode.options[i];
		var optionBlockNodeEditor = new BlockNodeEditor(optionBlockNode, OnChange, !isEven);
		this.div.appendChild(optionBlockNodeEditor.GetElement());
	}

	var nodeList = [sequenceNode]; // TODO .. this is a bit of a hack really
	var deleteButton = document.createElement("button");
	deleteButton.innerText = "delete";
	deleteButton.onclick = function() {
		nodeList = [];
		notifyChangeHandler(true /*requiresChildNodeRefresh*/);
	}
	this.div.appendChild(deleteButton);

	this.GetNodes = function() {
		return nodeList;
	}

	function OnChange() {
		if (notifyChangeHandler != null) {
			notifyChangeHandler();
		}
	}
}

function NodeEditorBase(isEven) {
	this.div = document.createElement("div");
	this.div.classList.add(isEven ? "scriptNodeEven" : "scriptNodeOdd");

	this.GetElement = function() {
		return this.div;
	}
}

// TODO : work in progress
var lastSelectedScriptNode = null; // hacky global
function SelectableElement(base) {
	var self = this; // I hate doing this..

	base.div.classList.add("scriptNodeSelectable");

	base.div.onclick = function(event) {
		if (lastSelectedScriptNode != null) {
			lastSelectedScriptNode.Deselect();
		}

		base.div.classList.add("scriptNodeSelected");

		// window.addEventListener("keypress", OnKeyPress);
		window.addEventListener("keydown", OnKeyDown);
		// window.addEventListener("keyup", OnKeyUp);

		lastSelectedScriptNode = self;

		event.stopPropagation();
	}

	this.Deselect = function() {
		base.div.classList.remove("scriptNodeSelected");
		// window.removeEventListener("keypress", OnKeyPress);
		window.removeEventListener("keydown", OnKeyDown);
		// window.removeEventListener("keyup", OnKeyUp);
	}

	// var OnKeyPress = function(event) {
	// 	event.preventDefault();
	// }

	var OnKeyDown = function(event) {
		event.preventDefault();
		console.log(event);
	}

	// var OnKeyUp = function(event) {
	// 	event.preventDefault();
	// }
}