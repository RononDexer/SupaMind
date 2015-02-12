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
    var input = document.getElementById("jsonUploaded");
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
        fileReader.onload = parseJson;
        fileReader.readAsText(file);
    }

    function parseJson(e) {
        lines = e.target.result;
        var jsonMindmap = JSON.parse(lines);
        createMindmapFromJson(jsonMindmap);
    }
}

function createMindmapFromJson(mindmap){
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

function createMindmapFromScratch(){
    var newMindMap = {title:"Supa Mindmap"};
    edition=true;
    visualization=!edition;
    createMindmapFromJson(newMindMap);
}

function viewDemo(){
    visualization=true;
    edition=!visualization;
    var mindmap=loadJSON("test/mindMapWithContents.json",createMindmapFromJson);
    
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

function getNodeById(currentNode, ident){
    if(currentNode.ident==ident){
        return currentNode;
    }
    for(var i=0; i<currentNode.children.length ; i++){
        var son = currentNode.children[i];
        var returnVal=getNodeById(son, ident);
        if(returnVal){
            return returnVal;
        }
    }
    return null;
}

function getDepth(nodeStart,depth,currentDepth){
    if(!(nodeStart.hasOwnProperty('children')) || nodeStart.children.length==0 ){
        if(currentDepth>depth){
            depth = currentDepth;
        }
        return depth
    }    
    for (var i=0; i < nodeStart.children.length; i++){
        currentNode=nodeStart.children[i];
        currentDepth+=1; // we go down in the tree
		depth = getDepth(currentNode,depth, currentDepth);
		currentDepth-=1; //we go up in the tree
    }
    return depth;
}

function getScale(depth, canvasWidth){
    var displaySize= 4.7;//hierOneDisplaySize 
    for (var i=0; i < depth-2; i++){
        displaySize+=displaySize/Math.pow(diminLayout,4);
    }
    return displaySize;
}

function collisionExist(layout, point){
    if(point.x<layout.x+(layout.width/2) && point.x>layout.x-(layout.width/2)){
        if(point.y<layout.y+(layout.height/2) && point.y>layout.y-(layout.height/2)){
            return true;
        }
    }
    return false;
}

function collisionExistBetweenLayouts(layout1, layout2){
    //check if each of the 4 coins of the rectangle layout1 is in layout2
    //first corner : top right and then clockwise
    for(var i=0; i<4; i++){
        var point={x:0, y:0};
        if(i==0 || i==1){
            point.x=layout1.x+layout1.width/2;
        }
        if(i==2 || i==3){
            point.x=layout1.x-layout1.width/2;
        }
        if(i==0 || i==3){
            point.y=layout1.y+layout1.height/2;
        }        
        if(i==1 || i==2){
            point.y=layout1.y-layout1.height/2;
        }
        returnVal= collisionExist(layout2, point);
        if (returnVal){
            return true;
        }
    }
    return false;
}

/*
*father is the father of the caculatedNode
*return 0 if no collision
*return 1 if collision is strong in x
*return 2 if collision is strong in y
*/
function externalCollisionExist(calculatedLayout, treeWthLayout, father){
    var nbSons=treeWthLayout.children.length;
    for(var i =0; i < nbSons; i++){
        var child=treeWthLayout.children[i];
        var colExist=collisionExistBetweenLayouts(calculatedLayout,child.layout);
        if(colExist){
            var deltaX=Math.abs(calculatedLayout.x-child.x);
            var deltaY=Math.abs(calculatedLayout.y-child.y);
            if (deltaX>deltaY){
                return 1;
            }
            return 2;
        }   
        if(!Object.is(child,father)){//tester Object.is(treeWthLayout,father) pour détecter aussi les collisions internes
            var returnVal=externalCollisionExist(calculatedLayout, child, father);
            if (returnVal==1 || returnVal==2){
                return returnVal;
            }
        }
    }
    return 0;
}

function addChildrenAndLayout(currentNode, childrenData){
    var nbSons = childrenData.length;
    var layout = currentNode.layout;
    var rayon = layout.width;
    var pi = Math.PI;
    for (var i =0; i < nbSons; i++){
        // Chaque point sur le cercle a pour coordonnées : Mk ( cos(k .2Pi/n) , sin(k .2Pi/n) )
        var positionX  = layout.x + rayon*Math.cos(i*2*(pi/nbSons))*1.9;
        var positionY  = layout.y + rayon*Math.sin(i*2*(pi/nbSons));
        //si ce n'est pas la racine : reduire le trace des fils
        var calculatedLayout={x:positionX, y:positionY, width:layout.width/diminLayout, height:layout.height/diminLayout};
        if(currentNode.ident!=root.ident){
            var rootLayout=root.layout;
            var deltaX=layout.x-rootLayout.x;
            var deltaY=rootLayout.y-layout.y;
            var beginPoint=0;
            var nbPtsForAllCircle=(nbSons-1)*4//si on considere 1/4 de cercle
            if (nbSons==1){
                 nbPtsForAllCircle=4;
            }
            if(deltaX>0+rootLayout.height && deltaY<0-rootLayout.height){//positionner sur le quart droit inferieur
                beginPoint=0;
            }
            else if((deltaX<0+rootLayout.height && deltaX>0-rootLayout.height) && deltaY<0-rootLayout.height){//positionner sur le quart en bas
                beginPoint=0.125;
            }
            else if(deltaX<0-rootLayout.height && deltaY<0-rootLayout.height){//positionner sur le quart gauche inferieur
                beginPoint=0.25;
            }
            else if( deltaX<0-rootLayout.height && (deltaY<0+rootLayout.height && deltaY>0-rootLayout.height) ){//positionner sur le quart a gauche
                beginPoint=0.375;
            }
            else if(deltaX<0-rootLayout.height  && deltaY>0+rootLayout.height){//positionner sur le quart gauche superieur
                beginPoint=0.5;
            }
            else if( (deltaX<0+rootLayout.height && deltaX>0-rootLayout.height) && deltaY>0+rootLayout.height){//positionner sur le quart en haut
                beginPoint=0.625;
            }
            else if(deltaX>0+rootLayout.height && deltaY>0+rootLayout.height){//positionner sur le quart droit superieur
                beginPoint=0.75;
            }
            else if(deltaX>0+rootLayout.height && (deltaY<0+rootLayout.height && deltaY>0-rootLayout.height)){//positionner sur le quart a droite
                beginPoint=0.875;
            }
            beginPoint*=nbPtsForAllCircle;
            if (nbSons==1){
                beginPoint+=0.5;
            }
            var ratioLayout=layout.width/rootLayout.width;
            calculatedLayout.x = layout.x + rayon*Math.cos((beginPoint+i)*2*pi/nbPtsForAllCircle)*(1+Math.pow(ratioLayout,3));
            calculatedLayout.y = layout.y + rayon*Math.sin((beginPoint+i)*2*pi/nbPtsForAllCircle);
            var colExist=externalCollisionExist(calculatedLayout, root, currentNode);
            var calls=1;
	        while (colExist!=0 && calls<4){//il faut rapprocher le noeud
	            if(colExist==1){
    	            calculatedLayout.x = layout.x+(calculatedLayout.x-layout.x)*0.8;
	            }
	            else{
                    calculatedLayout.y = layout.y+(calculatedLayout.y-layout.y)*0.8;
                }
                calls+=1;
                colExist=externalCollisionExist(calculatedLayout, root, currentNode);
	        }
        }
        
        var childTitle = childrenData[i].title;
        var strokeSize=0.05*layout.width/diminLayout;
        var childLayout = canvas.display.rectangle({ 
            x: calculatedLayout.x, 
            y: calculatedLayout.y, 
            origin: { x: "center", y: "center" },
            width: layout.width/diminLayout, 
            height: layout.height/diminLayout, 
            fill: "#29b", 
            stroke: strokeSize+"px #29b",
            join : "round"            
        });
        
        var child = new Node(childTitle, [], [], childLayout, canvas);
        currentNode.addChild(child, canvas);
    }
    for(var i=0;i < nbSons;i++){
        var child=currentNode.children[i];
        childData=childrenData[i];
        if ( childData.hasOwnProperty('children') ){
            addChildrenAndLayout(child, childData.children);
        }
    }  
}

//code function drawMindMap

function drawMindmap(currentNode,root,canvas,edition) {
    var nbSons = currentNode.children.length;
    var dragOptions = { changeZindex: true };
    for (var i =0; i < nbSons; i++){
        var child = currentNode.children[i];
        drawMindmap(child,root,canvas,edition);
        canvas.addChild(child.vertexLayout);
        child.layout.addChild(child.titleLayout);//pour afficher texte dans noeud
        canvas.addChild(child.layout);
        if(edition){
            child.layout.dragAndDrop(dragOptions);
        }
        if(edition){//pour les fils
            child.layout.bind("mousemove", function () {
                var clickedNode=getNodeById(root,this.ident);
                for(var j =0; j < clickedNode.children.length; j++){
                    var son = clickedNode.children[j];
                    son.vertexLayout.start={ x: this.x, y: this.y };
                }
                clickedNode.vertexLayout.end={ x: this.x, y: this.y };
            });
        }
    }
}

function addContents(currentNode, data){
    for (var i =0; i < data.contents.length; i++){
        var dataContent = data.contents[i];
        var currentContent=new Content(dataContent.type,dataContent.information)
        currentNode.addContent(currentContent);
    }
    //recursive call
    for (var i =0; i < currentNode.children.length; i++){
	    addContents(currentNode.children[i],data.children[i]);
    }
}

function bindNodesVisualisation(currentNode,root) {
    if(root==undefined){
        root=currentNode;
    }
    //currentNode treatment
    currentNode.layout.bind("dblclick tap", function () {
        var clickedNode=getNodeById(root,this.ident);
        //display node title
        divVisual =document.getElementById('visualization');
        divVisual.innerHTML = "<center><h2>"+clickedNode.title+"</h2></center><br>";
        //display node content
        divPopup =document.getElementById('popupVis');
        var popupWidthText=getComputedStyle(divPopup,null).width;
        var popupWidth= parseInt(popupWidthText.split("px")[0]);
        for(var i=0;i<clickedNode.contents.length;i++){
            var currentContent = clickedNode.contents[i];
            var layout={width:popupWidth*85/100};
            divVisual.innerHTML+=currentContent.getPackagedInformation(layout)+"<br>";
            if (currentContent.type=="picture"){
                divVisual.innerHTML+="<br><br>";
            }
        }
        lastNodeClickedId=this.ident;
        document.getElementById('showBox').click();//lancement overlay
    });
    var nbSons = currentNode.children.length;
    for (var i =0; i < nbSons; i++){
        //appel recursif sur les fils
        var child = currentNode.children[i];
        bindNodesVisualisation(child,root);
    }
}

function bindNodesEdition(currentNode,root) {
    if(root==undefined){
        root=currentNode;
    }
    //traitement de currentNode	
    currentNode.layout.bind("dblclick tap", function () {
        var clickedNode=getNodeById(root,this.ident);
        document.getElementById('newTextValue').value = clickedNode.title;//nommage champ a remplir
        var contentsValue = "";
        for(var i=0;i<clickedNode.contents.length;i++){
            var currentContent = clickedNode.contents[i];
            if (currentContent.type=="picture"){
                    contentsValue+="img:";
            }
            contentsValue+= currentContent.information+"\n";
        }		 
        document.getElementById('nodeContent').value = contentsValue;//nommage champ a remplir
        lastNodeClickedId=this.ident;
        document.getElementById('editBox').click();//lancement overlay
    });
    var nbSons = currentNode.children.length;
    for (var i =0; i < nbSons; i++){
        //appel recursif sur les fils
        var child = currentNode.children[i];
        bindNodesEdition(child,root);
    }
}

function bindNodesMouseMove(currentNode,root) {
    if(root==undefined){
        root=currentNode;
    }
    
    //binding layout avec la souris
    currentNode.layout.bind("mouseenter", function () {
        if (visualization){
            canvas.mouse.cursor("pointer");
        }
        if(edition && !this.addButton){
            var clickedNode=getNodeById(root,this.ident);            
            this.addButton = addButtonToNode("+",clickedNode,0);
            if (this.ident!=root.ident){
                this.delButton = addButtonToNode("-",clickedNode,1);
            }
        }
    })
    currentNode.layout.bind("mouseleave", function () {
	canvas.mouse.cursor("default");
	if(edition){
	    if(this.addButton){                
		var layoutCollision = this.addButton.clone({width: this.addButton.width*1.2, height: this.addButton.height*2.5});
		var keepButton=collisionExist(layoutCollision,canvas.mouse);
		if(!keepButton){
		    canvas.removeChild(this.addButton);
		    this.addButton = undefined;
                    if(this.delButton){
                        canvas.removeChild(this.delButton);
                        this.delButton = undefined;
                    }
		}		
	    }            
	}
    });
    var nbSons = currentNode.children.length;
    for (var i =0; i < nbSons; i++){
        //appel recursif sur les fils
        var child = currentNode.children[i];
        bindNodesMouseMove(child,root);
    }
}

function addButtonToNode(name,clickedNode,position){
    //caclulate position
    var calcSize=clickedNode.layout.height/2;
    var calcX=clickedNode.layout.x+clickedNode.layout.width/2;
    var calcY=clickedNode.layout.y-clickedNode.layout.height/2;
    calcX-=calcSize/2;
    calcY+=calcSize/2.1;
    if(position==1){
        calcY=calcY+calcSize+2;
    }
    var layoutButton = canvas.display.rectangle({
        x: calcX,
        y: calcY,
        origin: { x: "center", y: "center" },
        width: calcSize,
        height: calcSize,
        fill: "#999",
        stroke: "1px #000",
        join: "round"
    });
    layoutButton.ident=clickedNode.ident;
    var textSize=layoutButton.width;
    var textLayoutButton = canvas.display.text({
        x: 0,
        y: 0,
        origin: { x: "center", y: "center" },
        align: "center",
        font: "bold "+textSize+"px sans-serif",
        text: name,
        fill: "#fff"
    });
    layoutButton.addChild(textLayoutButton);
    //buttons binding
    if(name=="+"){
        layoutButton.bind("click tap", function () {
            var relatedNode=getNodeById(root,this.ident);
            addChildToNode(relatedNode);
        });
    }
    else{//name="-"
        layoutButton.bind("click tap", function () {
            var relatedNode=getNodeById(root,this.ident);
            deleteNodeLayout(relatedNode);
            var father = getFather(relatedNode,root);
            for(var i =0; i < father.children.length; i++){
                if(father.children[i].ident==relatedNode.ident){
                    father.children.splice(i, 1);
                }
            }
        });
    }
    layoutButton.bind("mouseenter", function () {
        canvas.mouse.cursor("pointer");
    });
    layoutButton.bind("mouseleave", function () {
        canvas.mouse.cursor("default");
    });
    //display button
    canvas.addChild(layoutButton);
    return layoutButton;
}

function getFather(node,currentNode){
    for(var i =0; i < currentNode.children.length; i++){
        if(currentNode.children[i].ident==node.ident){
            return currentNode;
        }
    }
    for(var i =0; i < currentNode.children.length; i++){
        var father = getFather(node, currentNode.children[i]);
        if(father){
            return father;
        }
    }
}

function addChildToNode(relatedNode){
    for(var i =0; i < relatedNode.children.length; i++){
        deleteNodeLayout(relatedNode.children[i]);
    }
    var newChildData = {title:"new Node"};
    var childrenData=relatedNode.children;
    childrenData.push(newChildData);
    relatedNode.children=[];
    //remove link between text and layout
    relatedNode.layout.removeChild(relatedNode.titleLayout);
    //recaculate children's layout
    addChildrenAndLayout(relatedNode, childrenData, root, canvas);
    drawMindmap(relatedNode,root,canvas,edition);//draw
    //relink text and layout
    relatedNode.layout.addChild(relatedNode.titleLayout);
    //put node above vertex
    canvas.removeChild(relatedNode.layout);
    canvas.addChild(relatedNode.layout);
    //link node edition 
    for(var i =0; i < relatedNode.children.length; i++){
        bindNodesEdition(relatedNode.children[i],root); 
        bindNodesMouseMove(relatedNode.children[i],root); 
    }
    canvas.redraw();
}

function deleteNodeLayout(relatedNode){
    for(var i =0; i < relatedNode.children.length; i++){
        deleteNodeLayout(relatedNode.children[i]);
    }
    //make sure there are no buttons left on the node
    if(relatedNode.layout.addButton){
        canvas.removeChild(relatedNode.layout.addButton);
        relatedNode.addButton = undefined; 
    }
    if(relatedNode.layout.delButton){
        canvas.removeChild(relatedNode.layout.delButton);
        relatedNode.delButton = undefined;
    }
    //delete layout
    if(relatedNode.ident!=root.ident){
        canvas.removeChild(relatedNode.vertexLayout);
    }
    canvas.removeChild(relatedNode.layout);
}

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
