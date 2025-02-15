export class MergeDrill{
    constructor(){
        // Set attributes
        this.stageWidth = 1600;
        this.stageHeight = 700;
        this.numValues = 8;

        this.font = ["", "50px Arial", ""]
        this.description = "- Merge the two smaller list into one sorted " + 
        "list step by step\n\n " +
        "- Click on two elements to move them around.\n\n" +
        "- Click on New List to get a new list.\n\n"
        
        this.cellWidth = 120;   // Size of each rectangle
        this.cellHeight = 120;

        this.count = 0;     // Number of iterations

        this.hintCount = 3;     // Number of incorrect attempts before hints is given
        this.errorCount = 0;    // Current number of incorrect attempts

        // Initialise the stage on the canvas        
        this.stage = new createjs.Stage("canvas");
        this.stage.enableMouseOver();
        this.stage.width = this.stageWidth;
        this.stage.height = this.stageHeight;
        
        // Generate random list and split into two sorted list
        var list = randomList(this.numValues);
        this.steps = this.splitList(list);
        
        this.select = [];   // Array for selected values
        this.nodes = [];    // Array for displayed nodes
        this.hints = [];    // Array for hints
        
        // Start the dirll
        this.drawInitial();
        this.stage.update();
    }

    // Split a list into two smaller sorted list
    splitList(list){
        list.sort(function(a, b){return a - b});    // Sort original list

        // Stores the original list, and both of the smaller list
        var steps = [];
        steps.push(list.slice());

        // Randomly set list 1 size to value between 3 and 5 inclusive
        const listSize = Math.floor(Math.random()*3) + 3;

        var list1 = [];
        var list2 = [];
        var temp = [];

        // Initialise a temp array with values from 0 to 7
        for (let i = 0; i < list.length; i++){
            temp.push(i);
        }
        
        // Use temp array to choose a random value from the list to add to sub lists
        for (let n = temp.length; n > 0; n--){
            const random = Math.floor(Math.random() * temp.length);
            if (n <= listSize){
                list1.push(list[temp[random]])
            } else {
                list2.push(list[temp[random]])
            }
            temp.splice(random, 1);
        }

        // Sort the smaller lists  and add them to steps
        list1.sort(function(a, b){return a - b});
        list2.sort(function(a, b){return a - b});
        steps.push(list2);
        steps.push(list1);
        return steps;
    }

    // Draw initial state of the drill
    drawInitial(){
        // Draw each value of the list as a rect
        for (let j = 0; j < 3; j++){
            for (let i = 0; i < this.steps[j].length; i++){
                const node = new Rect(
                    i * this.cellWidth 
                        + (this.stageWidth - this.numValues * this.cellWidth)/2,
                    this.stageHeight/2 - 150 * j,
                    this.cellWidth,
                    this.cellHeight,
                    this.stage,
                    (j == 0)? "":"" + this.steps[j][i],
                    DEFAULT_COLOUR
                );
                const shape = node.shapeNode;
                
                // Add listener to listener to clicks on the rect 
                shape.on("click", (evt) => this.click(evt));

                // Store the nodes
                if (j == 0){
                    shape.correctValue = "" + this.steps[0][i];
                    this.nodes.push(node);
                } else {
                    this.steps[j][i] = node;
                }
            }
        }

        // Draw the texts
        this.promptText = new createjs.Text("", "bold 50px Arial", "").set({
            text: "",
            textAlign: "center",
            x: this.stageWidth/2,
            y: 500,
            lineWidth: 900
        });
        this.stage.addChild(this.promptText);

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
            this.stageWidth/2-100, 600, 200, 100, this.stage, "New List");
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
                this.check(event.target);   // Check if step is correct
                this.select.pop();
            }
            else {  // Add value to selected
                this.select.push(event.target);
            }
        } else {    // Add the value to selected list if its the only selected value
            event.target.selected = false;
            setRectColour(event.target, event.target.baseColour);
            this.select.pop();
        }
        this.stage.update();
    }

    // Check if the current state of the list is valid
    check(target){
        // Incase if check is called after the list is sorted
        if (this.count == this.numValues){
            return;
        }

        // Check if the correct value is chosen and if it is being moved to the right place
        var correct = false;
        var correctNode;
        var originNode;
        if (target == this.nodes[this.count].shapeNode &&
            target.correctValue == this.select[0].object.textNode.text){
                correct = true;
                correctNode = target;
                originNode = this.select[0];
        } else if (this.select[0] == this.nodes[this.count].shapeNode &&
            this.select[0].correctValue == target.object.textNode.text){
                correct = true;
                correctNode = this.select[0];
                originNode = target;
        }

        // Proceed to next iteration if correct
        if (correct){
            // swap the rects around 
            swapRect(target, this.select[0]);
            this.count++;   // Increment iteration
            this.errorCount = 0;    // Reset hints
            this.toggleHint(false);
            
            // Update rect colour
            setRectColour(correctNode, CORRECT_COLOUR);
            setRectColour(originNode, BUTTON_COLOUR);
            
            // Deactivate the rects
            correctNode.removeAllEventListeners();
            originNode.removeAllEventListeners();
            
            // Update prompt
            this.promptText.color = CORRECT_COLOUR;
            if (this.count == this.numValues){
                this.promptText.text = "The list is now sorted.";
            } else {
                this.promptText.text = "Correct";
            }
        } else {
            // Update prompt
            this.promptText.text = "Try Again";
            this.promptText.color = HIGHLIGHT_COLOUR;
            target.selected = false;
            setRectColour(target, target.baseColour);
            
            // Deselect and revert target 
            this.select[0].selected = false;
            setRectColour(this.select[0], this.select[0].baseColour);
            if (++this.errorCount == 3){    // Update hint counter
                this.toggleHint(true);
            }
        }

        this.stage.update();
    }

    // Toggle hint button on/off
    toggleHint(on){
        if (on){    // Show Hint button
            this.hints.push(new Button(this.stageWidth-250, 100, 200, 100, this.stage, "hint"));
            this.hints[0].shapeNode.addEventListener("click", () =>{
                this.giveHint();
            });
        } else {    // Remove all hints
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
        // Set left most empty rect as hint
        const target = this.nodes[this.count].shapeNode;
        target.baseColour = HINT_COLOUR;
        setRectColour(target, target.baseColour);

        // Find left most element of list 1 and list 2 and set the smaller one as hint
        for (let i = 0; i < this.steps[1].length; i++){
            if (this.steps[1][i].textNode.text != ""){
                const l1Value = Number(this.steps[1][i].textNode.text);
                for (let j = 0; j < this.steps[2].length; j++){
                    if (this.steps[2][j].textNode.text != ""){
                        const l2Value = Number(this.steps[2][j].textNode.text);
                        if (l1Value < l2Value){
                            var origin = this.steps[1][i].shapeNode;
                        } else {
                            var origin = this.steps[2][j].shapeNode;
                        }
                        origin.baseColour = HINT_COLOUR;
                        setRectColour(origin, origin.baseColour);
                        break;
                    }
                }
                break;
            }
        }

        this.stage.update();
    }

    // Reset the stage and all initial values
    reset(){
        this.stage.removeAllChildren();
        var list = randomList(this.numValues);
        this.steps = this.splitList(list);

        this.select = [];
        this.nodes = [];
        this.count = 0;
        
        this.drawInitial();
        this.stage.update();
    }
}