import "./popup.css";
import formatter from "../../../formatter/formatter.js"

const formatScriptBtn = document.getElementById("format-btn");

chrome.storage.sync.get("dbType", async (result) => {
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	const dbTypeInput = document.getElementById("db-type");
	if (typeof(result?.dbType) === "number"){
		dbTypeInput.value = result.dbType;
	} else {
		chrome.storage.sync.set({dbType: 0});
	}

	dbTypeInput.addEventListener("change", (event) => {
		const value = event.target?.value || 0;
		chrome.storage.sync.set({dbType: parseInt(value)});
	})

	chrome.scripting.executeScript({
		target: { tabId: tab.id },
		function: getCreatioServerParameters
	}, updateSQLText);
})

const updateSQLText = (parameters) => {
	if (parameters && parameters[0] && parameters[0]?.result)
	{
		const {isCorrectUrl, url} = parameters[0]?.result;

		if (parameters[0].result?.isCorrectUrl){
			const placeholder = document.getElementById("placeholder");
			if (placeholder){
				placeholder.remove();
			}
		}
	
		chrome.storage.sync.get("script", async (result) => {
			if (result?.script?.url === url){
				updateOutput(result.script.text);
			}
		});
	}
}

formatScriptBtn.addEventListener("click", async () => {
	formatScriptBtn.disabled = true;
  	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	chrome.scripting.executeScript({
		target: { tabId: tab.id },
    	function: getCreatioServerParameters
	}, sendFormatMessage);
});

const sendFormatMessage = (injectionResults) => {
	if (injectionResults && injectionResults.length !== 0){
		const injectionResult = injectionResults[0];
		if (injectionResult && injectionResult.result?.token && 
			injectionResult.result?.schemaUId && 
			injectionResult.result?.url){
			const parameters = {
				token: injectionResult.result.token,
				url: injectionResult.result.url,  
				schemaUId: injectionResult.result.schemaUId
			}
			chrome.runtime.sendMessage(parameters, processFormattedScript);
		}
	}
}

const processFormattedScript = async (response) => {
	formatScriptBtn.disabled = false;
	if (response && response.caption && response.rights && 
		response.rights.length !== 0 && response.schemaUId){
		chrome.storage.sync.set({schemaUId: response.schemaUId});
		const dbType = document.getElementById("db-type")?.value || 0;
		const scriptFormatter = formatter(parseInt(dbType));
		const sqlScript = scriptFormatter(response.caption, response.schemaUId, response.rights);
		updateOutput(sqlScript);
		chrome.storage.sync.set({script: {url: response.url, text: sqlScript}});
		
		const isBind = document.getElementById("bind-checkbox").checked;
		if (isBind){
			const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
			chrome.scripting.executeScript({
				target: { tabId: tab.id },
				function: getCreatioServerParameters
			}, bindToPackage);
		}
	}
}

const getCreatioServerParameters = () => {
	if (document?.cookie && window?.location?.href && location?.origin){
		const cookies = document.cookie.split("=");
		const urlParts = window.location.href.split("/");
		const isCorrectUrl = urlParts && urlParts.length > 2 && 
			urlParts[urlParts.length - 2] === "AdministratedObjects";
		if (cookies && cookies.length >= 1 && urlParts && urlParts.length !== 0){
			const token = cookies[1];
			const schemaUId = urlParts[urlParts.length - 1];
			const url = location.origin;
			return {url, token, schemaUId, isCorrectUrl}
		}
	}
	return null;
}

const bindToPackage = async (injectionResults) => {
	chrome.storage.sync.get("schemaUId", (result) => {
		if (injectionResults && injectionResults.length !== 0){
			const injectionResult = injectionResults[0];
			const outputElement = document.getElementById("output");
			if (injectionResult.result?.token &&
				injectionResult.result?.url && outputElement && 
				outputElement.textContent){
				fetch(`${injectionResult.result.url}/0/rest/RightsScriptGeneratorService/GenerateScript`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"BPMCSRF": injectionResult.result.token
					},
					body: JSON.stringify({
						script: outputElement.textContent,
						schemaUId: result.schemaUId
					})
					}
				).then(res => res.json())
				.then(res => {
					if (res?.GenerateScriptResult?.IsSuccessful && res?.GenerateScriptResult?.ScriptUrl){
						chrome.tabs.create({ url: res.GenerateScriptResult.ScriptUrl })
					}
				});
			}
		}
	});
}

const updateOutput = (script) => {
	const outputElement = document.getElementById("output");
	outputElement.textContent = script;
	const popup = document.querySelector(".popup-body");
	popup.style.width = "600px";
	outputElement.style.height = "300px";
}