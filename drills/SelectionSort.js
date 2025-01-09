import * as util from "../util/common.js";
Object.assign(globalThis, util);

export class SelectionSortDrill{
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
        this.description = "-Sort the list using insertion sort, after each " + 
        "iteration click on Check to varify if it was correct.\n\n" + 
        "-Click on two elements to swap them around.\n\n" +
        "-Click on New List to get a new list.\n\n" + 
        "-Click on Revert to undo changes made in the current iteration."
        
        
        this.stage = new createjs.Stage("canvas");
        this.stage.enableMouseOver();
        this.stage.width = this.stageWidth;
        this.stage.height = this.stageHeight;
        
        const list = randomList(this.numValues);
        this.steps = this.selectionSortAlg(this.randomiseList(list));

        this.select = [];
        this.nodes = [];
        this.hints = [];
        
        this.drawInitial();
        this.stage.update();
    }

    randomiseList(list){
        list.sort(function(a, b){return a - b});

        var temp = [];
        for (let i = 1; i < list.length; i++){
            temp.push(i);
        }
        
        var newList = new Array(list.length);
        var prev = 0;
        
        for (let n = temp.length; n > 0; n--){
            const random = Math.floor(Math.random() * temp.length);
            newList[temp[random]] = list[prev];
            prev = temp[random];
            temp.splice(random, 1);
        }
        newList[0] = list[prev];
        return newList;
    }

    selectionSortAlg(list){
        var steps = [];
        steps.push(list.slice());
    
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
            steps.push(list.slice());
        }
        return steps;
    }
    
    swap(t1, t2){
        var temp = t1.parent.textNode.text;

        t1.parent.textNode.text = t2.parent.textNode.text;
        t2.parent.textNode.text = temp;

        t1.selected = false;
        setRectColour(t1, t1.baseColour);
        
        t2.selected = false;
        setRectColour(t2, t2.baseColour);
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
                DEFAULT_COLOUR
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
            y: 360,
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
        for (let i = 0; i < this.numValues; i++){
            if (this.nodes[i].textNode.text != this.steps[this.count][i] + ""){
                correct = false;
                break;
            }
        }

        if (correct){
            const correctNode = this.nodes[this.numValues - this.count];
            this.count++;
            this.errorCount = 0;
            this.toggleHint(false);

            setRectColour(correctNode.shapeNode, CORRECT_COLOUR);
            correctNode.shapeNode.removeAllEventListeners();

            this.promptText.color = CORRECT_COLOUR;
            
            if (this.count == this.numValues){
                setRectColour(this.nodes[0].shapeNode, CORRECT_COLOUR);
                this.promptText.text = "The list is now sorted.";
                this.nodes[0].shapeNode.removeAllEventListeners();
            } else {
                this.iterationText.text = "Iteration "  + this.count;
                this.promptText.text = "Correct";
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

    toggleHint(on){
        if (on){
            this.hints.push(new Button(this.stageWidth-250, 100, 200, 100, this.stage, "hint"));
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
        }
    }

    giveHint(){
        var maxValue = 0;
        var maxIndex = -1;
        for (let i = 0; i < this.numValues - this.count; i++){
            if (this.steps[this.count-1][i] > maxValue){
                maxValue = this.steps[this.count-1][i];
                maxIndex = i;
            }
        }
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
                15 * (this.numValues - this.count - maxIndex)
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
                15 * (this.numValues - this.count - maxIndex),
                "",
                true
            )
        );

        this.stage.addChild(this.hints[1]);
        this.stage.addChild(this.hints[2]);
        this.stage.update();
    }
}