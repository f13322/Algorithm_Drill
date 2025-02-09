export class heapDrill{
    constructor(){
        this.stageWidth = 1600;
        this.stageHeight = 700;
        this.circleSize = 40;
        this.height = 4;
        this.hintCount = 3;
        this.errorCount = 0;

        this.values = this.heapify(randomList(4));
        this.count = 0;
        this.description = "- Restore the heap after inserting or deleting a " + 
        "value step by step.\n\n " +
        "- Click on two elements to swap them around.\n\n"
        
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

    heapify(list){
        for (let i = Math.floor(list.length/2)  -1; i >= 0; i--){
            this.percolateDown(list, i);
        }
        return list;
    }

    percolateDown(list, i){
        const leftIndex = 2*i + 1;
        const rightIndex = leftIndex + 1;
        
        if ((rightIndex < list.length) 
            && (list[i] < list[rightIndex]) 
            && (list[leftIndex] < list[rightIndex])){
                const temp = list[i];
                const original = list.slice();

                list[i] = list[rightIndex];
                list[rightIndex] = temp;

                const arr = this.percolateDown(list, rightIndex);
                arr.unshift(original);
                return arr;
        } else if ((leftIndex < list.length) && (list[i] < list[leftIndex])){
            const temp = list[i];
            const original = list.slice();
            list[i] = list[leftIndex];
            list[leftIndex] = temp;

            const arr = this.percolateDown(list, leftIndex);
            arr.unshift(original);
            return arr;
        }

        return [list.slice()];
    }

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

    drawInitial(){
        // Draw the binary tree
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

                this.nodes.push(circle.container);
            }
        }

        

        for (let i = 0; i < Math.floor(this.nodes.length/2); i++){
            const line = new createjs.Shape();
            line.graphics.setStrokeStyle(4).beginStroke("black");

            const startCoord = [this.nodes[i].x, this.nodes[i].y];
            const t1Coord = [this.nodes[i*2+1].x, this.nodes[i*2+1].y];
            const t2Coord = [this.nodes[i*2+2].x, this.nodes[i*2+2].y];

            line.graphics.moveTo(...startCoord).lineTo(...t1Coord);
            line.graphics.moveTo(...startCoord).lineTo(...t2Coord);
            
            this.stage.addChildAt(line, 0);
            line.graphics.endStroke();
        }
        
        
        const rectSize = 70;
        for (let i = 0; i < this.nodes.length; i++){
            const rect = new Rect(
                i*rectSize + this.stageWidth/2 - this.nodes.length * rectSize/2,
                400,
                rectSize,
                rectSize,
                this.stage,
                "" + this.nodes[i].children[1].text,
            )

            rect.setFontSize(35);
            rect.shapeNode.removeAllEventListeners();

            this.list.push(rect.container);
        }

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

        new InstructionIcon(this.stage);

        this.toggleButtons(true);
    }

    swap(t1, t2){
        const l1 = this.list[this.nodes.indexOf(t1.parent)].shapeNode;
        const l2 = this.list[this.nodes.indexOf(t2.parent)].shapeNode;
        swapCircle(t1, t2);
        swapRect(l1, l2);
    }

    click(event){
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

            if (nodeIndex != -1){
                setRectColour(
                    this.list[this.nodes.indexOf(event.target.parent)].shapeNode, 
                    DEFAULT_COLOUR)
            }
            this.select.pop();
        }
        this.stage.update();
    }

    check(target){
        const temp = target.object.textNode.text;
        target.object.textNode.text = this.select[0].object.textNode.text;
        this.select[0].object.textNode.text = temp;

        const nodeIndex = this.nodes.indexOf(this.select[0].parent);
        this.select[0].selected = false;
        setCircleColour(this.select[0], this.select[0].baseColour);
        if (nodeIndex != -1){
            setRectColour(
                this.list[nodeIndex].shapeNode, 
                DEFAULT_COLOUR)
        }
        this.stage.update();

        for (let i = 0; i < this.values.length; i++){
            if (this.steps[this.count][i] != this.nodes[i].textNode.text){
                this.incorrect();
                this.select[0].object.textNode.text = target.object.textNode.text;
                target.object.textNode.text = temp;
                return
            }
        }

        
        for (let i = 0; i < this.list.length; i++){
            this.list[i].textNode.text = this.nodes[i].textNode.text;
        }
        
        if (++this.count >= this.steps.length){
            if (this.addNode){
                this.addNode.clear();
                this.addNode = null;
            }
            this.toggleButtons(true);
        }
        this.correct();
    }

    addValue(){
        var value;

        do {
            value = Math.floor(Math.random() * 100) + 1;
        } while (this.values.indexOf(value) != -1);

        this.addNode = new Circle(
            this.stageWidth/2,
            600,
            this.circleSize,
            this.stage,
            value
        )

        this.values.push(value);
        this.steps = this.percolateUp(this.values, this.values.length-1);
        this.count = 0;

        this.addNode.shapeNode.addEventListener("click", (event) => {
            this.click(event);
        })
        
        this.addNode.shapeNode.addEventListener("touchend", (event) => {
            this.click(event);
        })

        this.nodes.forEach((e) => {
            e.shapeNode.addEventListener("click", (event) => {
                this.click(event);
            });
            e.shapeNode.addEventListener("touchend", (event) => {
                this.click(event);
            });
            e.object.activate();
        })

        this.stage.update();
    }

    removeValue(){
        this.nodes[0].textNode.text = "";
        this.list[0].textNode.text = "";

        if (this.values.length <= 1){
            this.values = [];
            this.toggleButtons(true);
            return;
        }

        this.values[0] = this.values.pop();
        this.steps = this.percolateDown(this.values, 0);
        this.steps[0].push("");
        this.count = 0;


        this.nodes.forEach((e) => {
            e.shapeNode.addEventListener("click", (event) => {
                this.click(event);
            });
            e.shapeNode.addEventListener("touchend", (event) => {
                this.click(event);
            });
            e.object.activate();
        })

        this.stage.update();
    }

    correct(){
        this.promptText.color = CORRECT_COLOUR;
        this.errorCount = 0;
        this.toggleHint(false);     
        this.promptText.text = (this.count >= this.steps.length)?"Done":"Correct";
        this.nodes.forEach((e) => e.object.changeColour(DEFAULT_COLOUR));
    }

    incorrect(){
        this.promptText.text = "Try Again";
        this.promptText.color = HIGHLIGHT_COLOUR;
    
        if (++this.errorCount == this.hintCount){
            this.toggleHint(true);
        }
    }

    toggleButtons(on){
        if (on){
            if (this.values.length < this.nodes.length){
                this.insertButton = new Button(
                    this.stageWidth/2 - 400, 600, 300, 100, this.stage, "Add Value"
                );
                
                this.insertButton.shapeNode.addEventListener("click", () =>{
                    this.toggleButtons(false);
                    this.addValue();
                })
            }
            
            if (this.values.length > 0){
                this.deleteButton = new Button(
                    this.stageWidth/2 + 100, 600, 300, 100, this.stage, "Remove Value"
                )
    
                this.deleteButton.shapeNode.addEventListener("click", () => {
                    this.toggleButtons(false);
                    this.removeValue();
                })
            }

            this.nodes.forEach((e) => {
                e.shapeNode.removeAllEventListeners();
                setCircleColour(e.shapeNode, DEFAULT_COLOUR);
            })

        } else {
            this.insertButton.clear();
            this.deleteButton.clear();
            this.promptText.text = "";
        }
    }

    toggleHint(on){
        if (on){
            this.hints.push(new Button(this.stageWidth-210, 100, 200, 100, this.stage, "hint"));
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
        for (let i = 0; i < this.steps[this.count].length; i++){
            if (this.steps[this.count][i] != this.nodes[i].textNode.text){
                this.nodes[i].object.changeColour(HINT_COLOUR);
            }
        }
        this.stage.update();
    }

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