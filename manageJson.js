function readFile() {
    var input = document.getElementById("jsonUploaded");
    if (!input) {
      alert("Um, couldn't find the fileinput element.");
    }
    else if (!input.files) {
      alert("This browser doesn't seem to support the `files` property of file inputs.");
    }
    else if (!input.files[0]) {
      alert("Please select a file before clicking 'Try it'");
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
    var title = mindmap.title;
    alert("Taille premiere branche " +mindmap.children[0].children.length);
    for (var i =0; i<mindmap.children[0].children.length; i++){
        alert(mindmap.children[0].children[i].title);
    }
    
    alert('Ouverture de ' + title + ' en cours...');


    var visualization=false;
    var edition=false;

    //Création du canevas oCanvas
    var canvas = oCanvas.create({
        canvas: "#canvas",
        background: "#FFB266",
        fps: 60
    });

    //layout root
    var layoutNode = canvas.display.rectangle({
        x: canvas.width / 2,
        y: canvas.height / 2,
        origin: { x: "center", y: "center" },
        width: 200,
        height: 40,
        fill: "#079",
        stroke: "10px #079",
        join: "round",
    });

    var root = new Node(title, [], [], layoutNode, canvas);
    
    addChildrenAndLayout(root, mindmap.children, canvas, visualization, edition);//TODO: appel en récursif pour tout tracer
    
    if(edition){//pour la racine
        root.layout.bind("mousemove", function () {
            for(var j =0; j < root.childrens.length; j++){
                var child = root.childrens[j];
                child.vertexLayout.start={ x: root.layout.x, y: root.layout.y };
            }
        });
    }
    //affichage arbre
    drawMindmap(root,canvas,edition);
    //affichage noeud racine
    root.layout.addChild(root.titleLayout);//pour afficher texte dans noeud
    canvas.addChild(root.layout);
    if(edition){    
        var dragOptions = { changeZindex: true };
        root.layout.dragAndDrop(dragOptions);
    }




    //animation dispo en mode visu
    if(visualization) {//verifier si le noeud a un texte court sinon afficher tout autre contenu differement
        var increase = true;
        node.bind("click tap", function () {
            if (increase) {
                increase = false;
                nodeText.text ="Display informations like :\n-url \n-video...";

                this.stop().animate({
                    x: canvas.width / 2,
                    y: canvas.height / 3,
                    height: 300,
                    width: 400,
                    rotation: 0
                });
            } else {
                increase = true;

                nodeText.text = title;
                this.stop().animate({
                    x: canvas.width / 2,
                    y: canvas.width / 3,
                    height: 40,
                    width: 200,
                    rotation: 360
                });
            }
        });
    }
    
}


function addChildrenAndLayout(currentNode, childrenData, canvas, visualization, edition){
    var nbSons = childrenData.length;
    var layout = currentNode.layout;
    // racine(3)/2  : Math.sqrt(3)/2
    // add
    var rayon = 200;
    var pi = Math.PI;


    for (var i =0; i < nbSons; i++){
        // Chaque point sur le cercle a pour coordonnées : Mk ( cos(k .2Pi/n) , sin(k .2Pi/n) )
        var positionX  = layout.x + rayon*Math.cos(i*2*(pi/nbSons))*1.7;
        var positionY  = layout.y + rayon*Math.sin(i*2*(pi/nbSons));


        var childTitle = childrenData[i].title;
        var childLayout = layout.clone({ width: layout.width/1.2,  height: layout.height/1.2 , x: positionX, y: positionY, fill: "#29b", stroke: "10px #29b" });
        
        var child = new Node(childTitle, [], [], childLayout, canvas);
        currentNode.addChild(child, canvas);


        //animation dispo en mode visu
        if(visualization){//pour les fils
            child.layout.bind("click tap", function () {
                if (increase) {
                    increase = false;

                    //nodeChildText.text = "Informations";
                    this.stop().animate({
                        x: node.x + tableau6X[i],
                        y: node.y + tableau6Y[i],
                        height: 300,
                        width: 400,
                        rotation: 360
                    });
                } else {
                    increase = true;

                    //nodeChildText.text = child1;

                    this.stop().animate({
                        x: node.x + tableau6X[i],
                        y: node.y + tableau6Y[i],
                        height: node.height/1.2,
                        width: node.width/1.2,
                        rotation: 0
                    });
                }
            });
        }
        
        if(edition){//pour les fils
            child.layout.bind("mousemove", function () {
                for(var j =0; j < child.childrens.length; j++){
                    var grandSon = child.childrens[j];
                    grandSon.vertexLayout.start={ x: child.layout.x, y: child.layout.y };
                }
                child.vertexLayout.end={ x: child.layout.x, y: child.layout.y };
            });
        }

        
    }
    //TODO : appel récursif a faire pour tous les fils ici
}

function drawMindmap(currentNode,canvas,edition) {
    var nbSons = currentNode.children.length;
    var dragOptions = { changeZindex: true };
    for (var i =0; i < nbSons; i++){
        var child = currentNode.children[i];
        canvas.addChild(child.vertexLayout);
        child.layout.addChild(child.titleLayout);//pour afficher texte dans noeud
        canvas.addChild(child.layout);
        if(edition){
            child.layout.dragAndDrop(dragOptions);
        }
        //appel récursif pour s'occuper des sous-fils
        //drawMindmap(child,canvas,edition);
    }
}
