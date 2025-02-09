export class BFS{
    constructor(){
        this.stageWidth = 1600;
        this.stageHeight = 1000;
        this.circleSize = 50;
        this.numNodes = 8;
        this.errorCount = 0;
        this.hintCount = 3;
        this.description =
            "- Traverse through the whole graph using BFS.\n\n" + 
            "- Click on the correct node to update its colour.\n\n" + 
            "- Click on Redraw if the graph is confusing.";

        this.stage = new createjs.Stage("canvas");
        this.stage.width = this.stageWidth;
        this.stage.height = this.stageHeight;
        this.stage.enableMouseOver();

        this.count = 0;
        this.nodes = [];
        this.links = [];
        this.queue = [];
        this.heights = [];
        
        this.lines = [];
        this.arcOptions = undefined;
        
        this.drawInitial();
    }
    
    draw(){
        this.nodes.forEach((e) => {
            e.set(this.stageWidth/2 + Math.random(), 300 + Math.random())
        })
        
        // Create the force simulation
        this.simulation = d3.forceSimulation(this.nodes)
        .force('link', d3.forceLink(this.links).strength(0.5).distance(500).iterations(2))
        .force('charge', d3.forceManyBody().strength(-1000))
        .force('center', d3.forceCenter(this.stageWidth/2, this.stageHeight/2 + 90).strength(0.2))
        .force("collide", d3.forceCollide((d) => d.radius*2))
        .force("boundary", forceBoundary(100, 340, this.stageWidth - 100, this.stageHeight - 60))
        .stop();
        this.simulation.parent = this;

        this.simulation.tick(Math.ceil(Math.log(
            this.simulation.alphaMin()) / Math.log(1 - this.simulation.alphaDecay()))
        );
        
        this.nodes.forEach((e) =>{
            e.set(e.x, e.y);
        })

        this.lines.forEach((e) => {
            e.graphics.clear();
            this.drawLine(e.link.source, e.link.target, e);
        });

        this.stage.update();
    }

    drawLine(source, target, line){
        const link = line.link;

        let angleA = Math.atan2(target.y - source.y, target.x - source.x);
        let angleB = Math.atan2(source.y - target.y, source.x - target.x);
        if (target.neighbours.includes(source)) {
            angleA = angleA - 7/180 * Math.PI;
            angleB = angleB + 7/180 * Math.PI;
        };
        
        line.graphics.setStrokeStyle(5).beginStroke(line.colour);
        if (!(link.reveal)){
            
        } else if (link.type == "forward"){
            line.graphics.setStrokeDash([30, 10]);
        } else if (link.type == "cross"){
            line.graphics.setStrokeDash([20, 30]);
        } else if (link.type == "back"){
            line.graphics.setStrokeDash([10, 20]);
        } else if (link.type == "tree"){
            line.graphics.setStrokeStyle(9)
        }
        
        line.graphics.moveTo(
            source.x + (this.circleSize + 10) * Math.cos(angleA), 
            source.y + (this.circleSize + 10) * Math.sin(angleA)
        )
        line.graphics.lineTo(
            target.x + (this.circleSize + 20) * Math.cos(angleB), 
            target.y + (this.circleSize + 20) * Math.sin(angleB)
        )    

        line.graphics.setStrokeDash();
        line.graphics.beginFill(line.colour);
        line.graphics.drawPolyStar(
            target.x + (this.circleSize + 20) * Math.cos(angleB), 
            target.y + (this.circleSize + 20) * Math.sin(angleB), 
            8, 3, 0, angleB*180/Math.PI + 180
        );
        line.graphics.endFill();
    }

    drawInitial(){
        for (let i = 0; i < this.numNodes; i++){
            this.nodes.push(
                new Circle(this.stageWidth/2 + Math.random(),
                           600 + Math.random(), 
                           this.circleSize, this.stage, i)
            );
            
            this.nodes[i].neighbours = [];
            this.nodes[i].ancestors = [];
            this.nodes[i].state = "white";
            this.heights.push(
                new Rect(
                    i*60 + this.stageWidth/2 - this.numNodes * 60/2,
                    130,
                    60,
                    60,
                    this.stage
                )
            );

            this.heights[i].shapeNode.removeAllEventListeners();
            const text = new createjs.Text("", "30px Arial", "").set({
                text: i,
                textAlign: "center",
                x: i*60 + this.stageWidth/2 - this.numNodes * 60/2 + 30,
                y: 200,
            });
            this.stage.addChild(text);
        }

        this.stage.addChild(new createjs.Text("", "bold 50px Arial", "").set({
            text: "Height:",
            textAlign: "center",
            x: this.stageWidth/2 - this.numNodes * 60/2 - 90,
            y: 140,
            lineWidth: 900
        }));

        for (let i = 0; i < this.numNodes; i++){
            for (let j = 0; j < this.numNodes; j++){
                if ((i != j) && (Math.random() < (2/this.numNodes))){
                    this.links.push(
                        { source:this.nodes[i], target:this.nodes[j] }
                    );
                    this.nodes[i].neighbours.push(this.nodes[j]);
                    const line = new createjs.Shape();
                    line.link = this.links[this.links.length - 1];
                    line.colour = "black";
                    this.lines.push(line);
                    this.stage.addChildAt(line, 0);
                }
            }
        }

        this.nodes.forEach((e) => e.shapeNode.addEventListener("click", (evt) => this.click(evt)));
        this.nodes.forEach((e) => e.shapeNode.addEventListener("touchend", (evt) => this.click(evt)));

        this.redrawButton = this.insertButton = new Button(
            (this.stageWidth - 200)/2 - 150, 20, 200, 100, this.stage, "Redraw"
        ); 
        this.redrawButton.shapeNode.addEventListener("click", () => this.draw());

        this.redrawButton = this.insertButton = new Button(
            (this.stageWidth - 220)/2 + 150, 20, 220, 100, this.stage, "New Graph"
        ); 
        this.redrawButton.shapeNode.addEventListener("click", () => this.reset());

        this.promptText = new createjs.Text("", "bold 50px Arial", "").set({
            text: "",
            textAlign: "center",
            x: this.stageWidth/2,
            y: 240,
        });
        this.stage.addChild(this.promptText);
        
        this.draw();
        
        for (let i = 0; i < this.numNodes; i++){
            const node = this.nodes[i]
            node.changeColour("white");
            node.shapeNode.addEventListener("mouseout", () => node.drawBoarder("black"));
            node.drawBoarder("black");
        }
        
        this.currentNode = this.nodes[0];

        new InstructionIcon(this.stage);
        this.stage.update();
    }

    click(event){
        const target = event.target.object;
        
        if (target != this.currentNode){
            this.incorrect();
            return;
        }
        
        if (target.state == "white"){
            target.state = "gray";
            target.textNode.color = "white";
            target.changeColour("darkgray");
            target.drawBoarder("black");
            for (let i = 0; i < target.neighbours.length; i++){
                if ((target.neighbours[i].state == "white") &&
                    !(this.queue.includes(target.neighbours[i]))){
                    this.queue.push(target.neighbours[i]);
                    target.neighbours[i].parent = target;
                    target.neighbours[i].ancestors = target.ancestors.slice();
                    target.neighbours[i].ancestors.push(target);
                }
            }
            
            this.queue.push(target);

            target.height = (target.parent)? target.parent.height + 1:0;
            this.heights[Number(target.textNode.text)].textNode.text = target.height;

            for (let i = 0; i < this.links.length; i++){
                const link = this.links[i];
                if (link.source == target) {
                    if (link.target.state == "white") {
                        if (this.queue.includes(link.target)) link.type = "cross";
                    } else if (target.ancestors.includes(link.target)){
                        link.type = "back";
                    } else {
                        link.type = "cross";
                    };

                } else if ((link.source == target.parent) && (link.target == target)){
                    const line = this.lines[i]
                    link.reveal = true;
                    link.type = "tree";
                    line.graphics.clear();
                    this.drawLine(link.source, link.target, line);
                }
            }
        } else if (target.state == "gray"){
            target.state = "black";
            target.textNode.color = "white";
            target.changeColour("black");
            target.drawBoarder("black");
            target.shapeNode.removeAllEventListeners();
        }
        

        do{
            this.currentNode = this.queue.shift();
        } while ((this.currentNode) && (this.currentNode.state == "black"));

        if (!(this.currentNode)){
            this.count = 0;
            for (let i = 0; i < this.nodes.length; i++){
                if (this.nodes[i].state == "white"){
                    this.currentNode = this.nodes[i];
                    break;
                }
            }
        }

        if (!(this.currentNode)){
            this.complete();
        } else {
            this.correct();
        }

        this.stage.update();
    }

    reset(){
        this.stage.removeAllChildren();
        this.count = 0;
        this.nodes = [];
        this.links = [];
        this.queue = [];
        this.seen = [];
        this.done = [];
        
        this.lines = [];
        this.arcOptions = undefined;
        
        this.drawInitial();
    }

    correct(){
        this.promptText.text = "Correct";
        this.promptText.color = CORRECT_COLOUR;
        this.errorCount = 0;
        this.toggleHint(false);
        this.stage.update();
    }

    incorrect(){
        this.promptText.text = "Incorrect";
        this.promptText.color = HIGHLIGHT_COLOUR;

        if (++this.errorCount == this.hintCount){
            this.toggleHint(true);
        }

        this.stage.update();
    }

    complete(){
        this.promptText.text = "Done, Click on edges to identify them.";
        this.promptText.color = CORRECT_COLOUR;
        for (let i = 0; i < this.lines.length; i++){
            if (this.links[i].type == "tree") continue;
            const line = this.lines[i];

            this.lines[i].addEventListener("click", (evt) => {
                this.lineClick(evt);
                line.colour = "red";
                this.drawLine(line.link.source, line.link.target, line);
                this.stage.update();
            });
            this.lines[i].addEventListener("mouseover", () => {
                if ((this.arcOptions) && (this.arcOptions.line == line)) return;
                line.graphics.clear();
                line.colour = "red";
                this.drawLine(line.link.source, line.link.target, line);
                this.stage.update();
            });
            this.lines[i].addEventListener("mouseout", () => {
                if ((this.arcOptions) && (this.arcOptions.line == line)) return;
                line.graphics.clear();
                line.colour = "black";
                this.drawLine(line.link.source, line.link.target, line);
                this.stage.update();
            });
        }
        this.stage.update();
    }

    lineClick(event){
        const target = event.target;
        const linkType = target.link.type;

        const linkTypeMap = {
            "forward": 0,
            "cross": 1,
            "back": 2,
        }

        const x = (event.stageX + 230 <= this.stageWidth)? event.stageX: this.stageWidth - 230;
        const y = (event.stageY + 200 <= this.stageHeight)? event.stageY: this.stageHeight - 200;

        if (this.arcOptions){
            this.arcOptions.forEach((e) => e.clear());
            const line = this.arcOptions.line;
            line.graphics.clear();
            line.colour = "black";
            this.drawLine(line.link.source, line.link.target, line);
        }

        this.arcOptions = [];
        this.arcOptions.correctValue = linkTypeMap[linkType];
        this.arcOptions.line = target;

        this.arcOptions.push(
            new Button(
                x, y, 230, 50, this.stage, "Forward Arc"
            ),
            new Button(
                x, y + 49, 230, 50, this.stage, "Cross Arc"
            ),
            new Button(
                x, y  + 98, 230, 50, this.stage, "Back Arc"
            ),
            new Button(
                x, y + 147, 230, 50, this.stage, "Cancel"
            ),
        );

        for (let i = 0; i < this.arcOptions.length; i++){
            if (this.arcOptions.correctValue == i){
                this.arcOptions[i].shapeNode.addEventListener("click", () => {
                    this.arcOptions.forEach((e) => e.clear());
                    this.arcOptions = undefined;
                    target.link.reveal = true;
                    target.graphics.clear();
                    target.colour = "black";
                    this.drawLine(target.link.source, target.link.target, target);
                    this.correct();
                    target.removeAllEventListeners();
                });
            } else if (i == this.arcOptions.length-1) {
                this.arcOptions[i].shapeNode.addEventListener("click", () => {
                    this.arcOptions.forEach((e) => e.clear());
                    this.arcOptions = undefined;
                    this.promptText.text = "";
                    target.graphics.clear();
                    target.colour = "black";
                    this.drawLine(target.link.source, target.link.target, target);
                    this.toggleHint(false);
                    this.stage.update();
                });
            } else {
                this.arcOptions[i].shapeNode.addEventListener("click", () => {
                    this.incorrect();
                });
            }
        }

        this.stage.update();
    }

    toggleHint(on){
        if (on){
            this.hintButton = new Button(
                this.stageWidth - 400, 20, 200, 100, this.stage, "Hint"
            );
            this.hintButton.shapeNode.addEventListener("click", 
                () => this.giveHint()
            );
        } else {
            this.hint = null;
            // setCircleColour(this.root.shapeNode, DEFAULT_COLOUR);
            if (this.hintButton) this.hintButton.clear();
            this.hintButton = null;
        }
    }

    giveHint(){
        if (this.arcOptions){
            this.arcOptions[this.arcOptions.correctValue].changeColour(HINT_COLOUR);
            return
        }

        this.hint = this.currentNode;
        this.hint.changeColour(HINT_COLOUR);
        this.hint.drawBoarder("black");
    }
}