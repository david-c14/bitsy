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


	change methods
		- UpdateChild
		- RemoveChild
		- InsertChild
*/

// TODO : rename? factory?
function ScriptEditor() {
	this.CreateEditor = function(scriptStr) {
		var scriptRootNode = scriptInterpreter.Parse( scriptStr );
		return new BlockNodeEditor(scriptRootNode, null, true);
	}
} // ScriptEditor

// TODO : name? editor or viewer? or something else?
function BlockNodeEditor(blockNode, parentNode, isEven) {
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
				var dialogNodeEditor = new DialogNodeEditor(dialogNodeList, self, isEven);
				div.appendChild(dialogNodeEditor.GetElement());

				dialogNodeList = [];

				childEditors.push(dialogNodeEditor);
			}
		}

		for (var i = 0; i < blockNode.children.length; i++) {
			var childNode = blockNode.children[i];
			if (childNode.type === "sequence" || childNode.type === "cycle" || childNode.type === "shuffle") {
				AddGatheredDialogNodes(div);

				var sequenceNodeEditor = new SequenceNodeEditor(childNode, self, isEven);
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

	this.SetNotifyChangeHandler = function(handler) {
		notifyChangeHandler = handler;
	}

	var self = this; // hacky!!!
	this.UpdateChild = function(childEditor) {
		var updatedChildren = [];
		for (var i = 0; i < childEditors.length; i++) {
			updatedChildren = updatedChildren.concat(childEditors[i].GetNodes());
		}

		blockNode.children = updatedChildren;

		if (childEditor.RequiresFullRefresh()) {
			self.div.innerHTML = "";
			InitChildEditors(self.div); // is this wasteful???
		}

		if (parentNode != null) {
			parentNode.UpdateChild(self);
		}

		if (self.OnChangeHandler != null) {
			self.OnChangeHandler();
		}
	}

	this.RequiresFullRefresh = function() {
		return false;
	}

	this.OnChangeHandler = null;

	InitChildEditors(this.div);
}

function DialogNodeEditor(dialogNodeList, parentNode, isEven) {
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

	var self = this;
	var OnChangeText = function() {
		console.log(textArea.value);
		fakeDialogRoot = scriptInterpreter.Parse(textArea.value);
		dialogNodeList = fakeDialogRoot.children;

		if (parentNode != null) {
			parentNode.UpdateChild(self);
		}
	}
	textArea.addEventListener("change", OnChangeText);
	textArea.addEventListener("keyup", OnChangeText);

	// var deleteButton = document.createElement("button");
	// deleteButton.innerText = "delete";
	// deleteButton.onclick = function() {
	// 	dialogNodeList = [];
	// 	notifyChangeHandler(true /*requiresChildNodeRefresh*/);
	// }
	// this.div.appendChild(deleteButton);

	this.GetNodes = function() {
		return dialogNodeList;
	}


	this.UpdateChild = function(childEditor) {
		// TODO ??
	}

	this.RequiresFullRefresh = function() {
		return dialogNodeList.some(function(node) {
			return node.type === "sequence" || node.type === "cycle" || node.type === "shuffle";
		});
	}
}

function SequenceNodeEditor(sequenceNode, parentNode, isEven) {
	Object.assign( this, new NodeEditorBase(isEven) );
	// Object.assign( this, new SelectableElement(this) );

	this.div.classList.add("sequenceNode");

	var span = document.createElement("span");
	span.innerText = sequenceNode.type;
	this.div.appendChild(span);

	for (var i = 0; i < sequenceNode.options.length; i++) {
		var optionBlockNode = sequenceNode.options[i];
		var optionBlockNodeEditor = new BlockNodeEditor(optionBlockNode, this, !isEven);
		this.div.appendChild(optionBlockNodeEditor.GetElement());
	}

	// var nodeList = [sequenceNode]; // TODO .. this is a bit of a hack really
	// var deleteButton = document.createElement("button");
	// deleteButton.innerText = "delete";
	// deleteButton.onclick = function() {
	// 	nodeList = [];
	// 	notifyChangeHandler(true /*requiresChildNodeRefresh*/);
	// }
	// this.div.appendChild(deleteButton);

	this.GetNodes = function() {
		return [sequenceNode];
	}

	var self = this;
	this.UpdateChild = function(childEditor) {
		if (parentNode != null) {
			parentNode.UpdateChild(self);
		}
	}

	this.RequiresFullRefresh = function() {
		return false; // TODO : move into base?
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