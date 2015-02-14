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

function createMindmapFromScratch(){
    var newMindMap = {title:"Supa Mindmap"};
    edition=true;
    visualization=!edition;
    createMindmapFromFile(newMindMap);
}

function addChildrenAndLayout(currentNode, childrenData){
    var nbSons = childrenData.length;
    var layout = currentNode.layout;
    var rayon = layout.width;
    var pi = Math.PI;
    for (var i =0; i < nbSons; i++){
        // Each points Mk on the circle have as coordinates : Mk (cos(k .2Pi/n) , sin(k .2Pi/n))
        var positionX  = layout.x + rayon*Math.cos(i*2*(pi/nbSons))*1.9;
        var positionY  = layout.y + rayon*Math.sin(i*2*(pi/nbSons));
        //If it is not the root : reduce the son
        var calculatedLayout={x:positionX, y:positionY, width:layout.width/diminLayout, height:layout.height/diminLayout};
        if(currentNode.ident!=root.ident){
            var rootLayout=root.layout;
            var deltaX=layout.x-rootLayout.x;
            var deltaY=rootLayout.y-layout.y;
            var beginPoint=0;
            var nbPtsForAllCircle=(nbSons-1)*4//if 1/4 of circle is considered
            if (nbSons==1){
                 nbPtsForAllCircle=4;
            }
            if(deltaX>0+rootLayout.height && deltaY<0-rootLayout.height){//positionning on the lower right quadrant
                beginPoint=0;
            }
            else if((deltaX<0+rootLayout.height && deltaX>0-rootLayout.height) && deltaY<0-rootLayout.height){//positionning on the lower quadrant
                beginPoint=0.125;
            }
            else if(deltaX<0-rootLayout.height && deltaY<0-rootLayout.height){//positionning on the lower left quadrant
                beginPoint=0.25;
            }
            else if( deltaX<0-rootLayout.height && (deltaY<0+rootLayout.height && deltaY>0-rootLayout.height) ){//positionning on the left quadrant
                beginPoint=0.375;
            }
            else if(deltaX<0-rootLayout.height  && deltaY>0+rootLayout.height){//positionning on the upper left quadrant
                beginPoint=0.5;
            }
            else if( (deltaX<0+rootLayout.height && deltaX>0-rootLayout.height) && deltaY>0+rootLayout.height){//positionning on the upper quadrant
                beginPoint=0.625;
            }
            else if(deltaX>0+rootLayout.height && deltaY>0+rootLayout.height){//positionning on the upper right quadrant
                beginPoint=0.75;
            }
            else if(deltaX>0+rootLayout.height && (deltaY<0+rootLayout.height && deltaY>0-rootLayout.height)){//positionning on the right quadrant
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
	        while (colExist!=0 && calls<4){//in order to bring near the nodes 
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


function drawMindmap(currentNode,root,canvas,edition) {
    var nbSons = currentNode.children.length;
    var dragOptions = { changeZindex: true };
    for (var i =0; i < nbSons; i++){
        var child = currentNode.children[i];
        drawMindmap(child,root,canvas,edition);
        canvas.addChild(child.vertexLayout);
        child.layout.addChild(child.titleLayout);//to display the text on the node 
        canvas.addChild(child.layout);
        if(edition){
            child.layout.dragAndDrop(dragOptions);
        }
        if(edition){//for the sons
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

//to get the adequate scale : see the whole mindmap in the canvas
function getScale(depth, canvasWidth){
    var displaySize= 0;
    for (var i=0; i <= depth; i++){
        displaySize+=1/Math.pow(diminLayout,i);
    }
    return displaySize*2.8;
}


//handles collision
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
        if(child.ident!=father.ident){//tester Object.is(treeWthLayout,father) to detect the internals collisions
            var returnVal=externalCollisionExist(calculatedLayout, child, father);
            if (returnVal==1 || returnVal==2){
                return returnVal;
            }
        }
    }
    return 0;
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
