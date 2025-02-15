export class SelectionSortDrill{
    constructor(){
        // Set attributes
        this.stageWidth = 1600;
        this.stageHeight = 700;
        this.numValues = 8;

        this.font = ["", "50px Arial", ""]
        this.description = "- Sort the list using insertion sort.\n\n" + 
        "- Click on two elements to swap them around.\n\n" +
        "- Click on New List to get a new list.\n\n"     

        this.cellWidth = 120;   // Size of each rectangle
        this.cellHeight = 120;
        
        this.count = 1;     // Tracks the number of iterations

        this.hintCount = 3;     // Number of incorrect attempts before hints is given
        this.errorCount = 0;    // Current number of incorrect attempts   
        
        // Initialise the stage on the canvas
        this.stage = new createjs.Stage("canvas");
        this.stage.enableMouseOver();
        this.stage.width = this.stageWidth;
        this.stage.height = this.stageHeight;
        
        // Generate a random list with custom algorithm, 
        // and record each step of selection sort
        const list = randomList(this.numValues);
        this.steps = this.selectionSortAlg(this.randomiseList(list));

        this.select = [];   // Array for the selected values
        this.nodes = [];    // Array for each node in the list
        this.hints = [];    // Array for stroing the hints
        
        // Start the drill
        this.drawInitial();
    }

    // Randomise a list in a way that ensures theres at least one swap per iteration
    randomiseList(list){
        // Sort the list first.
        list.sort(function(a, b){return a - b});

        // Initialise an array with values from 1 - 7
        var temp = [];
        for (let i = 1; i < list.length; i++){
            temp.push(i);
        }
        
        // Create new array of length 8
        var newList = new Array(list.length);
        var prev = 0;   // Set initial index to 0
        
        // Add value to the new list in a cycle
        for (let n = temp.length; n > 0; n--){
            const random = Math.floor(Math.random() * temp.length);
            newList[temp[random]] = list[prev];
            prev = temp[random];
            temp.splice(random, 1);
        }
        newList[0] = list[prev];
        
        return newList;
    }

    // Sorts the list using selection sort and add each iteration to the steps
    selectionSortAlg(list){
        // Create empty list for storing the steps
        var steps = [];
        steps.push(list.slice());   // Add copy of unsorted list to steps
    
        // Selection sort
        for (let i = this.numValues - 1; i >  0; i--){
            let max = 0;
            let maxIndex = 0;
            for (let j = 0; j <= i; j++){
                if (list[j] > max){
                    max = list[j];
                    maxIndex = j;
                }
            }
            list[maxIndex] = list[i];
            list[i] = max;

            // Add new copy of list to steps
            steps.push(list.slice());
        }
        return steps;
    }

    // Draw initial state of the drill
    drawInitial(){
        // Draw each value of the list as a rect
        for (let i = 0; i < this.numValues; i++){
            const node = new Rect(
                i * this.cellWidth 
                    + (this.stageWidth - this.numValues * this.cellWidth)/2,
                this.stageHeight/2 - this.cellHeight/2 - 100,
                this.cellWidth,
                this.cellHeight,
                this.stage,
                "" + this.steps[0][i],
                DEFAULT_COLOUR
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
            (this.stageWidth-200)/2, 500, 200, 100, this.stage, "New List"
        );
        this.resetButton.shapeNode.addEventListener("click", () =>{
            this.reset();
        });

        // Add instruction icon to the stage
        new InstructionIcon(this.stage);

        this.stage.update();
    }

    // Undo changes made to the list
    revert(){
        for (let i = 0; i < this.numValues; i++){
            this.nodes[i].textNode.text = this.steps[this.count-1][i];
        }
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
                // Swap the two rects, check against the steps, clear the selected list
                swapRect(event.target, this.select[0]);
                this.check();
                this.select.pop();
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
        if (this.count >= this.numValues){
            return;
        }
        
        // Compare the current list to the steps to see if its correct
        var correct = true;
        for (let i = 0; i < this.numValues; i++){
            if (this.nodes[i].textNode.text != this.steps[this.count][i] + ""){
                correct = false;
                break;
            }
        }

        // Proceed to next iteration if correct
        if (correct){
            // Reset hints
            this.errorCount = 0;
            this.toggleHint(false);
            
            // Deactivate the correct node to prevent furter interaction
            const correctNode = this.nodes[this.numValues - this.count];
            setRectColour(correctNode.shapeNode, CORRECT_COLOUR);
            correctNode.shapeNode.removeAllEventListeners();
            
            // Increase iteration count
            this.count++;

            // Update the prompt
            this.promptText.color = CORRECT_COLOUR;
            if (this.count == this.numValues){  // If the list is sorted
                setRectColour(this.nodes[0].shapeNode, CORRECT_COLOUR);
                this.promptText.text = "The list is now sorted.";
                this.nodes[0].shapeNode.removeAllEventListeners();
            } else {
                this.iterationText.text = "Iteration "  + this.count;
                this.promptText.text = "Correct";
            }
        } else {    // Revert if incorrect
            this.revert();
            this.promptText.text = "Try Again";     // Update the prompt
            this.promptText.color = HIGHLIGHT_COLOUR;

            // Increment errorCount and show hint if there has been enough errors
            if (++this.errorCount == this.hintCount){
                this.toggleHint(true);
            }
        }

        this.stage.update();
    }

    // Reset the stage and all initial values
    reset(){
        this.stage.removeAllChildren();
        var list = randomList(this.numValues);
        this.steps = this.selectionSortAlg(this.randomiseList(list));

        this.select = [];
        this.nodes = [];
        this.count = 1;
        
        this.drawInitial();
        this.stage.update();
    }

    // Toggle hint button on/off
    toggleHint(on){
        if (on){    // Show hint button
            this.hints.push(new Button(this.stageWidth-250, 100, 200, 100, this.stage, "hint"));

            // Add event listener to give hint when hint button is clicked
            this.hints[0].shapeNode.addEventListener("click", () =>{
                this.giveHint();
            });
        } else {    // Remove hint button and all existing hints
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
        // Find the value that should be swapped
        var maxValue = 0;
        var maxIndex = -1;
        for (let i = 0; i < this.numValues - this.count; i++){
            if (this.steps[this.count-1][i] > maxValue){
                maxValue = this.steps[this.count-1][i];
                maxIndex = i;
            }
        }

        // Draw the double arrow for the hint
        this.hints.push(
            drawArc(
                {
                    x:this.nodes[maxIndex].x + this.cellWidth * 17/20,
                    y:this.nodes[maxIndex].y - 10
                },
                {
                    x:this.nodes[this.numValues - this.count].x + this.cellWidth * 3/20,
                    y:this.nodes[this.numValues - this.count].y - 10
                },
                15 * (this.numValues - this.count - maxIndex) // Set height of arc
            )
        );
        this.hints.push(
            drawArc(
                {
                    x:this.nodes[this.numValues - this.count].x + this.cellWidth*3/20,
                    y:this.nodes[this.numValues - this.count].y - 10
                },
                {
                    x:this.nodes[maxIndex].x + this.cellWidth * 17/20,
                    y:this.nodes[maxIndex].y - 10
                },
                15 * (this.numValues - this.count - maxIndex), // Set height of arc
                "",
                true    // Set direction to anti-clockwise
            )
        );

        this.stage.addChild(this.hints[1]);
        this.stage.addChild(this.hints[2]);
        this.stage.update();
    }
}