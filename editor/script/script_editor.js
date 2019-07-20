/*
- TODO
	- add nodes
		X dialog
		- sequence
		- cycle
		- shuffle
	X remove nodes
	X move nodes
	- drag nodes
	X make nesting clear
	- use real dialog renderer
	- minimize / maximize blocks
	- share more code between node editors
	- make order of nodes clearer (some kind of arrow?)
	X update game when nodes change
		X insert sequence nodes and so on if you try to type supported code into a dialog node text editor
			- this could be improved probably
	- figure out the bug w/ extra whitespace inside of sequences
	- can I create HTML templates for the blocks? so I don't have to specify everything in code?
	- swap order of items in sequence (and delete them)
	- inter-block movement of nodes
	- copy / cut / paste nodes
	- "workbench" area? for non-attached, non-deleted nodes

	change methods
		X UpdateChild
		X RemoveChild
		X InsertChild

NOTES
I could create a dialog block by doing post-processing of the nodes in each block
	- this would simplify some of the UI code
how do I treat the merging of dialog blocks? automatic? (sort of how it is now?) something you have to do on purpose?
blocks and nodes and editors oh my! need to sort out my terminology!!!
- having to assign parent node and is even at construction is a bit of a pain!! especially since those things need to change if the node moves...
- need to fix fucked up spacing with re-serialization of sequences
- need to be able to up / down / delete options in a sequence
- need to be able to insert actions, not just add them at the end
- need to be able to "pop out" nodes to a higher level (is dragging the best way to do this? cut and paste?)
*/

// TODO : rename? factory?
function ScriptEditor() {
	this.CreateEditor = function(scriptStr) {
		var scriptRootNode = scriptInterpreter.Parse( scriptStr );
		return new BlockNodeEditor(scriptRootNode, null);
	}
} // ScriptEditor

// TODO : name? editor or viewer? or something else?
function BlockNodeEditor(blockNode, parentNode) {
	Object.assign( this, new NodeEditorBase() );

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
				var dialogNodeEditor = new DialogNodeEditor(dialogNodeList, self);
				div.appendChild(dialogNodeEditor.GetElement());

				dialogNodeList = [];

				childEditors.push(dialogNodeEditor);
			}
		}

		for (var i = 0; i < blockNode.children.length; i++) {
			var childNode = blockNode.children[i];
			if (childNode.type === "sequence" || childNode.type === "cycle" || childNode.type === "shuffle") {
				AddGatheredDialogNodes(div);

				var sequenceNodeEditor = new SequenceNodeEditor(childNode, self);
				div.appendChild(sequenceNodeEditor.GetElement());

				childEditors.push(sequenceNodeEditor);
			}
			else {
				// gather dialog nodes
				dialogNodeList.push(childNode);
			}
		}

		AddGatheredDialogNodes(div);

		// TODO : put add butotn here if it's empty
		hackyAddButton();
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
		UpdateNodeChildren();

		if (childEditor.RequiresFullRefresh()) { // TODO -- I wonder if it would be simpler to always do this?
			self.div.innerHTML = ""; // inefficient?
			InitChildEditors(self.div);
		}

		SendUpdateNotification();
	}

	this.RemoveChild = function(childEditor) {
		self.div.removeChild(childEditor.GetElement());
		childEditors.splice(childEditors.indexOf(childEditor),1);
		console.log(childEditors);

		// it's a little weird to me the way I've broken up these...
		UpdateNodeChildren();

		SendUpdateNotification();

		// hacky as fuck -- just a temp prototype
		hackyAddButton();
	}

	function hackyAddButton() {
		if (blockNode.children.length <= 0 ) {
			var addButton = document.createElement("button");
			addButton.innerText = "add action";
			self.div.appendChild(addButton);
		}
	}

	this.IndexOfChild = function(childEditor) {
		return childEditors.indexOf(childEditor);
	}

	this.InsertChild = function(childEditor, index) {
		index = Math.max(index, 0);

		var beforeInsert = childEditors.slice(0,index);
		var afterInsert = childEditors.slice(index);

		console.log(index);
		console.log(beforeInsert);
		console.log(afterInsert);

		childEditors = beforeInsert.concat([childEditor]).concat(afterInsert);

		// console.log(childEditors);

		UpdateNodeChildren();

		self.div.innerHTML = ""; // inefficient?
		// InitChildEditors(self.div);
		for (var i = 0; i < childEditors.length; i++) {
			self.div.appendChild(childEditors[i].GetElement());
		}

		SendUpdateNotification();
	}

	this.AppendChild = function(childEditor) {
		self.InsertChild(childEditor, childEditors.length);
	}

	function UpdateNodeChildren() {
		var updatedChildren = [];
		for (var i = 0; i < childEditors.length; i++) {
			updatedChildren = updatedChildren.concat(childEditors[i].GetNodes());
		}

		blockNode.children = updatedChildren;

		console.log(updatedChildren);
	}

	function SendUpdateNotification() {
		if (parentNode != null) {
			parentNode.UpdateChild(self);
		}

		if (self.OnChangeHandler != null) {
			self.OnChangeHandler();
		}
	}

	// this.Refresh = function() {
	// 	UpdateNodeChildren();

	// 	self.div.innerHTML = ""; // inefficient?
	// 	InitChildEditors(self.div);

	// 	SendUpdateNotification();
	// }

	this.RequiresFullRefresh = function() {
		return false;
	}

	this.OnChangeHandler = null;

	InitChildEditors(this.div);
}

