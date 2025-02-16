export class DFS{
    constructor(){
        // Set attributes
        this.stageWidth = 1600;
        this.stageHeight = 1000;
        this.description =
            "- Traverse through the whole graph using DFS.\n\n" +
            "- Click on the correct node to update its colour.\n\n" + 
            "- Click on Redraw if the graph is confusing.";

        this.circleSize = 50;   // Radius of circle
        this.numNodes = 8;

        this.errorCount = 0;    // Hint variables
        this.hintCount = 3;

        // Initialise the stage
        this.stage = new createjs.Stage("canvas");
        this.stage.width = this.stageWidth;
        this.stage.height = this.stageHeight;
        this.stage.enableMouseOver();

        this.count = 0; // Iteration counter
        this.arcOptions = undefined;    // Menu for identifying arcs

        this.lineStack = [];
        this.nodes = [];
        this.links = [];
        this.stack = [];
        this.seen = [];
        this.done = [];
        this.lines = [];

        this.drawInitial();
    }
    
    draw(){
        // Set node to center of the map with a bit of random variation
        this.nodes.forEach((e) => {
            e.set(this.stageWidth/2 + Math.random(), 300 + Math.random())
        })
        
        // Create the force simulation
        this.simulation = d3.forceSimulation(this.nodes)
        // Force of edges keeping nodes at certain distance
        .force('link', d3.forceLink(this.links).strength(0.5).distance(500).iterations(2))
        // Repelsion force between nodes
        .force('charge', d3.forceManyBody().strength(-1000))
        // Force attracting nodes to the center
        .force('center', d3.forceCenter(this.stageWidth/2, this.stageHeight/2 + 90).strength(0.2))
        // Force stopping nodes from overlapping
        .force("collide", d3.forceCollide((d) => d.radius*2))
        // Force stopping nodes from moving too far
        .force("boundary", forceBoundary(100, 340, this.stageWidth - 100, this.stageHeight - 60))
        .stop();
        this.simulation.parent = this;

        // Calculate the end state of the graph
        this.simulation.tick(Math.ceil(Math.log(
            this.simulation.alphaMin()) / Math.log(1 - this.simulation.alphaDecay()))
        );

        // Move nodes to their new x and y coord
        this.nodes.forEach((e) =>{
            e.set(e.x, e.y);
        })


        // Clear the lines and redraw them
        this.lines.forEach((e) => e.graphics.clear());
        
        this.lines.forEach((e) => {
            this.drawLine(e.link.source, e.link.target, e);
        }); 

        this.stage.update();
    }
    
    // Draws an arrow from source to target given the line's link
    drawLine(source, target, line){
        // Get link 
        const link = line.link;

        // Get angles of nodes relative to eachother
        let angleA = Math.atan2(target.y - source.y, target.x - source.x);
        let angleB = Math.atan2(source.y - target.y, source.x - target.x);

        // Shift the line slightly if there is a line pointing the opposite direction
        if (target.neighbours.includes(source)) {
            angleA = angleA - 7/180 * Math.PI;
            angleB = angleB + 7/180 * Math.PI;
        };
        
        // Set line style depinding on the link type and state
        line.graphics.setStrokeStyle(5).beginStroke(line.colour);
        if (!(link.reveal)){
            // Default line if line is not revealed 
        } else if (link.type == "forward"){
            line.graphics.setStrokeDash([30, 10]);  // 30 is dash length, 10 is dash gap
        } else if (link.type == "cross"){
            line.graphics.setStrokeDash([20, 30]);
        } else if (link.type == "back"){
            line.graphics.setStrokeDash([10, 20]);
        } else if (link.type == "tree"){
            line.graphics.setStrokeStyle(9); // Bold line
        }
        
        // Move line to source
        line.graphics.moveTo(
            source.x + (this.circleSize + 10) * Math.cos(angleA), 
            source.y + (this.circleSize + 10) * Math.sin(angleA)
        )

        // Draw line to target
        line.graphics.lineTo(
            target.x + (this.circleSize + 20) * Math.cos(angleB), 
            target.y + (this.circleSize + 20) * Math.sin(angleB)
        )    

        // Remove dash and draw arrow
        line.graphics.setStrokeDash();
        line.graphics.beginFill(line.colour);
        line.graphics.drawPolyStar(
            target.x + (this.circleSize + 20) * Math.cos(angleB), 
            target.y + (this.circleSize + 20) * Math.sin(angleB), 
            8, 3, 0, angleB*180/Math.PI + 180
        );
        line.graphics.endFill();
    }

    // Draw initial state of the drill
    drawInitial(){
        // Add all nodes to stage
        for (let i = 0; i < this.numNodes; i++){
            // Initiate node
            this.nodes.push(
                new Circle(this.stageWidth/2 + Math.random(),
                           600 + Math.random(), 
                           this.circleSize, this.stage, i)
            );
            
            this.nodes[i].neighbours = [];
            this.nodes[i].state = "white";

            // Add seen and done rects corresponding to node
            this.seen.push(
                new Rect(
                    i*60 + this.stageWidth/2 - this.numNodes * 60 - 30,
                    130,
                    60,
                    60,
                    this.stage
                )
            );
            this.done.push(
                new Rect(
                    i*60 + this.stageWidth/2 + 180,
                    130,
                    60,
                    60,
                    this.stage
                )
            );

            // Disable the seen and done rects from being interacted with
            this.seen[i].shapeNode.removeAllEventListeners();
            this.done[i].shapeNode.removeAllEventListeners();

            // Draw index for seen and done rects
            const seenIndex = new createjs.Text("", "30px Arial", "").set({
                text: i,
                textAlign: "center",
                x: i*60 + this.stageWidth/2 - this.numNodes * 60,
                y: 200,
            });
            this.stage.addChild(seenIndex);

            const doneIndex = new createjs.Text("", "30px Arial", "").set({
                text: i,
                textAlign: "center",
                x: i*60 + this.stageWidth/2 + 210,
                y: 200,
            });
            this.stage.addChild(doneIndex);
        }

        // Add texts
        this.stage.addChild(new createjs.Text("", "bold 50px Arial", "").set({
            text: "Seen:",
            textAlign: "center",
            x: this.stageWidth/2 - this.numNodes * 60 - 100,
            y: 140,
            lineWidth: 900
        }));

        this.stage.addChild(new createjs.Text("", "bold 50px Arial", "").set({
            text: "Done:",
            textAlign: "center",
            x: this.stageWidth/2 + 100,
            y: 140,
            lineWidth: 900
        }));

        // Randomly add edges between nodes
        for (let i = 0; i < this.numNodes; i++){
            for (let j = 0; j < this.numNodes; j++){
                // Probability that edge exist between node i and node j is 2/ number of nodes
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

        // Add interaction of nodes
        this.nodes.forEach((e) => e.shapeNode.addEventListener("click", (evt) => this.click(evt)));

        // Add buttons 
        this.redrawButton = new Button(
            (this.stageWidth - 200)/2 - 150, 20, 200, 100, this.stage, "Redraw"
        ); 
        this.redrawButton.shapeNode.addEventListener("click", () => this.draw());

        this.newGraphButton = new Button(
            (this.stageWidth - 220)/2 + 150, 20, 220, 100, this.stage, "New Graph"
        ); 
        this.newGraphButton.shapeNode.addEventListener("click", () => this.reset());

        // Add prompt texts
        this.promptText = new createjs.Text("", "bold 50px Arial", "").set({
            text: "",
            textAlign: "center",
            x: this.stageWidth/2,
            y: 240,
        });
        this.stage.addChild(this.promptText);
        
        this.draw();
        
        // Set initial colour of each node and the stack
        for (let i = this.numNodes - 1; i >= 0; i--){
            const node = this.nodes[i]
            this.stack.push(node);  // Initiate stack for dfs
            node.changeColour("white"); // Update colour node to white
            // Add boarder of node back after hover off
            node.shapeNode.addEventListener("mouseout", () => node.drawBoarder("black"));
            node.drawBoarder("black");  // Draw boarder around white nodes
        }
        
        // Set current node to first node
        this.currentNode = this.stack.pop();

        // Add instruction
        new InstructionIcon(this.stage);
        this.stage.update();
    }

    // Handle the interaction when circle is clicked
    click(event){
        // Get the circle that was clicked 
        const target = event.target.object;
        
        // Check if the correct node is clicked 
        if (target != this.currentNode){
            this.incorrect();
            return;
        }
        
        // Update node depening on its colour
        if (target.state == "white"){
            // Update node colour
            target.state = "gray";
            target.textNode.color = "white";
            target.changeColour("darkgray");
            target.drawBoarder("black");

            // Add node back to stack for when it should turn black
            this.stack.push(target);

            // Update seen time of node
            this.seen[Number(target.textNode.text)].textNode.text = this.count++;

            // Reveal the tree arc
            if (this.lineStack){
                const prev = this.lineStack[this.lineStack.length - 1]
                for (let i = 0; i < this.links.length; i++){
                    if ((this.links[i].source == prev) && 
                        (this.links[i].target == target)){
                            const line = this.lines[i]
                            const link = line.link
                            link.reveal = true;
                            link.type = "tree";
                            line.graphics.clear();
                            this.drawLine(link.source, link.target, line);
                            break;
                    }
                }
            }
            this.lineStack.push(target);
        } else if (target.state == "gray"){
            // Update node colour
            target.state = "black";
            target.textNode.color = "white";
            target.changeColour("black");
            target.drawBoarder("black");

            // Update done time of node and disable node as it is done
            this.done[Number(target.textNode.text)].textNode.text = this.count++;
            target.shapeNode.removeAllEventListeners();
            this.lineStack.pop();
        }
        
        // Add connected white nodes to stack in reverse order 
        for (let i = target.neighbours.length - 1; i >= 0; i--){
            if (target.neighbours[i].state == "white"){
                this.stack.push(target.neighbours[i]);
            }
        }

        // Find the next non-black node as current node
        do{
            this.currentNode = this.stack.pop();
        } while ((this.currentNode) && (this.currentNode.state == "black"));

        // Check if dfs is done
        if (!(this.currentNode)){
            this.complete();
        } else {
            this.correct();
        }

        this.stage.update();
    }

    // Reset the stage and all initial values
    reset(){
        this.stage.removeAllChildren();
        this.count = 0;
        this.nodes = [];
        this.links = [];
        this.stack = [];
        this.seen = [];
        this.done = [];
        this.lineStack = [];
        
        this.lines = [];
        this.arcOptions = undefined;
        
        this.drawInitial();
    }

    // Handles hints and prompt when user made a correct move
    correct(){
        // Update prompt
        this.promptText.text = "Correct";
        this.promptText.color = CORRECT_COLOUR;

        // Clear hint
        this.errorCount = 0;
        this.toggleHint(false);
        this.stage.update();
    }

    // Handles hints and prompt when user made an incorrect move
    incorrect(){
        // Update prompt
        this.promptText.text = "Incorrect";
        this.promptText.color = HIGHLIGHT_COLOUR;

        // Increment hint
        if (++this.errorCount == this.hintCount){
            this.toggleHint(true);
        }

        this.stage.update();
    }

    // The dfs treversal is done
    complete(){
        // Update prompt
        this.promptText.text = "Done, Click on edges to identify them.";
        this.promptText.color = CORRECT_COLOUR;
        this.stage.update();

        // Classify all edges
        this.identifyArcs();
    }

    // Classify all edges
    identifyArcs(){
        for (let i = 0; i < this.lines.length; i++){
            const link = this.links[i]; // The edge
            const line = this.lines[i]; // The line representing the edge

            // Skip if the link is already classified as tree arc
            if (link.type == "tree"){
                continue;
            }

            // Get the index of the source node and target node of the edge
            const sourceIndex = Number(link.source.textNode.text);
            const targetIndex = Number(link.target.textNode.text);

            // Get seen time of the source node
            const sourceSeen = Number(this.seen[sourceIndex].textNode.text);

            // Get seen time and done time of the target node
            const targetSeen = Number(this.seen[targetIndex].textNode.text);
            const targetDone = Number(this.done[targetIndex].textNode.text);

            // Classify the edges based on seen and done times
            if (targetDone < sourceSeen){
                link.type = "cross";
            } else if (sourceSeen < targetSeen){
                link.type = "forward";
            } else {
                link.type = "back"
            }
            
            // Add mouse interacion for the lines
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
    }

    // Handle the interaction when line is clicked
    lineClick(event){
        // Target is the line that got clicked
        const target = event.target;
        const linkType = target.link.type;

        // Maps link to the index of the button
        const linkTypeMap = {
            "forward": 0,
            "cross": 1,
            "back": 2,
        }

        // Get x and y location of the buttons based on where the user clicked
        // Make sure all of the buttons are still inside the canvas
        const x = (event.stageX + 230 <= this.stageWidth)? event.stageX: this.stageWidth - 230;
        const y = (event.stageY + 200 <= this.stageHeight)? event.stageY: this.stageHeight - 200;

        // Clear the previous arc classifying buttons if they exist
        if (this.arcOptions){
            this.arcOptions.forEach((e) => e.clear());
            const line = this.arcOptions.line;
            line.graphics.clear();
            line.colour = "black";
            this.drawLine(line.link.source, line.link.target, line);
        }

        // Array for storing all the arc classifying buttons
        this.arcOptions = [];
        this.arcOptions.correctValue = linkTypeMap[linkType];   // Store the correct classification
        this.arcOptions.line = target;  // Store which are is being classified

        // Add all the arc classifying buttons
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

        // Add interaction for the buttons
        for (let i = 0; i < this.arcOptions.length; i++){
            if (this.arcOptions.correctValue == i){ // The correct classification
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
            } else if (i == this.arcOptions.length-1) { // The cancel button
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
            } else {    // The incorrect classification
                this.arcOptions[i].shapeNode.addEventListener("click", () => {
                    this.incorrect();
                });
            }
        }

        this.stage.update();
    }

    // Toggle hint button on/off
    toggleHint(on){
        if (on){    // Show hint button
            this.hintButton = new Button(
                this.stageWidth - 400, 20, 200, 100, this.stage, "Hint"
            );
            this.hintButton.shapeNode.addEventListener("click", 
                () => this.giveHint()
            );
        } else {    // Remove hint button and all existing hints
            this.hint = null;
            if (this.hintButton) this.hintButton.clear();
            this.hintButton = null;
        }
    }

    // Give hint on what the next step should be
    giveHint(){
        if (this.arcOptions){   // Give hints on arc if identifying arcs
            this.arcOptions[this.arcOptions.correctValue].changeColour(HINT_COLOUR);
            return
        }

        // Highlight current node as hint
        this.hint = this.currentNode;
        this.hint.changeColour(HINT_COLOUR);
        this.hint.drawBoarder("black");
    }
}