chrome.tabs.reload();

// `web-ext` does not reload the manifest; runtime.reload() is required
const needsManifestReload = setTimeout(() => {
	chrome.runtime.reload();
}, 200);

// This event is fired when runtime.reload is called, but not when `web-ext` reloads it
chrome.runtime.onInstalled.addListener(() => {
	clearTimeout(needsManifestReload);
});
