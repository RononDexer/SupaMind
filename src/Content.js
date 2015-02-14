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
function Content(type, information) {
    // General Informations
    this.type = type;
    this.information = information;
    
    //Methods
    this.getPackagedInformation = function(layout) {
        switch (this.type) {
            // When the content is identified as a text
            case"text":
                return "<p>"+information+"</p>";
                break;
            // When the content is identified as a picture
            case "picture":
                if(!(layout==undefined)){
                    if(layout.hasOwnProperty('width') && layout.hasOwnProperty('height')){
                        return '<img src="'+information+'" "height="'+layout.height+'" width="'+layout.width+'">';
                    }
                    else if(layout.hasOwnProperty('width')){
                        return '<img src="'+information+'" " width="'+layout.width+'">';
                    }
                    else if(layout.hasOwnProperty('height')){
                        return '<img src="'+information+'" " height="'+layout.height+'">';
                    }
                }
                else{
                    return '<img src='+information+'>';
                }
                break;
        } 
    };
}
