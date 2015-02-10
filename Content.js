
//def objet Node
function Content(type, information) {
    this.type = type;
    this.information = information;
    //methodes
    this.getPackagedInformation = function(layout) {
        switch (this.type) {
            case"text":
                return "<p>"+information+"</p>";
                break;
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
