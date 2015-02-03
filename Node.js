
//def objet Node
function Node(title, contents, children, layout, canvas) {
    this.title = title;
    this.contents = contents;
    this.children = children;
    this.layout = layout;
    this.vertexLayout = 0; // layout de l'arrete vers le parent
    //layout texte du noeud
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
    //methodes
    this.addChild = function(son, canvas) {
        this.children.push(son);
        //layout de l'arrete
        var size=0.025*layout.width;
        son.vertexLayout = canvas.display.line({
            start: { x: this.layout.x, y: this.layout.y },
            end: { x: son.layout.x, y: son.layout.y },
            stroke: size+"px #000000",
        });
    };
}
