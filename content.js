// Event listener for runtime messages
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if (request.action === "createNote") {
		handleCreateNoteAction(request, sender);
	} else if (request.action === "showNote") {
		handleShowNoteAction(request, sender);
	} else if (request.action === "hideNote") {
		handleHideNoteAction(request, sender);
	} else if (request.action === "deleteAll") {
		handleHideNoteAction(request, sender);
	}
});

// Function to create a note overlay
function createNoteOverlay(note) {
	const style = `
  <style id="tabnote-style">
  .note-overlay {
    position: fixed;
    top: 0px;
    right: 0px;
    margin: 50px;
    width: 250px;
    height: 150px;
    background-color: #fff;
    z-index: 99999;
    font-size: 18px;
    padding: 10px;
    font-family: cursive;
    resize: both;
    opacity: 0.5;
    overflow: auto;
    background-color: yellow;
    color: black;
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5);
  }

  .note-overlay:hover {
    opacity: 1;
  }
  </style>
  `;
	document.head.insertAdjacentHTML("beforeend", style);

	const noteOverlay = document.createElement("div");
	noteOverlay.className = "note-overlay";
	noteOverlay.contentEditable = true;
	noteOverlay.innerText = note.content;
	// inject CSS into the note overlay
	noteOverlay.id = "tabnote-note";

	return noteOverlay;
}

// Function to update the note content
function updateNoteContent(note, noteOverlay) {
	note.content = noteOverlay.innerText;
	// console.log("updateNoteContent", note);
	chrome.runtime.sendMessage({ action: "updateNote", note: note });
}

// Function to handle 'createNote' action
function handleCreateNoteAction(request, sender) {
	const note = request.note;
	// console.log("Creating note", note);
	const noteOverlay = createNoteOverlay(note);
	document.body.prepend(noteOverlay);

	noteOverlay.addEventListener("input", function () {
		updateNoteContent(note, noteOverlay);
	});
}

// Function to handle 'showNote' action
function handleShowNoteAction(request, sender) {
	const note = request.note;
	console.log("Showing note", note);

	if (document.getElementById("tabnote-note")) {
		return; // do not create another note overlay
	}
	const noteOverlay = createNoteOverlay(note);
	document.body.prepend(noteOverlay);

	// TODO: focus on the note overlay (cursor inside)
}

// Function to handle 'hideNote' action
function handleHideNoteAction(request, sender) {
	console.log("Hiding note");
	const noteOverlay = document.getElementById("tabnote-note");
	if (noteOverlay) {
		noteOverlay.remove();
	}
}
