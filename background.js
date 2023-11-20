// Create the context menu item
chrome.contextMenus.create({
	id: "tabnote",
	title: "Create note",
	contexts: ["all"],
	documentUrlPatterns: ["<all_urls>"],
});

// on click of the context menu item
chrome.contextMenus.onClicked.addListener(function (info, tab) {
	// Create a new note at this position
	var note = {
		content: "",
		tabId: tab.id,
		tabTitle: tab.title,
	};

	// Save the note to Chrome's storage
	chrome.storage.sync.set({ [tab.id]: note }, function () {
		console.log("Note created");
	});

	// Send a message to the content script to create the note overlay
	chrome.tabs.sendMessage(tab.id, { action: "createNote", note: note });
});
// Listen for when a tab is removed or closed or
chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
	// Remove the note associated with this tab
	chrome.storage.sync.remove(tabId.toString(), function () {
		console.log("Note removed");
	});
});

// Listen for when a tab is updated
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	// If the tab has finished loading
	if (changeInfo.status === "complete") {
		// Get the note associated with this tab
		chrome.storage.sync.get(tabId.toString(), function (data) {
			var note = data[tabId];
			if (note) {
				// Send a message to the content script to show the note overlay
				chrome.tabs.sendMessage(tabId, {
					action: "showNote",
					note: note,
				});
			}
		});
	}
});

// Listen for when a tab focuses
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	// when popup asks for all notes
	if (request.action === "getNotes") {
		// get all notes from Chrome's storage
		chrome.storage.sync.get(null, function (data) {
			sendResponse(data);
		});
		return true;
	} else if (request.action === "deleteAll") {
		chrome.storage.sync.clear(function () {
			sendResponse();
		});
		chrome.tabs.query({}, function (tabs) {
			tabs.forEach(function (tab) {
				chrome.tabs.sendMessage(tab.id, {
					action: "hideNote",
				});
			});
		});

		return true;
	} else if (request.action === "updateNote") {
		chrome.storage.sync.set(
			{ [request.note.tabId]: request.note },
			function () {
				console.log("Note updated");
			}
		);
		return true;
	}
});
