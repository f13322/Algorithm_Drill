export class heapDrill{
    constructor(){
        // Set attribuets
        this.stageWidth = 1600;
        this.stageHeight = 700;
        this.circleSize = 40;   // Radius of the circle
        this.height = 4;

        this.hintCount = 3;
        this.errorCount = 0;
        
        this.description = "- Restore the heap after inserting or deleting a " + 
        "value step by step.\n\n " +
        "- Click on two elements to swap them around.\n\n"

        this.values = this.heapify(randomList(4));  // Get random list and convert to heap
        this.count = 0;     // Tracker for current step number
        
        // Initialise the stage
        this.stage = new createjs.Stage("canvas");
        this.stage.width = this.stageWidth;
        this.stage.height = this.stageHeight;
        this.stage.enableMouseOver();

        this.insertButton = null;
        this.deleteButton = null;

        this.nodes = [];
        this.lines = [];
        this.select = [];
        this.list =  [];
        this.steps = [];
        this.hints = [];

        this.drawInitial();
        this.stage.update();
    }

    // Convert a list to heap
    heapify(list){
        for (let i = Math.floor(list.length/2)  -1; i >= 0; i--){
            this.percolateDown(list, i);
        }
        return list;
    }

    // Sink the value down to where it should be and record every step
    percolateDown(list, i){
        // Get index of left and right element
        const leftIndex = 2*i + 1;
        const rightIndex = leftIndex + 1;
        
        if ((rightIndex < list.length)
            && (list[i] < list[rightIndex]) 
        && (list[leftIndex] < list[rightIndex])){
                // Copy current state of list
                const original = list.slice();
                
                // Swap with right child
                const temp = list[i];
                list[i] = list[rightIndex];
                list[rightIndex] = temp;

                // Recursively continue to sink value
                const arr = this.percolateDown(list, rightIndex);
                arr.unshift(original);  // Unshift: add to front of array
                return arr;
        } else if ((leftIndex < list.length) && (list[i] < list[leftIndex])){
            // Copy current state of list
            const original = list.slice();

            // Swap with left child
            const temp = list[i];
            list[i] = list[leftIndex];
            list[leftIndex] = temp;

            // Recursively continue to sink value
            const arr = this.percolateDown(list, leftIndex);
            arr.unshift(original);  // Unshift: add to front of array
            return arr;
        }

        // End of recursion
        return [list.slice()];
    }

    // Float value up to where it should be and recort steps
    percolateUp(list, i){
        const arr = [list.slice()];
        var parentIndex = Math.ceil(i/2)-1;
        var currentIndex = i;
        while((currentIndex != 0) && (list[currentIndex] > list[parentIndex])){
            const temp = list[parentIndex];
            list[parentIndex] = list[currentIndex];
            list[currentIndex] = temp;
            currentIndex = parentIndex;
            parentIndex = Math.ceil(currentIndex/2) - 1
            arr.push(list.slice());
        }
        return arr;
    }

    // Draw initial state of the drill
    drawInitial(){
        // Draw the circles in a tree format
        for (let i = 0; i < this.height; i++){
            for (let j = 0; j < 1<<i; j++){
                const circle = new Circle(
                    this.circleSize * 4 * j * (1<<(this.height-1-i)) 
                    + ((1<<(this.height-1-i)) - (1<<(this.height-1))) * this.circleSize * 2
                    + this.stageWidth/2,
                    this.circleSize * 2*i + 80,
                    this.circleSize,
                    this.stage,
                    (((1<<i) + j) <= this.values.length)? 
                        "" + this.values[((1<<i) + j)-1] : ""
                )
                circle.shapeNode.removeAllEventListeners(); 
                circle.setFontSize(this.circleSize);

                this.nodes.push(circle);
            }
        }

        
        // Draw the lines connecting the trees
        for (let i = 0; i < Math.floor(this.nodes.length/2); i++){
            // Create and set style of line
            const line = new createjs.Shape();
            line.graphics.setStrokeStyle(4).beginStroke("black");

            // Get coord of the each value
            const startCoord = [this.nodes[i].x, this.nodes[i].y];
            const t1Coord = [this.nodes[i*2+1].x, this.nodes[i*2+1].y]; // Child 1
            const t2Coord = [this.nodes[i*2+2].x, this.nodes[i*2+2].y]; // Child 2

            // Draw the line
            line.graphics.moveTo(...startCoord).lineTo(...t1Coord);
            line.graphics.moveTo(...startCoord).lineTo(...t2Coord);
            line.graphics.endStroke();
            
            this.stage.addChildAt(line, 0); // Add the lines behind each circle
        }
        
        // Add the rects corresponding to the heap in array form
        const rectSize = 70;
        for (let i = 0; i < this.nodes.length; i++){
            const rect = new Rect(
                i*rectSize + this.stageWidth/2 - this.nodes.length * rectSize/2,
                400,
                rectSize,
                rectSize,
                this.stage,
                "" + this.nodes[i].textNode.text,
            )

            rect.setFontSize(35);
            rect.shapeNode.removeAllEventListeners();

            this.list.push(rect);
        }

        // Draw texts and buttons
        this.promptText = new createjs.Text("", "bold 50px Arial", "").set({
            text: "",
            textAlign: "center",
            x: this.stageWidth/2,
            y: 500,
            lineWidth: 400
        });
        this.stage.addChild(this.promptText);

        this.resetButton = new Button(
            this.stageWidth - 300, 600, 300, 100, this.stage, "New List"
        );

        this.resetButton.shapeNode.addEventListener("click", () => this.reset());

        // Add insturctions 
        new InstructionIcon(this.stage);

        // Enable the buttons
        this.toggleButtons(true);
    }

    // Handle the interaction when circle is clicked
    click(event){
        // Get index of the node
        const nodeIndex = this.nodes.indexOf(event.target.parent);
        if (!event.target.selected){
            // Swap node if there is another selected node
            if (this.select.length == 1){
                this.check(event.target);
                this.select.pop();
            }
            else {
                // Select node
                event.target.selected = true;
                setCircleColour(event.target, HIGHLIGHT_COLOUR)
                
                // Select corresponding rect
                if (nodeIndex != -1){
                    setRectColour(
                        this.list[this.nodes.indexOf(event.target.parent)].shapeNode, 
                        HIGHLIGHT_COLOUR
                    );
                }
                
                this.select.push(event.target);
            }
        } else {
            // Deselect node
            event.target.selected = false;
            setCircleColour(event.target, DEFAULT_COLOUR)
            
            // Deselect corresponding rect
            if (nodeIndex != -1){
                setRectColour(
                    this.list[this.nodes.indexOf(event.target.parent)].shapeNode, 
                    DEFAULT_COLOUR)
            }
            this.select.pop();
        }
        this.stage.update();
    }

    // Check if the current state of the list is valid
    check(target){
        // Swap the values fo the nodes and deselect them
        const temp = target.object.textNode.text;
        target.object.textNode.text = this.select[0].object.textNode.text;
        this.select[0].object.textNode.text = temp;
        const nodeIndex = this.nodes.indexOf(this.select[0].parent);
        this.select[0].selected = false;
        setCircleColour(this.select[0], this.select[0].baseColour);
        if (nodeIndex != -1){   // Update corresponding rect colour
            setRectColour(
                this.list[nodeIndex].shapeNode, 
                DEFAULT_COLOUR)
        }
        this.stage.update();


        // Check if the move is correct
        for (let i = 0; i < this.values.length; i++){
            if (this.steps[this.count][i] != this.nodes[i].textNode.text){
                // Revert changes if incorrect
                this.incorrect();
                this.select[0].object.textNode.text = target.object.textNode.text;
                target.object.textNode.text = temp;
                return
            }
        }

        // Update corresponding rect text 
        for (let i = 0; i < this.list.length; i++){
            this.list[i].textNode.text = this.nodes[i].textNode.text;
        }
        
        // Check all the steps are done
        if (++this.count >= this.steps.length){
            if (this.addNode){  // Remove the empty node for adding value
                this.addNode.clear();
                this.addNode = null;
            }
            this.toggleButtons(true);   // Add buttons back
        }
        this.correct();
    }

    // Start the drill for adding value to heap
    addValue(){
        //  Generate random value that is not already in the heap
        var value;
        do {
            value = Math.floor(Math.random() * 100) + 1;
        } while (this.values.indexOf(value) != -1);

        // Put new value in a circle for user to see
        this.addNode = new Circle(
            this.stageWidth/2,
            600,
            this.circleSize,
            this.stage,
            value
        )
        this.values.push(value);    // Add new value to heap

        // Get steps for moving new value to the right place
        this.steps = this.percolateUp(this.values, this.values.length-1);   // Get steps
        this.count = 0;

        // Add listeners for interaction
        this.addNode.shapeNode.addEventListener("click", (event) => {
            this.click(event);
        })
        

        this.nodes.forEach((e) => {
            e.shapeNode.addEventListener("click", (event) => {
                this.click(event);
            });
            e.activate();
        })

        this.stage.update();
    }

    // Start the drill for removing max value from heap
    removeValue(){
        // Delete the max value
        this.nodes[0].textNode.text = "";
        this.list[0].textNode.text = "";

        // Check if there is other values in the heap
        if (this.values.length <= 1){
            this.values = [];
            this.toggleButtons(true);
            return;
        }

        // Move last value of the heap to the beginning and sink it
        this.values[0] = this.values.pop();
        this.steps = this.percolateDown(this.values, 0);    // Get steps
        this.steps[0].push("");
        this.count = 0;

        // Add listeners for interaction
        this.nodes.forEach((e) => {
            e.shapeNode.addEventListener("click", (event) => {
                this.click(event);
            });
            e.activate();
        })

        this.stage.update();
    }

    // Handles hints and prompt when user made a correct move
    correct(){
        // Update prompt 
        this.promptText.color = CORRECT_COLOUR;
        this.promptText.text = (this.count >= this.steps.length)?"Done":"Correct";

        // Update hints
        this.errorCount = 0;
        this.toggleHint(false);     

        // Reset each node
        this.nodes.forEach((e) => e.changeColour(DEFAULT_COLOUR));
    }

    // Handles hints and prompt when user made an incorrect move
    incorrect(){
        // Update prompt
        this.promptText.text = "Try Again";
        this.promptText.color = HIGHLIGHT_COLOUR;
        
        // Update hint
        if (++this.errorCount == this.hintCount){
            this.toggleHint(true);
        }
    }

    // Show/hide the buttons for the adding and removing drills
    toggleButtons(on){
        if (on){
            // Show button for adding value if heap is not full
            if (this.values.length < this.nodes.length){
                this.insertButton = new Button(
                    this.stageWidth/2 - 400, 600, 300, 100, this.stage, "Add Value"
                );
                
                this.insertButton.shapeNode.addEventListener("click", () =>{
                    this.toggleButtons(false);
                    this.addValue();
                })
            }
            
            // Show button for removing value if heap is not empty
            if (this.values.length > 0){
                this.deleteButton = new Button(
                    this.stageWidth/2 + 100, 600, 300, 100, this.stage, "Remove Value"
                )
    
                this.deleteButton.shapeNode.addEventListener("click", () => {
                    this.toggleButtons(false);
                    this.removeValue();
                })
            }

            // Deactivate all nodes
            this.nodes.forEach((e) => {
                e.shapeNode.removeAllEventListeners();
                setCircleColour(e.shapeNode, DEFAULT_COLOUR);
            })

        } else {
            // Remove all buttons
            this.insertButton.clear();
            this.deleteButton.clear();
            this.promptText.text = "";
        }
    }


    // Toggle hint button on/off
    toggleHint(on){
        if (on){    // Show hint button
            this.hints.push(new Button(this.stageWidth-210, 100, 200, 100, this.stage, "hint"));
            this.hints[0].shapeNode.addEventListener("click", () =>{
                this.giveHint();
            });
        } else {    // Remove hint button and all existing hints
            this.hints.forEach((e) =>{
                if (e instanceof Button){
                    e.clear();
                }
                this.stage.removeChild(e);
            })
            this.hints = []
        }
    }

    // Give hint on what the next step should be
    giveHint(){
        // Highlight every node that is different from the next step
        for (let i = 0; i < this.steps[this.count].length; i++){
            if (this.steps[this.count][i] != this.nodes[i].textNode.text){
                this.nodes[i].changeColour(HINT_COLOUR);
            }
        }
        this.stage.update();
    }

    // Reset the stage and all initial values
    reset(){
        this.values = this.heapify(randomList(4));
        this.count = 0;
        this.stage.removeAllChildren();

        this.insertButton = null;
        this.deleteButton = null;

        this.nodes = [];
        this.lines = [];
        this.select = [];
        this.list =  [];
        this.steps = [];
        this.hints = [];

        this.drawInitial();
        this.stage.update();
    }
}