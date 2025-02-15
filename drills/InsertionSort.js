export class InsertionSortDrill{
    constructor(){
        // Set attributes
        this.stageWidth = 1600;
        this.stageHeight = 700;
        this.numValues = 8
        this.maxSwap = 5;   // Max number of swaps per iteration

        this.font = ["", "50px Arial", ""]
        this.description = "- Sort the list using insertion sort.\n\n" + 
        "- Click on two elements to swap them around.\n\n" +
        "- Click on New List to get a new list.\n\n"

        this.cellWidth = 120;   // Size of each rectangle
        this.cellHeight = 120;

        this.count = 1;     // Tracks the number of iterations
        this.stepCount = 0;     // Tracks number of swaps in current iteration

        this.hintCount = 3; 
        this.errorCount = 0;

        this.hinting = false;   // Tracks if there is currently a hint

        // Initialise the stage on the canvas
        this.stage = new createjs.Stage("canvas");
        this.stage.enableMouseOver();
        this.stage.width = this.stageWidth;
        this.stage.height = this.stageHeight;

        // Generate a random list with custom algorithm, 
        // and record each step of insertion sort
        var list = randomList(this.numValues);
        this.steps = this.insertionSortAlg(this.randomiseList(list));

        this.select = [];   // Array for the selected values
        this.nodes = [];    // Array for each node in the list
        this.hints = [];    // Array for stroing the hints
        
        // Start drill
        this.drawInitial();
        this.stage.update();
    }

    // Randomise a list in a way that limits the number of swaps as required
    randomiseList(list){
        // Sort the list first
        list.sort(function(a, b){return a - b});

        var newList = [];   // Make new list
        var n = 0;      // Tracks number of iterations with 0 swaps vs ones with more than 0

        newList[0] = list[0];   // Add the first value to new list

        for (let i = 1; i < this.numValues; i++){
            let location;
            
            if (n < -2){    // If there is too many iterations with multiple swaps
                // Add value to end of list
                location = 0
            } else if (n > 2){  // If there is too many iterations with 0 swaps
                location = Math.floor(Math.random() * this.maxSwap) + 1
            } else {    // If number of swaps is balanced
                location = Math.floor(Math.random() * (this.maxSwap + 1))
            }

            // Adjust n depending on location
            if (location == 0){
                n = n + 2;
            } else {
                n--;
            }

            // Check where to add the next value
            if (location >= newList.length){
                // Add value to start of list
                newList = newList.toSpliced(0, 0, list[i]);
            } else {
                // Add value to where the location specifies
                newList = newList.toSpliced(newList.length - location, 0, list[i]);
            }
        }

        // Make sure there is one swap in the first iteration
        if (newList[0] < newList[1]){
            const temp = newList[0];
            newList[0] = newList[1];
            newList[1] = temp;
        }

        return newList;
    }

    // Sorts the list using insertion sort and add each iteration to the steps
    insertionSortAlg(list){
        // Create empty list for storing the steps
        var steps = []
        steps.push([list.slice()]);     // Add copy of unsorted list to steps
        
        // Insertion sort
        for (let i = 1; i < this.numValues; i++){
            let count = 1;
            let arr = []
            while (count <= i){
                if (list[i-count+1] < list[i-count]){
                    let temp = list[i-count+1];
                    list[i-count+1] = list[i-count];
                    list[i-count] = temp;
                    count++;
                    arr.push(list.slice()); // Add swap to iteration
                } else {
                    break;
                }
            }
            steps.push(arr);    // Add iteration to step
        }
        return steps;
    }

    // Draw initial state of the drill
    drawInitial(){
        for (let i = 0; i < this.numValues; i++){
            // Draw each value of the list as a rect
            const node = new Rect(
                i * this.cellWidth 
                    + (this.stageWidth - this.numValues * this.cellWidth)/2,
                this.stageHeight/2 - this.cellHeight/2 - 100,
                this.cellWidth,
                this.cellHeight,
                this.stage,
                "" + this.steps[0][0][i],
                (i == 0)? PARTIAL_COLOUR: DEFAULT_COLOUR
            );
            const shape = node.shapeNode;
           
            // Add listener to listener to clicks on the rect 
            shape.on("click", (evt) => this.click(evt));
            
            // Store the rect
            this.nodes.push(node);
        }

        // Draw the texts
        this.promptText = new createjs.Text("", "bold 50px Arial", "").set({
            text: "",
            textAlign: "center",
            x: this.stageWidth/2,
            y: 370,
            lineWidth: 900
        });
        this.stage.addChild(this.promptText);
        
        this.iterationText = new createjs.Text("", "50px Arial", "").set({
            text: "Iteration 1",
            x: this.nodes[0].x - 100,
            y: 90,
            lineWidth: 400
        });
        this.stage.addChild(this.iterationText);

        this.stage.addChild(new createjs.Text("", "20px Arial", "").set({
            text: "Smallest\nElement",
            textAlign:"center",
            x: this.nodes[0].x  + this.cellWidth/2,
            y: this.nodes[0].y + this.cellHeight + 5
        }))

        this.stage.addChild(new createjs.Text("", "20px Arial", "").set({
            text: "Largest\nElement",
            textAlign:"center",
            x: this.nodes[this.numValues-1].x + this.cellWidth/2,
            y: this.nodes[this.numValues-1].y + this.cellHeight + 5
        }))

        // Draw the button for generating a new list
        this.resetButton = new Button(
            (this.stageWidth - 200)/2, 500, 200, 100, this.stage, "New List"
        );
        this.resetButton.shapeNode.addEventListener("click", () =>{
            this.reset();
        });

        // Add instruction icon to the stage
        new InstructionIcon(this.stage);

        this.stage.update();
    }

    // Handle the interaction when rect is clicked
    click(event){
        // If the target is not already selected
        if (!event.target.selected){
            // Select the target
            event.target.selected = true;
            setRectColour(event.target, HIGHLIGHT_COLOUR);
            
            // If there is another selected value
            if (this.select.length == 1){
                // Swap the two rects around
                swapRect(event.target, this.select[0]);

                // Swap back if the move is not correct
                if (!this.check()) swapRect(this.select[0], event.target);
                
                this.select.pop();

                // Update hint if needed
                if (this.hinting){
                    this.stage.removeChild(this.hints.pop());
                    this.giveHint();
                }
            }
            else {  // Add the value to selected list if its the only selected value
                this.select.push(event.target);
            }
        } else {    // Deselect the target if it is already selected
            event.target.selected = false;
            setRectColour(event.target, event.target.baseColour);
            this.select.pop();
        }
        this.stage.update();
    }

    // Check if the current state of the list is valid
    check(){
        // Incase if check is called after the list is sorted
        if (this.count == this.numValues){
            return;
        }

        // Compare the current list to the steps to see if its correct
        var correct = true;
        for (let i = 0; i < this.numValues; i++){
            if (this.nodes[i].textNode.text != this.steps[this.count][this.stepCount][i] + ""){
                correct = false;
                break;
            }
        }

        // Proceed to next swap if correct
        if (correct){
            // Check if current iteration is done
            if (++this.stepCount >= this.steps[this.count].length){
                // Reset hints
                this.stepCount = 0;
                this.errorCount = 0;
                this.toggleHint(false);
                
                // Increase iteration count and skip over iterations with no swaps
                do{
                    this.count++;
                }
                while ((this.count < this.steps.length) && 
                (this.steps[this.count].length == 0));  
                
                // Update iteration text
                this.iterationText.text = "Iteration "  + this.count;
                for (let i = 0; i < this.count; i++){
                    this.nodes[i].shapeNode.baseColour = PARTIAL_COLOUR;
                    setRectColour(this.nodes[i].shapeNode, PARTIAL_COLOUR);
                }
            }

            // Update the prompt
            this.promptText.color = CORRECT_COLOUR;
            if (this.count >= this.numValues){  // If the list is sorted
                this.nodes.forEach((e) => {
                    setRectColour(e.shapeNode, CORRECT_COLOUR);
                    e.shapeNode.removeAllEventListeners();
                })
                this.promptText.text = "The list is now sorted.";
            } else {
                this.promptText.text = "Correct";
            }

            return true
        } else {    // Update text and error count if incorrect
            this.promptText.text = "Try Again";
            this.promptText.color = HIGHLIGHT_COLOUR;
            if (++this.errorCount == 3){
                this.toggleHint(true);
            }

            return false
        }
    }

    // Toggle hint button on/off
    toggleHint(on){
        if (on){    // Show hint button
            this.hints.push(new Button(
                this.stageWidth-250, 100, 200, 100, this.stage, "hint"
            ));

            // Add event listener to give hint when hint button is clicked
            this.hints[0].shapeNode.addEventListener("click", () =>{
                this.giveHint();
                this.hinting = true;
            });
        } else {    // Remove hint button and all existing hints
            this.hinting = false;
            this.hints.forEach((e) =>{
                // Clear button instances as Button is not defined with createjs
                if (e instanceof Button){
                    e.clear();
                }
                this.stage.removeChild(e);  // Remove instance from stage
            })
            this.hints = []
        }
    }

    // Give hint on what the next step should be
    giveHint(){
        // Get distance between current iteration and previous iteration
        var dist = 1;
        while (this.steps[this.count-dist].length == 0){
            dist++;
        }

        // Find where the value should go
        var targetIndex = -1;
        for (let i = 0; i <= this.count; i++){
            if (this.steps[this.count-dist][0][this.count] 
                == this.steps[this.count][this.steps[this.count].length - 1][i]){
                targetIndex = i;
                break;
            }
        }

        // Find where the value is currently
        var sourceIndex = 0;
        for (let i = 0; i < this.nodes.length; i++){
            if (this.steps[this.count-dist][0][this.count] == this.nodes[i].textNode.text){
                sourceIndex = i;
                break;
            }
        }

        // Incase the value is already at the right place (should never happen)
        if (targetIndex == sourceIndex) return;

        // Add arc pointing from where it currently is to where it should go
        this.addArc(sourceIndex, targetIndex);
        this.stage.update();
    }

    // Get arc from source to target and add to hint array
    addArc(sourceIndex, targetIndex){
        // Get arc
        this.hints.push(
            drawArc(
                {
                    x:this.nodes[sourceIndex].x + this.cellWidth*2/10,
                    y:this.nodes[sourceIndex].y - 5
                },
                {
                    x:this.nodes[targetIndex].x + this.cellWidth*2/10,
                    y:this.nodes[targetIndex].y - 10
                },
                15 * Math.abs(this.sourceIndex - targetIndex),
                "",
                true
            )
        )
        // Add to hint array
        this.stage.addChild(this.hints[1]);
    }

    // Reset the stage and all initial values
    reset(){
        this.stage.removeAllChildren();
        var list = randomList(this.numValues);
        this.steps = this.insertionSortAlg(this.randomiseList(list));

        this.select = [];
        this.nodes = [];
        this.count = 1;
        
        this.drawInitial();
        this.stage.update();
    }

    
}