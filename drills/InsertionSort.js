export class InsertionSortDrill{
    constructor(){
        this.stageWidth = 1600;
        this.stageHeight = 700;
        this.numValues = 8
        this.cellWidth = 120;
        this.cellHeight = 120;
        this.count = 1;
        this.stepCount = 0;
        this.hintCount = 3;
        this.errorCount = 0;
        this.hinting = false;
        this.font = ["", "50px Arial", ""]
        this.maxSwap = 5;
        this.description = "- Sort the list using insertion sort.\n\n" + 
        "- Click on two elements to swap them around.\n\n" +
        "- Click on New List to get a new list.\n\n"

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

        if (newList[0] < newList[1]){
            const temp = newList[0];
            newList[0] = newList[1];
            newList[1] = temp;
        }

        return newList;
    }

    insertionSortAlg(list){
        var steps = []
        steps.push([list.slice()]);
        for (let i = 1; i < this.numValues; i++){
            let count = 1;
            let arr = []
            while (count <= i){
                if (list[i-count+1] < list[i-count]){
                    let temp = list[i-count+1];
                    list[i-count+1] = list[i-count];
                    list[i-count] = temp;
                    count++;
                    arr.push(list.slice());
                } else {
                    break;
                }
            }
            steps.push(arr);
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
                "" + this.steps[0][0][i],
                (i == 0)? PARTIAL_COLOUR: DEFAULT_COLOUR
            );
            const rect = node.shapeNode;
            
            rect.on("click", (evt) => this.click(evt));
            
            this.nodes.push(node);
        }

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

        this.resetButton = new Button(
            (this.stageWidth - 200)/2, 500, 200, 100, this.stage, "New List"
        );
        this.resetButton.shapeNode.addEventListener("click", () =>{
            this.reset();
        });

        new InstructionIcon(this.stage);

        this.stage.update();
    }

    click(event){
        if (!event.target.selected){
            event.target.selected = true;
            setRectColour(event.target, HIGHLIGHT_COLOUR);
            
            if (this.select.length == 1){
                swapRect(event.target, this.select[0]);

                if (!this.check()) swapRect(this.select[0], event.target);
                
                this.select.pop();

                if (this.select[0]){
                    setRectColour(this.select[0], this.select.baseColour);
                    this.select[0].selected = false;
                    this.select.pop();
                }

                if (this.hinting){
                    this.stage.removeChild(this.hints.pop());
                    this.giveHint();
                }
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


        for (let i = 0; i < this.numValues; i++){
            if (this.nodes[i].textNode.text != this.steps[this.count][this.stepCount][i] + ""){
                correct = false;
                break;
            }
        }

        if (correct){
            if (++this.stepCount >= this.steps[this.count].length){
                this.stepCount = 0;
                this.errorCount = 0;
                this.toggleHint(false);
                
                this.promptText.color = CORRECT_COLOUR;
                do{
                    this.count++;
                }
                while ((this.count < this.steps.length) && 
                    (this.steps[this.count].length == 0));

                this.iterationText.text = "Iteration "  + this.count;
                for (let i = 0; i < this.count; i++){
                    this.nodes[i].shapeNode.baseColour = PARTIAL_COLOUR;
                    setRectColour(this.nodes[i].shapeNode, PARTIAL_COLOUR);
                }
                
                if (this.count >= this.numValues){
                    this.nodes.forEach((e) => {
                        setRectColour(e.shapeNode, CORRECT_COLOUR);
                        e.shapeNode.removeAllEventListeners();
                    })
                    this.promptText.text = "The list is now sorted.";
                } else {
                    this.promptText.text = "Correct";
                }
            };

            return true
        } else {
            this.promptText.text = "Try Again";
            this.promptText.color = HIGHLIGHT_COLOUR;
            if (++this.errorCount == 3){
                this.toggleHint(true);
            }

            return false
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
                this.hinting = true;
            });
        } else {
            this.hinting = false;
            this.hints.forEach((e) =>{
                if (e instanceof Button){
                    e.clear();
                }
                this.stage.removeChild(e);
            })
            this.hints = []
        }
    }

    giveHint(){
        var dist = 1;
        while (this.steps[this.count-dist].length == 0){
            dist++;
        }

        var targetIndex = -1;
        for (let i = 0; i <= this.count; i++){
            if (this.steps[this.count-dist][0][this.count] 
                == this.steps[this.count][this.steps[this.count].length - 1][i]){
                targetIndex = i;
                break;
            }
        }

        var sourceIndex = 0;
        for (let i = 0; i < this.nodes.length; i++){
            if (this.steps[this.count-dist][0][this.count] == this.nodes[i].textNode.text){
                sourceIndex = i;
                break;
            }
        }

        if (targetIndex == sourceIndex) return;

        this.addArc(sourceIndex, targetIndex);
        this.stage.update();
    }

    addArc(sourceIndex, targetIndex){
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
        this.stage.addChild(this.hints[1]);
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