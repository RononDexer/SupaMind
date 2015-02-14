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

/*
 * Constructor
 */
function Node(title, contents, children, layout, canvas) {

    // General Informations
    this.title = title;
    //Declaration of a variable static
    if ( typeof Node.counter == 'undefined' ) {
        Node.counter = 1;
    }
    this.ident=Node.counter;
    Node.counter+=1;
    this.contents = contents;
    this.children = children;
    layout.ident=this.ident; //necessary for binding
    this.layout = layout;
    this.vertexLayout = 0; //layout from the edge to the parent
    //layout of the node's text
    var size=0.125*layout.width;
    var text=title;
    if (title.length>12){
        text=title.substring(0,10)+".."
    }
    var textLayoutNode = canvas.display.text({
        x: 0,
        y: 0,
        origin: { x: "center", y: "center" },
        align: "center",
        font: "bold "+size+"px sans-serif",
        text: text,
        fill: "#fff"
    });
    this.titleLayout = textLayoutNode;
    
    //Methods
    this.addChild = function(son, canvas) {
        this.children.push(son);
        //Edge's layout
        var size=0.025*layout.width;
        son.vertexLayout = canvas.display.line({
            start: { x: this.layout.x, y: this.layout.y },
            end: { x: son.layout.x, y: son.layout.y },
            stroke: size+"px #000000",
        });
    };
    this.setTitle = function(title){
        this.title=title;
		this.titleLayout.text=title;
        if (title.length>12){
            this.titleLayout.text=title.substring(0,10)+".."
        }
    };
    this.addContent = function(content){
        this.contents.push(content);
    };
}
