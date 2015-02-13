function saveNode(){
    var nodeToChange=getNodeById(root,lastNodeClickedId);
    saveNodeName(nodeToChange);
    saveNodeContent(nodeToChange);
}

function saveNodeName(nodeToChange){
    var newText=document.getElementById('newTextValue').value;
    if(newText!="" && newText!=nodeToChange.title){
            nodeToChange.setTitle(newText);
            canvas.redraw();
    }
}

function saveNodeContent(nodeToChange){
    var newContents = document.getElementById('nodeContent').value;
    var newContentsText = newContents.split("\n");
    nodeToChange.contents=[];
    for (var i=0;i<newContentsText.length;i++){
        var contentTag = newContentsText[i].split(":")[0].split(" ");
	    var currentContent;
        if(contentTag=="img"){
        	var contentSplit = newContentsText[i].split(":");
        	var contentInfo=contentSplit.slice(1,contentSplit.length).join(":");
        	currentContent = new Content("picture",contentInfo);
        }
        else{
        	currentContent = new Content("text",newContentsText[i]);
        }
        nodeToChange.addContent(currentContent);
    }
}

function isInt(value) {
    return !isNaN(value) && parseInt(Number(value)) == value && !isNaN(parseInt(value, 10));
}

function saveMindMap(){
    seen=[];
    function simplifyAttrib(key, value) {
        if( key && !isInt(key) && !( key=="title" || key=="contents" || key=="children" || key=="information" || key=="type") ){
            return undefined;
        }
        if (value != null && typeof value == "object"){
            if (seen.indexOf(value) >= 0)
                return
            seen.push(value);
        }
        return value;
    }

    var jsonToWrite= JSON.stringify(root, simplifyAttrib);
    saveTextAsFile(jsonToWrite,"mindMapSaved.json");
}


function saveTextAsFile(textToWrite, nameFile)
{
    var textFileAsBlob = new Blob([textToWrite], {type:'text/plain'});
    var fileNameToSaveAs = nameFile;

    var downloadLink = document.createElement("a");
    downloadLink.download = fileNameToSaveAs;
    downloadLink.innerHTML = "Download File";
    if (window.webkitURL != null)
    {
            // Chrome allows the link to be clicked
            // without actually adding it to the DOM.
            downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
    }
    else
    {
            // Firefox requires the link to be added to the DOM
            // before it can be clicked.
            downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
            downloadLink.onclick = destroyClickedElement;
            downloadLink.style.display = "none";
            document.body.appendChild(downloadLink);
    }

    downloadLink.click();
}

function destroyClickedElement(event)
{
    document.body.removeChild(event.target);
}

function loadFileAsText()
{
    var fileToLoad = document.getElementById("fileToLoad").files[0];

    var fileReader = new FileReader();
    fileReader.onload = function(fileLoadedEvent) 
    {
            var textFromFileLoaded = fileLoadedEvent.target.result;
            document.getElementById("inputTextToSave").value = textFromFileLoaded;
    };
    fileReader.readAsText(fileToLoad, "UTF-8");
}
