/*
 *  SupaMind in JavaScript, html5, css3
 *
 *  This file is part of SupaMind
 *
 * This program is free software: you can redistribute it and/or modify it 
 * under the terms of the GNU General Public License as published by 
 * the Free Software Foundation, either version 3 of the License, or 
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, 
 * but WITHOUT ANY WARRANTY; without even the implied warranty of 
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the 
 * GNU General Public License for more details.
 *
 *
 * Authors:
 * Florin Buga
 * Amir Naar
 * Cedric Sclosser
 * Vivien Sommard
 */

 
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

function showHelp(){
    var textHelp = "Tips:\n"+
    " + In order to add contents, you have to edit the node (double-click on it in Edit mode) and in the content area you put some text and/or link to a picture.\n"+
    " + Each line of your input is considered as a content.\n"+
    " + In order to add a picture to a node, follow the procedure previously described to add a content and put 'img:linkToThisImage' in the content area.\n"+
    " + The order of your contents in the contents area is important and is taking in account when you reedit or visualize the node."
    alert(textHelp);
}
