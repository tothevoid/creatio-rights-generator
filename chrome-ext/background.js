var formatScriptBtn = document.getElementById('formatScript');

formatScriptBtn.addEventListener("click", async () => {
	debugger;
	formatScriptBtn.disabled = true;
	const src = chrome.runtime.getURL("scriptFormatter.js");
	const contentMain = await import(src);

  	let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	chrome.scripting.executeScript({
		target: { tabId: tab.id },
    	function: getSchemaAndToken
  	}, (injectionResults) => {
    if (injectionResults && injectionResults.length !== 0){
    	const injectionResult = injectionResults[0];
    	if (injectionResult && injectionResult.result.token && injectionResult.result.schemaUId){
			chrome.runtime.sendMessage({
        		token: injectionResult.result.token,
        		url: injectionResult.result.url,  
          		schemaUId: injectionResult.result.schemaUId}, 
        	async (response) => {
				formatScriptBtn.disabled = false;
          		const sqlScript = contentMain.generateScript(response.caption, injectionResult.result.schemaUId, response.rights);
          		var outputElement = document.getElementById('result');
          		outputElement.textContent = sqlScript;
        });
      }
    }
  });
});

const getSchemaAndToken = () => {
	const token = document.cookie.split("=")[1];
	const urlParts = window.location.href.split("/");
	const schemaUId = urlParts[urlParts.length - 1];
	const url = location.origin;

	return {url, token, schemaUId}
}