function DialogNodeEditor(dialogNodeList, parentNode) {
	Object.assign( this, new NodeEditorBase() );
	// Object.assign( this, new SelectableElement(this) );

	this.div.classList.add("dialogNode");

	var topDiv = document.createElement("div");
	topDiv.style.marginBottom = "4px";
	this.div.appendChild(topDiv);

	var span = document.createElement("span");
	span.innerText = "show dialog";
	// span.style.display = "block";
	topDiv.appendChild(span);

	var controlDiv = document.createElement("div");
	controlDiv.style.float = "right";
	topDiv.appendChild(controlDiv);

	var moveUpButton = document.createElement("button");
	moveUpButton.innerText = "up";
	moveUpButton.onclick = function() {
		var insertIndex = parentNode.IndexOfChild(self);
		parentNode.RemoveChild(self);
		insertIndex -= 1;
		parentNode.InsertChild(self,insertIndex);
	}
	controlDiv.appendChild(moveUpButton);

	var moveDownButton = document.createElement("button");
	moveDownButton.innerText = "down";
	// deleteButton.style.float = "right";
	moveDownButton.onclick = function() {
		var insertIndex = parentNode.IndexOfChild(self);
		parentNode.RemoveChild(self);
		insertIndex += 1;
		parentNode.InsertChild(self,insertIndex);
	}
	controlDiv.appendChild(moveDownButton);

	var deleteButton = document.createElement("button");
	deleteButton.innerText = "delete";
	// deleteButton.style.float = "right";
	deleteButton.onclick = function() {
		parentNode.RemoveChild(self);
	}
	controlDiv.appendChild(deleteButton);

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

function SequenceNodeEditor(sequenceNode, parentNode) {
	Object.assign( this, new NodeEditorBase() );
	// Object.assign( this, new SelectableElement(this) );

	this.div.classList.add("sequenceNode");

	var topDiv = document.createElement("div");
	this.div.appendChild(topDiv);

	var span = document.createElement("span");
	span.innerText = sequenceNode.type;
	topDiv.appendChild(span);

	// TODO : THIS WHOLE THING IS A DUPLICATE
	var controlDiv = document.createElement("div");
	controlDiv.style.float = "right";
	topDiv.appendChild(controlDiv);

	var moveUpButton = document.createElement("button");
	moveUpButton.innerText = "up";
	moveUpButton.onclick = function() {
		var insertIndex = parentNode.IndexOfChild(self);
		parentNode.RemoveChild(self);
		insertIndex -= 1;
		parentNode.InsertChild(self,insertIndex);
	}
	controlDiv.appendChild(moveUpButton);

	var moveDownButton = document.createElement("button");
	moveDownButton.innerText = "down";
	// deleteButton.style.float = "right";
	moveDownButton.onclick = function() {
		var insertIndex = parentNode.IndexOfChild(self);
		parentNode.RemoveChild(self);
		insertIndex += 1;
		parentNode.InsertChild(self,insertIndex);
	}
	controlDiv.appendChild(moveDownButton);

	var deleteButton = document.createElement("button");
	deleteButton.innerText = "delete";
	// deleteButton.style.float = "right";
	deleteButton.onclick = function() {
		parentNode.RemoveChild(self);
	}
	controlDiv.appendChild(deleteButton);

	for (var i = 0; i < sequenceNode.options.length; i++) {
		var optionBlockNode = sequenceNode.options[i];
		var optionBlockNodeEditor = new BlockNodeEditor(optionBlockNode, this);
		this.div.appendChild(optionBlockNodeEditor.GetElement());
	}

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

// TODO -- I think this was premature abstraction... probably need to refactor everything again!
function NodeEditorBase() {
	this.div = document.createElement("div");
	// this.div.classList.add(isEven ? "scriptNodeEven" : "scriptNodeOdd");

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
		// window.addEventListener("keydown", OnKeyDown);
		// window.addEventListener("keyup", OnKeyUp);

		lastSelectedScriptNode = self;

		event.stopPropagation();
	}

	this.Deselect = function() {
		base.div.classList.remove("scriptNodeSelected");
		// window.removeEventListener("keypress", OnKeyPress);
		// window.removeEventListener("keydown", OnKeyDown);
		// window.removeEventListener("keyup", OnKeyUp);
	}

	// var OnKeyPress = function(event) {
	// 	event.preventDefault();
	// }

	// ONLY NEED THIS ONE REALLY
	// var OnKeyDown = function(event) {
	// 	event.preventDefault();
	// 	console.log(event);
	// }

	// var OnKeyUp = function(event) {
	// 	event.preventDefault();
	// }
}