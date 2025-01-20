export class QuickSortDrill{
    constructor(){
        this.stageWidth = 1600;
        this.stageHeight = 1200;
        this.numValues = 8;
        this.cellWidth = 120;
        this.cellHeight = 120;
        this.hintCount = 3;
        this.errorCount = 0;
        this.font = ["", "50px Arial", ""]
        this.description = "-Sort the list using quick sort step by step, " + 
        "each step will be varified automatically\n\n " +
        "-Click on two elements to swap them around.\n\n" +
        "-Click on New List to get a new list.\n\n"
        this.activeLayer = null;
        this.piviotChoice;

        this.nodes = [];
        this.hints = [];
        this.layerStack = [];
        this.piviotOptions = [];

        this.stage = new createjs.Stage("canvas");
        this.stage.enableMouseOver();
        this.stage.width = this.stageWidth;
        this.stage.height = this.stageHeight;

        var list = randomList(this.numValues);
        this.steps = [];
        this.steps.push(list.slice());
        
        
        this.drawInitial();
        this.stage.update();
    }
    
    
    drawInitial(){
        this.promptText = new createjs.Text("", "bold 50px Arial", "").set({
            text: "Which value should be the piviot",
            textAlign: "center",
            x: this.stageWidth/2,
            y: 40,
            lineWidth: 900
        });
        this.stage.addChild(this.promptText);
            
        this.resetButton = new Button(
            this.stageWidth-210, 110, 200, 100, this.stage, "New List"
        );

        this.resetButton.shapeNode.addEventListener("click", () =>{
            this.reset();
        });

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
            
        new InstructionIcon(this.stage);
        
        this.stage.update();
    }

    choosePiviot(option){
        this.promptText.text = ""
        this.piviotChoice = option;

        this.piviotOptions.forEach((e) => e.clear());

        this.piviotOptions = [];
        
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

        this.nodes.forEach(
            (e) => e.shapeNode.on("click", (evt) => this.click(evt))
        );
        
        this.activeLayer = new Layer(
            this.stageWidth/2 - this.cellWidth/2, 110 + this.cellHeight, 
            this.stage, this.nodes, this
        );
    }

    click(event){
        if (!event.target.selected){
            event.target.selected = true;
            setRectColour(event.target, HIGHLIGHT_COLOUR);
            if (this.activeLayer.select){
                this.activeLayer.add(event.target.parent);
            }
            else if (this.activeLayer.parent.select) {
                const selectedNode = this.nodes.select.shapeNode;
                selectedNode.selected = false;
                event.target.selected = false;
                this.activeLayer.parent.select = null;
                setRectColour(selectedNode, selectedNode.baseColour);
                setRectColour(event.target, event.target.baseColour);

                this.incorrect();
            } else {
                this.activeLayer.parent.select = event.target.parent;
            }
        } else {
            event.target.selected = false;
            this.activeLayer.parent.select = null;
            setRectColour(event.target, event.target.baseColour);
        }
        this.stage.update();
    }

    correct(){
        this.promptText.color = CORRECT_COLOUR;
        if (this.layerStack == "done"){
            this.promptText.text = "The list is now sorted.";
            return
        }

        this.errorCount = 0;
        this.toggleHint(false);

        
        this.promptText.text = "Correct";
    }

    incorrect(){
        this.promptText.text = "Try Again";
        this.promptText.color = HIGHLIGHT_COLOUR;
    
        if (++this.errorCount == 3){
            this.toggleHint(true);
        }
    }

    toggleHint(on){
        if (on){
            this.hints.push(new Button(this.stageWidth-210, 220, 200, 100, this.stage, "hint"));
            this.hints[0].shapeNode.addEventListener("click", () =>{
                this.activeLayer.giveHint();
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

    nextLayer(){
        const values = this.layerStack.pop();
        if (!values){
            this.layerStack = "done";
            return;
        }

        this.activeLayer = new Layer(
            ...values
        );

        this.activeLayer.parent.forEach((e) => {
            e.activate();
            e.shapeNode.addEventListener("click", (evt) => this.click(evt));
        });
    }

    reset(){
        this.stage.removeAllChildren();
        this.errorCount = 0;
        this.activeLayer = null;

        this.nodes = [];
        this.hints = [];

        var list = randomList(this.numValues);
        this.steps = [];
        this.steps.push(list.slice());     
        
        this.drawInitial();
        this.stage.update();
    }
}

class Layer{
    constructor(x, y, stage, parent, main){
        this.cellWidth = 120;
        this.cellHeight = 120;
        this.gapSize = 10;
        this.stage = stage;
        this.parent = parent;
        this.child;
        this.main = main;
        this.count = 0;
        this.x = x;
        this.y = y;
        
        this.piviotLocation;
        this.parent.count = -1;
        if (main.piviotChoice == "Random"){
            this.piviotLocation = Math.floor(Math.random() * parent.length);
        } else if (main.piviotChoice == "Last"){
            this.piviotLocation = parent.length - 1;
        } else {
            this.piviotLocation = 0;
            this.parent.count++;
        }
        parent[this.piviotLocation].changeColour(HINT_COLOUR);

        this.piviot = new Rect(
            x, y ,this.cellWidth, this.cellHeight, stage,
        );

        this.piviot.shapeNode.addEventListener(
            "click", (evt) => this.click(evt)
        );

        this.left = [];
        this.right = [];

        this.parent.child = this;
    }

    click(event){
        if (!event.target.selected){
            event.target.selected = true;
            setRectColour(event.target, HIGHLIGHT_COLOUR);
            
            const source = (this.parent)? this.parent: this.child
            if (source.select){
                this.select = event.target.parent;
                this.add(source.select);
            }
            else if (this.select) {
                const selectedNode = this.select.shapeNode;
                selectedNode.selected = false;
                event.target.selected = false;
                this.select = null;
                setRectColour(selectedNode, selectedNode.baseColour);
                setRectColour(event.target, event.target.baseColour);

                this.main.incorrect();
            } else {
                this.select = event.target.parent;
            }
        } else {
            event.target.selected = false;
            this.select = null;
            setRectColour(event.target, event.target.baseColour);
        }
        this.stage.update();
    }

    add(source){
        let correct = false;
        if ((this.piviot.textNode.text == "") && (this.check(source))){
            this.piviot.shapeNode.removeAllEventListeners();
            correct = true;
            source.object.changeColour(DEFAULT_COLOUR);
            swapRect(this.select.shapeNode, source.shapeNode);
            
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

            if (++this.count == this.parent.length){
                this.done();
                return 0;
            }
            
            this.left[0].shapeNode.addEventListener("click", (evt) => this.click(evt));
            this.right[0].shapeNode.addEventListener("click", (evt) => this.click(evt));
        } else if (this.parent.indexOf(source.object) != this.parent.count){
            correct = false;
        } else if (Number(this.piviot.textNode.text) < Number(source.textNode.text)) {
            if (this.select.object == this.right[this.right.length - 1]){
                this.addToSide(source, "right");
                correct = true;
            }
        } else {
            if (this.select.object == this.left[this.left.length - 1]){
                this.addToSide(source, "left");
                correct = true;
            }
        }

        this.select.shapeNode.selected = false;
        setRectColour(this.select.shapeNode, this.select.shapeNode.baseColour);
        this.select = null;
        
        source.shapeNode.selected = false;
        this.parent.select = null;

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
        source.object.changeColour(DEFAULT_COLOUR);
        swapRect(this.select.shapeNode, source.shapeNode);
        this.select.shapeNode.removeAllEventListeners();

        if (direction == "right"){
            this.right[this.right.length-1].move(this.cellWidth*this.right.length, 0);
    
            this.right.push(
                new Rect(
                    this.x + (this.cellWidth + this.gapSize), this.y,
                    this.cellWidth, this.cellHeight, 
                    this.stage, "", DEFAULT_COLOUR
                )
            )
    
            this.right[this.right.length-1].shapeNode.addEventListener(
                "click", (evt) => this.click(evt)
            );
            this.right.x = this.right.x + this.cellHeight/2;
        } else {
            this.left.forEach((e) => e.move(-1 * this.cellWidth, 0));

            this.left.push(
                new Rect(
                    this.x - (this.cellWidth + this.gapSize), this.y,
                    this.cellWidth, this.cellHeight, 
                    this.stage, "", DEFAULT_COLOUR
                )
            )

            this.left[this.left.length-1].shapeNode.addEventListener(
                "click", (evt) => this.click(evt)
            );
            this.left.x = this.left.x - this.cellHeight/2;
        }
        
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

        if (++this.count == this.parent.length){
            this.done();
        }
    }

    check(source){
        if (this.parent.indexOf(source.object) == this.piviotLocation){
            return true;
        } else {
            return false;
        }
    }

    done(){
        this.right[this.right.length - 1].clear();
        this.right.pop();
        this.right.forEach((e) => e.move(-this.cellWidth, 0));
        if (this.right.length > 1){
            this.main.layerStack.push(
                [this.right.x - this.cellWidth/2, 
                 this.right.y + this.cellHeight + this.gapSize, 
                 this.stage, this.right, this.main]
            );
        }

        this.left[this.left.length - 1].clear();
        this.left.pop();
        this.left.forEach((e) => e.move(this.cellWidth, 0));
        if (this.left.length > 1){
            this.main.layerStack.push(
                [this.left.x + this.cellWidth/2, 
                 this.left.y + this.cellHeight + this.gapSize, 
                 this.stage, this.left, this.main]
            );
        }

        this.main.nextLayer();
    }

    giveHint(){
        if ((this.piviot.textNode.text == "")){
            this.piviot.changeColour(HINT_COLOUR);
            return
        } 
        const sourceRect = this.parent[this.parent.count]
        sourceRect.changeColour(HINT_COLOUR);
        if (Number(this.piviot.textNode.text) < Number(sourceRect.textNode.text)) {
            this.right[this.right.length-1].changeColour(HINT_COLOUR);

        } else {
            this.left[this.left.length-1].changeColour(HINT_COLOUR);
        }
    }
}