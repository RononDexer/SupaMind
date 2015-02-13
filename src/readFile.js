function editMindmap(){
    edition=true;
    visualization=!edition;
    readFile();
}
function visualizeMindMap(){
    visualization=true;
    edition=!visualization;
    readFile();
}
    
function readFile() {
    var input = document.getElementById("fileUploaded");
    if (!input) {
        alert("Um, couldn't find the fileinput element.");
    }
    else if (!input.files) {
      alert("This browser doesn't seem to support the `files` property of file inputs.");
    }
    else if (!input.files[0]) {
      alert("Please select a file before clicking 'Edit it' or 'Visualize it'");
    }
    else {
        var file = input.files[0];
        var fileReader = new FileReader();
        var fileExtension = file.name.split('.').pop();
        if(fileExtension=="mm"){
            fileReader.onload = parseFreeMind;
        }
        else{
            fileReader.onload = parseJson;
        }
        fileReader.readAsText(file);
    }

    function parseJson(e) {
        lines = e.target.result;
        var jsonMindmap = JSON.parse(lines);
        createMindmapFromFile(jsonMindmap);
    }
    
    function parseFreeMind(e) {
        lines = e.target.result;
        var stringJson =xml2json.fromStr(lines);
        var tree = handleFreeMindAttributes(stringJson.map.node);
        createMindmapFromFile(tree);
    }
}

function createMindmapFromFile(mindmap){
    //clearing page
    var divIntroText=document.getElementById("textIntro");
    divIntroText.parentNode.removeChild(divIntroText);
    //changing Step2
    var divStep2Text=document.getElementById("step2Text");
    if(edition){    
        divStep2Text.innerHTML+="<center><h3 style='margin-top:-15px' >Step 2 :   You can drag elements at your convenience and double-click to edit a node</h3></center>";
    }
    else if(visualization){
        divStep2Text.innerHTML+="<center><h3 style='margin-top:-15px' >Step 2 : Double-click for visualize a node's content</h3></center>";      
    }
    divStep2Text.style.visibility="visible";
    //drawing mindmap
    var htmlCanvas=document.getElementById("canvas");
    htmlCanvas.style.visibility="visible";
    htmlCanvas.width=1500;
    htmlCanvas.height=900;
    var title = mindmap.title;
    alert('Ouverture de ' + title + ' en cours...');

    //Création du canevas oCanvas
    canvas = oCanvas.create({
        canvas: "#canvas",
        background: "#FFEFDB",
        fps: 60
    });

    //layout root
    var depth=getDepth(mindmap,0,0);
    diminLayout=1.3;//global
    var displaySize=getScale(depth, canvas.width);
    if(depth==0){
        displaySize*=2;
    }
    var rootWidth=canvas.width/displaySize;
    var layoutNode = canvas.display.rectangle({
        x: canvas.width / 2,
        y: canvas.height / 2,
        origin: { x: "center", y: "center" },
        width: rootWidth,
        height: rootWidth/5,
        fill: "#079",
        stroke: "10px #079",
        join: "round"
    });

    root = new Node(title, [], [], layoutNode, canvas);
    
    if(edition){//pour la racine
        root.layout.bind("mousemove", function () {
            for(var j =0; j < root.children.length; j++){
                var child = root.children[j];
                child.vertexLayout.start={ x: root.layout.x, y: root.layout.y };
            }
        });
    }
    if(mindmap.hasOwnProperty('children')){
        addChildrenAndLayout(root, mindmap.children);
    }
    
    if(mindmap.hasOwnProperty('contents')){
        addContents(root, mindmap);
    }
    //affichage arbre
    drawMindmap(root,root,canvas,edition);
    //affichage noeud racine
    root.layout.addChild(root.titleLayout);//pour afficher texte dans noeud
    canvas.addChild(root.layout);
    if(edition){    
        var dragOptions = { changeZindex: true };
        root.layout.dragAndDrop(dragOptions);
    }
    lastNodeClickedId=0;  
    if(edition){
        bindNodesEdition(root);            
    }
    if(visualization){
        bindNodesVisualisation(root);
    }    
    bindNodesMouseMove(root);
    var saveButton = document.getElementById('saveButton');
    saveButton.style.visibility="visible";
}

function viewDemo(){
    visualization=true;
    edition=!visualization;
    var mindmap=loadJSON("test/mindMapWithContents.json",createMindmapFromFile);
    
}

function loadJSON(path, success){
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){
        if (xhr.readyState === XMLHttpRequest.DONE) {
            success(JSON.parse(xhr.responseText));
        }
    };
    xhr.open("GET", path, true);
    xhr.send();
}


function handleFreeMindAttributes(treeFreeMind){
    if(Array.isArray(treeFreeMind)){//children list
        for(var i =0; i < treeFreeMind.length; i++){
            treeFreeMind[i]=handleFreeMindAttributes(treeFreeMind[i]);
        }
        return treeFreeMind;
    }
    else if(treeFreeMind.hasOwnProperty('node')){//current node
        var children=handleFreeMindAttributes(treeFreeMind.node);
        if(!Array.isArray(children)){
            children=[children];
        }
        return {title:treeFreeMind["@attributes"]["TEXT"], children:children};
    }
    else{//leaf
        return {title:treeFreeMind["@attributes"]["TEXT"]};
    }
}
