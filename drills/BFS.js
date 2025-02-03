export class BFS{
    constructor(){
        this.stageWidth = 1600;
        this.stageHeight = 1000;
        this.circleSize = 50;
        this.numNodes = 8;
        this.errorCount = 0;
        this.hintCount = 3;
        this.description =
            "- Treverse through the whole graph using BFS.\n\n" + 
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
        
        this.line = new createjs.Shape();
        
        this.stage.addChildAt(this.line, 0);

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
        .force('center', d3.forceCenter(this.stageWidth/2, this.stageHeight/2 + 50).strength(0.2))
        .force("collide", d3.forceCollide((d) => d.radius*2))
        .force("boundary", forceBoundary(100, 300, this.stageWidth - 100, this.stageHeight - 100))
        .stop();
        this.simulation.parent = this;

        this.simulation.tick(Math.ceil(Math.log(
            this.simulation.alphaMin()) / Math.log(1 - this.simulation.alphaDecay()))
        );


        this.line.graphics.clear();
        this.line.graphics.setStrokeStyle(4).beginStroke("black");
        
        this.nodes.forEach((e) =>{
            e.set(e.x, e.y);
        })
        
        this.links.forEach((e) => {
            this.drawLine(e.source, e.target);
        })
        
        this.stage.update();
    }

    drawLine(source, target){
        const angleA = Math.atan2(target.y - source.y, target.x - source.x);
        const angleB = Math.atan2(source.y - target.y, source.x - target.x);

        this.line.graphics.moveTo(
            source.x + (this.circleSize + 10) * Math.cos(angleA), 
            source.y + (this.circleSize + 10) * Math.sin(angleA)
        )
        this.line.graphics.lineTo(
            target.x + (this.circleSize + 20) * Math.cos(angleB), 
            target.y + (this.circleSize + 20) * Math.sin(angleB)
        )    

        this.line.graphics.beginFill("black");
        this.line.graphics.drawPolyStar(
            target.x + (this.circleSize + 20) * Math.cos(angleB), 
            target.y + (this.circleSize + 20) * Math.sin(angleB), 
            8, 3, 0, angleB*180/Math.PI + 180
        );
        this.line.graphics.endFill();
    }

    drawInitial(){
        for (let i = 0; i < this.numNodes; i++){
            this.nodes.push(
                new Circle(this.stageWidth/2 + Math.random(),
                           600 + Math.random(), 
                           this.circleSize, this.stage, i)
            );
            
            this.nodes[i].neighbours = [];
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
            (this.stageWidth - 210)/2 + 150, 20, 210, 100, this.stage, "New Graph"
        ); 
        this.redrawButton.shapeNode.addEventListener("click", () => this.reset());

        this.promptText = new createjs.Text("", "bold 50px Arial", "").set({
            text: "",
            textAlign: "center",
            x: this.stageWidth/2,
            y: 200,
            lineWidth: 400
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
                }
            }
            
            this.queue.push(target);

            target.height = (target.parent)? target.parent.height + 1:0;
            this.heights[Number(target.textNode.text)].textNode.text = target.height;
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
        this.heights = [];
        
        this.line = new createjs.Shape();
        
        this.stage.addChildAt(this.line, 0);

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
        this.promptText.text = "Done";
        this.promptText.color = CORRECT_COLOUR;
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
        this.hint = this.currentNode;
        this.hint.changeColour(HINT_COLOUR);
        this.hint.drawBoarder("black");
    }
}