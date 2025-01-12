export class InsertionSortDrill{
    constructor(){
        this.stageWidth = 1600;
        this.stageHeight = 700;
        this.numValues = 8
        this.cellWidth = 120;
        this.cellHeight = 120;
        this.count = 1;
        this.hintCount = 3;
        this.errorCount = 0;
        this.font = ["", "50px Arial", ""]
        this.maxSwap = 6;
        this.description = "-Sort the list using inesrtion sort, after each " + 
        "iteration click on Check to varify if it was correct.\n\n" + 
        "-Click on two elements to swap them around.\n\n" +
        "-Click on New List to get a new list.\n\n" + 
        "-Click on Revert to undo changes made in the current iteration. "

        this.stage = new createjs.Stage("canvas");
        this.stage.enableMouseOver();
        this.stage.width = this.stageWidth;
        this.stage.height = this.stageHeight;

        var list = randomList(this.numValues);
        this.steps = this.insertionSortAlg(this.randomiseList(list));

        this.select = [];
        this.nodes = [];
        this.hints = [];
        
        this.drawInitial();
        this.stage.update();
    }

    randomiseList(list){
        var newList = [];
        var n = 0;

        list.sort(function(a, b){return a - b});
        newList[0] = list[0];

        for (let i = 1; i < this.numValues; i++){
            let location;
            
            if (n < -2){
                location = 0
            } else if (n > 2){
                location = Math.floor(Math.random() * this.maxSwap) + 1
            } else {
                location = Math.floor(Math.random() * (this.maxSwap + 1))
            }

            if (location == 0){
                n = n + 2;
            } else {
                n--;
            }

            if (location >= newList.length){
                newList = newList.toSpliced(0, 0, list[i]);
            } else {
                newList = newList.toSpliced(newList.length - location, 0, list[i]);
            }
        }

        return newList;
    }

    insertionSortAlg(list){
        var steps = []
        steps.push(list.slice());
        for (let i = 1; i < this.numValues; i++){
            let count = 1;
            while (count <= i){
                if (list[i-count+1] < list[i-count]){
                    let temp = list[i-count+1];
                    list[i-count+1] = list[i-count];
                    list[i-count] = temp;
                    count++;
                } else {
                    break;
                }
            }
            steps.push(list.slice());
        }
        return steps;
    }

    drawInitial(){
        for (let i = 0; i < this.numValues; i++){
            const node = new Rect(
                i * this.cellWidth 
                    + (this.stageWidth - this.numValues * this.cellWidth)/2,
                this.stageHeight/2 - this.cellHeight/2 - 100,
                this.cellWidth,
                this.cellHeight,
                this.stage,
                "" + this.steps[0][i],
                (i == 0)? PARTIAL_COLOUR: DEFAULT_COLOUR
            );
            const container = node.container;
            const rect = node.shapeNode;
            
            rect.on("click", (evt) => this.click(evt));
            
            this.nodes.push(container);
        }

        this.promptText = new createjs.Text("", "bold 50px Arial", "").set({
            text: "",
            textAlign: "center",
            x: this.stageWidth/2,
            y: 400,
            lineWidth: 400
        });
        this.stage.addChild(this.promptText);
        
        this.iterationText = new createjs.Text("", "50px Arial", "").set({
            text: "Iteration 1",
            x: this.nodes[0].x - 100,
            y: 100,
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

        this.checkButton = new Button(700, 500, 200, 100, this.stage, "Check");
        this.checkButton.shapeNode.addEventListener("click", () =>{
            this.check();
        });

        this.resetButton = new Button(400, 500, 200, 100, this.stage, "New List");
        this.resetButton.shapeNode.addEventListener("click", () =>{
            this.reset();
        });

        this.revertButton = new Button(1000, 500, 200, 100, this.stage, "Revert");
        this.revertButton.shapeNode.addEventListener("click", () =>{
            this.revert();
        });

        new InstructionIcon(this.stage);

        this.stage.update();
    }

    revert(){
        for (let i = 0; i < this.numValues; i++){
            this.nodes[i].textNode.text = this.steps[this.count-1][i];
            if (i < this.count){
                this.nodes[i].shapeNode.baseColour = PARTIAL_COLOUR;
                setRectColour(this.nodes[i].shapeNode, PARTIAL_COLOUR);
            } else {
                this.nodes[i].shapeNode.baseColour = DEFAULT_COLOUR;
                setRectColour(this.nodes[i].shapeNode, DEFAULT_COLOUR);
            }
        }
        this.stage.update();
    }

    click(event){
        if (!event.target.selected){
            event.target.selected = true;
            setRectColour(event.target, HIGHLIGHT_COLOUR);
            
            if (this.select.length == 1){
                swapRect(event.target, this.select[0]);
                this.select.pop();
            }
            else {
                this.select.push(event.target);
            }
        } else {
            event.target.selected = false;
            setRectColour(event.target, event.target.baseColour);
            this.select.pop();
        }
        this.stage.update();
    }

    check(){
        if (this.count == this.numValues){
            return;
        }

        var correct = true;
        if (this.select[0]){
            setRectColour(this.select[0], this.select.baseColour);
            this.select[0].selected = false;
            this.select.pop();
        }

        for (let i = 0; i < this.numValues; i++){
            if (this.nodes[i].textNode.text != this.steps[this.count][i] + ""){
                correct = false;
                break;
            }
        }

        if (correct){
            this.count++;
            this.errorCount = 0;
            this.toggleHint(false);

            this.promptText.color = CORRECT_COLOUR;
            
            if (this.count == this.numValues){
                this.nodes.forEach((e) => {
                    setRectColour(e.shapeNode, CORRECT_COLOUR);
                    e.shapeNode.removeAllEventListeners();
                })
                this.promptText.text = "The list is now sorted.";
            } else {
                this.iterationText.text = "Iteration "  + this.count;
                this.promptText.text = "Correct";
                for (let i = 0; i < this.count; i++){
                    this.nodes[i].shapeNode.baseColour = PARTIAL_COLOUR;
                    setRectColour(this.nodes[i].shapeNode, PARTIAL_COLOUR);
                }
            }
        } else {
            this.revert();
            this.promptText.text = "Try Again";
            this.promptText.color = HIGHLIGHT_COLOUR;
            if (++this.errorCount == 3){
                this.toggleHint(true);
            }
        }

        this.stage.update();
    }

    toggleHint(on){
        if (on){
            this.hints.push(new Button(
                this.stageWidth-250, 100, 200, 100, this.stage, "hint"
            ));
            this.hints[0].shapeNode.addEventListener("click", () =>{
                this.giveHint();
            });
        } else {
            this.hints.forEach((e) =>{
                if (e instanceof Button){
                    e.clear();
                }
                this.stage.removeChild(e);
            })
            this.hints = []
            this.checkButton.changeColour(BUTTON_COLOUR);
        }
    }

    giveHint(){
        var maxIndex = -1;
        for (let i = 0; i <= this.count; i++){
            if (this.steps[this.count-1][this.count] == this.steps[this.count][i]){
                maxIndex = i;
                break;
            }
        }
        if (maxIndex == this.count){
            this.checkButton.changeColour(HINT_COLOUR);
            return;
        }
        this.hints.push(
            drawArc(
                {
                    x:this.nodes[this.count].x + this.cellWidth*3/20,
                    y:this.nodes[this.count].y - 5
                },
                {
                    x:this.nodes[maxIndex].x + this.cellWidth*3/20,
                    y:this.nodes[maxIndex].y - 10
                },
                15 * (this.count - maxIndex),
                "",
                true
            )
        );
        
        this.stage.addChild(this.hints[1]);
        this.stage.addChild(this.hints[2]);
        this.revert();
    }

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