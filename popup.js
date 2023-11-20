// // Get notes list from background.js
chrome.runtime.sendMessage({ action: "getNotes" }, function (response) {
	populateNotes(response);
});

function populateNotes(data) {
	const noteList = document.getElementById("noteList");
	noteList.innerHTML = "";
	for (const key in data) {
		const note = data[key];
		const listItem = document.createElement("li");
		listItem.innerHTML = `<b>${note.tabTitle?.substring(
			0,
			20
		)}... </b>: ${note.content.substring(0, 20)}`;
		listItem.addEventListener("click", function () {
            console.log ("listItem.addEventListener", note.tabId, note.tabTitle);
			// switch to the tab
			chrome.tabs.update(note.tabId, { active: true });

			// close the popup
			window.close();
		});
		noteList.appendChild(listItem);
	}
}

// // delete all button
const deleteAllButton = document.getElementById("deleteAll");
deleteAllButton.addEventListener("click", function () {
	chrome.runtime.sendMessage({ action: "deleteAll" }, function (response) {
		console.log("Notes deleted");
		populateNotes({});
	});
});
