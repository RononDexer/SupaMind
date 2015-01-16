
//def objet Node
function Node(title, contents, children, layout, canvas) {
    this.title = title;
    this.contents = contents;
    this.children = children;
    this.layout = layout;
    this.vertexLayout = 0; // layout de l'arrete vers le parent
    //layout texte du noeud
    var textLayoutNode = canvas.display.text({
        x: 0,
        y: 0,
        origin: { x: "center", y: "center" },
        align: "center",
        font: "bold 25px sans-serif",
        text: title,
        fill: "#fff"
    });
    this.titleLayout = textLayoutNode;
    //methodes
    this.addChild = function(son, canvas) {
        this.children.push(son);
        //layout de l'arrete
        son.vertexLayout = canvas.display.line({
            start: { x: this.layout.x, y: this.layout.y },
            end: { x: son.layout.x, y: son.layout.y },
            stroke: "5px #000000",
        });
    };
}