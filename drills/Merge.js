export class MergeDrill{
    constructor(){
        this.stageWidth = 1600;
        this.stageHeight = 700;
        this.numValues = 8;
        this.cellWidth = 120;
        this.cellHeight = 120;
        this.count = 0;
        this.hintCount = 3;
        this.errorCount = 0;
        this.font = ["", "50px Arial", ""]
        this.description = "-Merge the two smaller list into one sorted " + 
        "list step by step\n\n " +
        "-Click on two elements to move them around.\n\n" +
        "-Click on New List to get a new list.\n\n"

        this.select = [];
        this.nodes = [];
        this.hints = [];

        this.stage = new createjs.Stage("canvas");
        this.stage.enableMouseOver();
        this.stage.width = this.stageWidth;
        this.stage.height = this.stageHeight;

        var list = randomList(this.numValues);
        this.steps = this.splitList(list);

        
        this.drawInitial();
        this.stage.update();
    }

    splitList(list){
        var steps = [];
        list.sort(function(a, b){return a - b});
        steps.push(list.slice());
        const listSize = Math.floor(Math.random()*3) + 3;

        var list1 = [];
        var list2 = [];
        var temp = [];

        for (let i = 0; i < list.length; i++){
            temp.push(i);
        }
        
        for (let n = temp.length; n > 0; n--){
            const random = Math.floor(Math.random() * temp.length);
            if (n <= listSize){
                list1.push(list[temp[random]])
            } else {
                list2.push(list[temp[random]])
            }
            temp.splice(random, 1);
        }
        list1.sort(function(a, b){return a - b});
        list2.sort(function(a, b){return a - b});
        steps.push(list2);
        steps.push(list1);
        return steps;
    }

    drawInitial(){
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
                const container = node.container;
                const rect = node.shapeNode;
                                
                rect.on("click", (evt) => this.click(evt));

                if (j == 0){
                    rect.correctValue = "" + this.steps[0][i];
                    this.nodes.push(container);
                } else {
                    this.steps[j][i] = container;
                }
            }
        }

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

        this.resetButton = new Button(
            this.stageWidth/2-100, 600, 200, 100, this.stage, "New List");
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
                this.check(event.target);
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

    check(target){
        if (this.count == this.numValues){
            return;
        }

        var correct = false;
        var correctNode;
        var originNode;
        if (target == this.nodes[this.count].shapeNode &&
            target.correctValue == this.select[0].parent.textNode.text){
                correct = true;
                correctNode = target;
                originNode = this.select[0];
        } else if (this.select[0] == this.nodes[this.count].shapeNode &&
            this.select[0].correctValue == target.parent.textNode.text){
                correct = true;
                correctNode = this.select[0];
                originNode = target;
        }

        if (correct){
            this.promptText.color = CORRECT_COLOUR;
            swapRect(target, this.select[0]);
            // correctNode.parent.textNode.text = originNode.parent.textNode.text;
            this.count++;
            this.errorCount = 0;
            this.toggleHint(false);

            setRectColour(correctNode, CORRECT_COLOUR);
            setRectColour(originNode, BUTTON_COLOUR);

            correctNode.removeAllEventListeners();
            originNode.removeAllEventListeners();

            if (this.count == this.numValues){
                this.promptText.text = "The list is now sorted.";
            } else {
                this.promptText.text = "Correct";
            }
        } else {
            this.promptText.text = "Try Again";
            this.promptText.color = HIGHLIGHT_COLOUR;
            target.selected = false;
            setRectColour(target, target.baseColour);
        
            this.select[0].selected = false;
            setRectColour(this.select[0], this.select[0].baseColour);
            if (++this.errorCount == 3){
                this.toggleHint(true);
            }
        }

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
        const target = this.nodes[this.count].shapeNode;
        
        target.baseColour = HINT_COLOUR;
        setRectColour(target, target.baseColour);

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