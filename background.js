API_TOKEN = "insert API token here"
MODEL = "facebook/bart-large-cnn"

chrome.tabs.query({active: true, currentWindow: true}, async function(tabs) {
	currentTab = tabs[0]

	toggleLoader(true)
	displayInformation("", "")

	tabInformation = await getTabInformation(currentTab);
	modelResult = await runModel(MODEL, tabInformation["textToSummarise"]);

	toggleLoader(false)
	displayInformation(tabInformation["textTitle"], modelResult[0]['summary_text']);
	
});

function displayInformation(title, summary) {
	/**
	 * Displays the title and summary information in the extention pop-up.
	 **/
	document.getElementById('main-heading').textContent = title
	document.getElementById('summary').textContent = summary
}

function toggleLoader(toggleSwitch) {
	/**
	 * Toggles the display of the loader element.
	 */
	if (toggleSwitch) {
		document.getElementById('loader').style.display = "flex"
		document.getElementById('loader').style.flexDirection = "column"
		document.getElementById('loader').style.alignItems = "center"
	}

	else {
		document.getElementById('loader').style.display = "none"
	}
}


async function getTabInformation(tab) {
	/**
	 * Retrieves information from the active tab. In this case, it retrieves the 
	 * title of the article and the text that we want to summarise.
	 **/
	const response = await fetch(tab.url)
	const text = await response.text()

	parser = new DOMParser();
	doc = parser.parseFromString(text, 'text/html');
	tabInformation = {
		"textToSummarise": doc.getElementById('main-content').textContent,
		"textTitle": doc.getElementById('main-heading').textContent
	}

	return tabInformation
	
}

async function runModel(model, text) {
	/**
	 * Sends a request to a specified summarisation model given some text to summarise. 
	 **/
	data = JSON.stringify({"inputs": text});
	endpoint = `https://api-inference.huggingface.co/models/${model}`;
	
	const response = await fetch(
        endpoint,
        {
            headers: { Authorization: `Bearer ${API_TOKEN}` },
            method: "POST",
            body: data,
        }
    );

    const result = await response.json();

    return result;
}