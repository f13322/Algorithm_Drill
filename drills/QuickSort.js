export class QuickSortDrill{
    constructor(){
        // Set attributes
        this.stageWidth = 1600;
        this.stageHeight = 1200;
        this.numValues = 8;

        this.font = ["", "50px Arial", ""]
        this.description = "- Sort the list using quick sort step by step\n\n " +
        "- Click on two elements to swap them around.\n\n"

        this.cellWidth = 120;   // Size of each rectangle
        this.cellHeight = 120;

        this.hintCount = 3;     
        this.errorCount = 0;

        this.activeLayer = null;    // the current layer of pivot and arrays
        this.piviotChoice;

        this.nodes = [];    // Array of rects
        this.hints = [];    // Array for hints
        this.layerStack = [];   // Arrays for recursions
        this.piviotOptions = [];    // Buttons for chosing pivot

        // Initiate stage on canvas
        this.stage = new createjs.Stage("canvas");
        this.stage.enableMouseOver();
        this.stage.width = this.stageWidth;
        this.stage.height = this.stageHeight;

        // Generate the random list
        var list = randomList(this.numValues);
        this.steps = [];
        this.steps.push(list.slice());
        
        // Start drill
        this.drawInitial();
        this.stage.update();
    }
    
    // Draw initial state of the drill
    drawInitial(){
        // Draw prompt text
        this.promptText = new createjs.Text("", "bold 50px Arial", "").set({
            text: "Which value should be the piviot",
            textAlign: "center",
            x: this.stageWidth/2,
            y: 40,
            lineWidth: 900
        });
        this.stage.addChild(this.promptText);
        
        // Add button for new list
        this.resetButton = new Button(
            this.stageWidth-210, 110, 200, 100, this.stage, "New List"
        );

        this.resetButton.shapeNode.addEventListener("click", () =>{
            this.reset();
        });

        // Draw buttons for user to choose their pivot algorithm
        this.piviotOptions.push(new Button(
            (this.stageWidth - 200)/2 - 220, 140, 200, 100, this.stage, "First"
        ));

        this.piviotOptions.push(new Button(
            (this.stageWidth - 200)/2, 140, 200, 100, this.stage, "Last"
        ));

        this.piviotOptions.push(new Button(
            (this.stageWidth - 200)/2 + 220, 140, 200, 100, this.stage, "Random"
        ));

        this.piviotOptions.forEach((e) => 
            e.shapeNode.addEventListener(
                "click", () => {
                    this.choosePiviot(e.textNode.text)
                    this.stage.update();
                }
            )
        );
        
        // Add instruction to stage
        new InstructionIcon(this.stage);
        
        this.stage.update();
    }

    // Set how the pivot should be chosen for this list
    choosePiviot(option){
        // Reset prompt
        this.promptText.text = ""
        this.piviotChoice = option;

        // Remove the piviot chosing 
        this.piviotOptions.forEach((e) => e.clear());

        this.piviotOptions = [];
        
        // Draw the list as rects with values
        for (let i = 0; i < this.numValues; i++){
            const node = new Rect(
                i * this.cellWidth 
                + (this.stageWidth - this.numValues * this.cellWidth)/2,
                100,
                this.cellWidth,
                this.cellHeight,
                this.stage,
                "" + this.steps[0][i],
                DEFAULT_COLOUR
            );
            
            this.nodes.push(node);
        }

        // Add click function to rect
        this.nodes.forEach((e) => {
            e.shapeNode.on("click", (evt) => this.click(evt));
            setTimeout(function(){  // Cancel hover incase hover carried from the pivot options
                e.shapeNode.dispatchEvent("mouseout")
            }, 100);
        });
        
        // Add new layer to operate on
        this.activeLayer = new Layer(
            this.stageWidth/2 - this.cellWidth/2, 110 + this.cellHeight, 
            this.stage, this.nodes, this
        );
    }

    // Handle the interaction when rect from the parent list is clicked
    click(event){
        // If the target is not already selected
        if (!event.target.selected){
            // Select the target
            event.target.selected = true;
            setRectColour(event.target, HIGHLIGHT_COLOUR);

            if (this.activeLayer.select){
                // If the current layer has a selected value add target to the layer
                this.activeLayer.add(event.target.object);
            }
            else if (this.activeLayer.parent.select) {
                // If the origin list has a selected value, deselect both
                const selectedNode = this.activeLayer.parent.select.shapeNode;
                selectedNode.selected = false;
                event.target.selected = false;
                this.activeLayer.parent.select = null;
                setRectColour(selectedNode, selectedNode.baseColour);
                setRectColour(event.target, event.target.baseColour);

                // Update prompt
                this.incorrect();
            } else {
                // Set target as selected value
                this.activeLayer.parent.select = event.target.object;
            }
        } else {    
            // Deselect target
            event.target.selected = false;
            this.activeLayer.parent.select = null;
            setRectColour(event.target, event.target.baseColour);
        }
        this.stage.update();
    }

    // Handles hints and prompt when user made a correct move
    correct(){
        // Update prompt
        this.promptText.color = CORRECT_COLOUR;
        if (this.layerStack == "done"){
            this.promptText.text = "The list is now sorted.";
            return
        }
        this.promptText.text = "Correct";

        // Clear hint
        this.errorCount = 0;
        this.toggleHint(false);

        
    }

    // Handles hints and prompt when user made an incorrect move
    incorrect(){
        // Update prompt
        this.promptText.text = "Try Again";
        this.promptText.color = HIGHLIGHT_COLOUR;
        
        // Increment hint
        if (++this.errorCount == 3){
            this.toggleHint(true);
        }
    }

    // Toggle hint button on/off
    toggleHint(on){
        if (on){    // Show hint button
            this.hints.push(new Button(this.stageWidth-210, 220, 200, 100, this.stage, "hint"));
            this.hints[0].shapeNode.addEventListener("click", () =>{
                this.activeLayer.giveHint();
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

    // Add new layer
    nextLayer(){
        // Get the attributes of the next layer
        const values = this.layerStack.pop();
        if (!values){   // List is sorted if there is no new attributes
            this.layerStack = "done";
            return;
        }

        // Use attributes to create new layer
        this.activeLayer = new Layer(
            ...values
        );

        // Activate parent of new layer to sort
        this.activeLayer.parent.forEach((e) => {
            e.activate();
            e.shapeNode.addEventListener("click", (evt) => this.click(evt));
        });
    }

    // Reset the stage and all initial values
    reset(){
        this.drawInitial();
        this.stage.update();
        
        this.stage.removeAllChildren();
        this.errorCount = 0;
        this.activeLayer = null;
        this.piviotChoice;
        
        this.nodes = [];
        this.hints = [];
        this.layerStack = [];
        this.piviotOptions = [];

        var list = randomList(this.numValues);
        this.steps = [];
        this.steps.push(list.slice());     
        
        this.drawInitial();
        this.stage.update();
    }
}

// Class for handling the pivot, and its left and right lists
class Layer{
    constructor(x, y, stage, parent, main){
        // Set attribuets
        this.cellWidth = 120;   // Size of rect
        this.cellHeight = 120;
        this.gapSize = 10;  // Space between each section
        this.stage = stage;
        this.parent = parent;   // List of nodes to get values from
        this.child;
        this.main = main;   // Main is the drill
        this.count = 0;
        this.x = x;
        this.y = y;
        this.parent.count = -1; // The index of leftmost value remaining in parent
        this.parent.child = this;
        
        // Get the index of the pivot
        this.piviotLocation;
        if (main.piviotChoice == "Random"){ // Random pivot location
            this.piviotLocation = Math.floor(Math.random() * parent.length);
        } else if (main.piviotChoice == "Last"){    // Last value as pivot
            this.piviotLocation = parent.length - 1;
        } else {    // First value as pivot
            this.piviotLocation = 0;
            this.parent.count++;
        }
        parent[this.piviotLocation].changeColour(HINT_COLOUR);  // Highlight pivot

        // Create rect as pivot
        this.piviot = new Rect(
            x, y ,this.cellWidth, this.cellHeight, stage,
        );
        this.piviot.shapeNode.addEventListener(
            "click", (evt) => this.click(evt)
        );

        // Array for left and right of pivot
        this.left = [];
        this.right = [];

    }

    // Handle the interaction when rect from the layer is clicked
    click(event){
        // If target is not selected
        if (!event.target.selected){
            // Select target
            event.target.selected = true;
            setRectColour(event.target, HIGHLIGHT_COLOUR);
            
            // Get selected value from parent
            const source = this.parent;
            if (source.select){ // If parent has selected value then add to this layer
                this.select = event.target.object;
                this.add(source.select);
            }
            else if (this.select) {
                // If this layer has a selected value, deselect both
                const selectedNode = this.select.shapeNode;
                selectedNode.selected = false;
                event.target.selected = false;
                this.select = null;
                setRectColour(selectedNode, selectedNode.baseColour);
                setRectColour(event.target, event.target.baseColour);

                // Update prompt
                this.main.incorrect();
            } else {    // Select target
                this.select = event.target.object;
            }
        } else {    // Deselect target if it is selected
            event.target.selected = false;
            this.select = null;
            setRectColour(event.target, event.target.baseColour);
        }
        this.stage.update();
    }

    // Add the value to this layer
    add(source){
        // Check if the value is added to the right place
        let correct = false;
        if ((this.piviot.textNode.text == "") && (this.check(source))){
            // The pivot is added
            this.piviot.shapeNode.removeAllEventListeners();
            correct = true;

            // Update the affected rects
            source.changeColour(DEFAULT_COLOUR);
            swapRect(this.select.shapeNode, source.shapeNode);

            // Add empty rect to click on for left and right
            this.left.push(
                new Rect(
                    this.x - (this.cellWidth + this.gapSize), this.y,
                    this.cellWidth, this.cellHeight, 
                    this.stage, "", DEFAULT_COLOUR
                )
            );
            this.left.x = this.x - (this.cellWidth + this.gapSize);
            this.left.y = this.y;
            
            this.right.push(
                new Rect(
                    this.x + (this.cellWidth + this.gapSize), this.y,
                    this.cellWidth, this.cellHeight, 
                    this.stage, "", DEFAULT_COLOUR
                )
            )
            this.right.x = this.x + (this.cellWidth + this.gapSize);
            this.right.y = this.y;

            // Check if layer is done
            if (++this.count == this.parent.length){
                this.done();
                return 0;
            }
            
            // Add listener to left empty node of left and right
            this.left[0].shapeNode.addEventListener("click", (evt) => this.click(evt));
            this.right[0].shapeNode.addEventListener("click", (evt) => this.click(evt));
        } else if (this.parent.indexOf(source) != this.parent.count){
            // Case where the user try to add values out of order
            correct = false;
        } else if (Number(this.piviot.textNode.text) < Number(source.textNode.text)) {
            // Case where the user try to add a value larger than the pivot
            if (this.select == this.right[this.right.length - 1]){
                // Add to the right list if its correct
                this.addToSide(source, "right");
                correct = true;
            }
        } else {
            // Case where the user try to add a value smaller than the pivot
            if (this.select == this.left[this.left.length - 1]){
                // Add to the left list if its correct
                this.addToSide(source, "left");
                correct = true;
            }
        }

        // Reset the selected node of this layer
        this.select.shapeNode.selected = false;
        setRectColour(this.select.shapeNode, this.select.shapeNode.baseColour);
        this.select = null;

        // Reset parent's selected node
        source.shapeNode.selected = false;
        this.parent.select = null;

        // Update the parent based on correct or not
        if (correct){
            if (++this.parent.count == this.piviotLocation) this.parent.count++;
            setRectColour(source.shapeNode, BUTTON_COLOUR);
            source.shapeNode.removeAllEventListeners();
            this.main.correct();
        } else {
            setRectColour(source.shapeNode, source.shapeNode.baseColour);
            this.main.incorrect();
        }

        this.stage.update();
    }
    
    addToSide(source, direction){
        // Update the related nodes
        source.changeColour(DEFAULT_COLOUR);
        swapRect(this.select.shapeNode, source.shapeNode);
        this.select.shapeNode.removeAllEventListeners();

        // Value is added to the right
        if (direction == "right"){
            // Shift all rects in right list towards the right
            this.right[this.right.length-1].move(this.cellWidth*this.right.length, 0);
            
            // Add new empty rect to operate on
            this.right.push(
                new Rect(
                    this.x + (this.cellWidth + this.gapSize), this.y,
                    this.cellWidth, this.cellHeight, 
                    this.stage, "", DEFAULT_COLOUR
                )
            )
    
            const node = this.right[this.right.length-1].shapeNode;
            node.addEventListener(
                "click", (evt) => this.click(evt)
            );
            setTimeout(function(){  // Clear effect from the previous click action
                node.dispatchEvent("mouseout")
            }, 100);
            this.right.x = this.right.x + this.cellHeight/2;    // Update right x value
        } else {    // Value is added to ther left
            // Shift all rects in left list towards the left
            this.left.forEach((e) => e.move(-1 * this.cellWidth, 0));

            // Add new empty rect to operate on
            this.left.push(
                new Rect(
                    this.x - (this.cellWidth + this.gapSize), this.y,
                    this.cellWidth, this.cellHeight, 
                    this.stage, "", DEFAULT_COLOUR
                )
            )

            const node = this.left[this.left.length-1].shapeNode;
            node.addEventListener(
                "click", (evt) => this.click(evt)
            );
            setTimeout(function(){  // Clear effect from the previous click action
                node.dispatchEvent("mouseout")
            }, 100);
            this.left.x = this.left.x - this.cellHeight/2;  // Update left x value
        }

        // Recenter all rects based on where the value is added to
        const dist = this.cellWidth/2 * ((direction == "right")? -1:1);
        this.left.forEach((e) => e.move(
            dist, 0
        ));
        this.left.x = this.left.x + dist;

        this.right.forEach((e) => e.move(
            dist, 0
        ));
        this.right.x = this.right.x + dist;

        this.piviot.move(dist, 0);

        this.x = this.x + dist;

        // Call done when all values from parent is moved to this layer
        if (++this.count == this.parent.length){
            this.done();
        }
    }

    // Check if the correct pivot is chosen
    check(source){
        if (this.parent.indexOf(source) == this.piviotLocation){
            return true;
        } else {
            return false;
        }
    }

    // Every value in list is moved to the layer
    done(){
        // Remove empty node for right and left list
        this.right[this.right.length - 1].clear();
        this.right.pop();

        this.left[this.left.length - 1].clear();
        this.left.pop();

        // Shift every rect to the towards the center
        this.right.forEach((e) => e.move(-this.cellWidth, 0));
        this.left.forEach((e) => e.move(this.cellWidth, 0));

        // Add attributes of next layer to the stack of the main drill for later
        if (this.right.length > 1){
            this.main.layerStack.push(
                [this.right.x - this.cellWidth/2, 
                 this.right.y + this.cellHeight + this.gapSize, 
                 this.stage, this.right, this.main]
            );
        }

        if (this.left.length > 1){
            this.main.layerStack.push(
                [this.left.x + this.cellWidth/2, 
                 this.left.y + this.cellHeight + this.gapSize, 
                 this.stage, this.left, this.main]
            );
        }

        // Tell main to proceed to next layer
        this.main.nextLayer();
    }

    // Give hint on what the next step should be
    giveHint(){
        if ((this.piviot.textNode.text == "")){ // Give hint for pivot if not chosen yet
            this.piviot.changeColour(HINT_COLOUR);
            return
        } 

        // Highlight next value in parent list and where it should go
        const sourceRect = this.parent[this.parent.count]
        sourceRect.changeColour(HINT_COLOUR);
        
        // Check if next value is smaller or greater than the pivot
        if (Number(this.piviot.textNode.text) < Number(sourceRect.textNode.text)) {
            this.right[this.right.length-1].changeColour(HINT_COLOUR);

        } else {
            this.left[this.left.length-1].changeColour(HINT_COLOUR);
        }
    }
}