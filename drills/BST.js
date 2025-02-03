export class BST{
    constructor(){
        this.stageWidth = 2000;
        this.stageHeight = 1600;
        this.circleSize = 40;
        this.hintCount = 3;
        this.errorCount = 0;
        this.description = 
            "- Insert/search/remove a value from the binary search tree by treversing through it.\n\n" + 
            "- Click on the current active node to compare against its value."
        
        this.root = null;
        this.currentDrill = null;
        this.currentNode = null;
        this.newNode = null;
        this.hintButton = null;
        
        this.stage = new createjs.Stage("canvas");
        this.stage.width = this.stageWidth;
        this.stage.height = this.stageHeight;
        this.stage.enableMouseOver();
        
        this.line = new createjs.Shape();
        this.stage.addChild(this.line);

        this.nodes = [];
        this.lines = [];
        this.select = [];
        this.hint = null;
        this.values = new Set();


        this.drawInitial();
        this.stage.update();
    }

    drawInitial(){
        const value = Math.floor(Math.random()*100) + 1;
        this.root = new Circle(
            0, 0, this.circleSize, this.stage, value
        ); 
        this.root.value = value;
        this.values.add(value);

        this.root.setFontSize(this.circleSize);

        this.root.shapeNode.removeAllEventListeners();

        this.root.left = new Circle(0, 0, this.circleSize, this.stage);
        this.root.left.parent = this.root;
        this.root.right = new Circle(0, 0, this.circleSize, this.stage);
        this.root.right.parent = this.root;
        
        this.root.children = [
            this.root.left,
            this.root.right
        ]

        this.root.children.forEach((e) => {
            e.shapeNode.removeAllEventListeners();
            e.setFontSize(this.circleSize);
        });

        this.promptText = new createjs.Text("", "bold 50px Arial", "").set({
            text: "",
            textAlign: "center",
            x: this.stageWidth/2 + 400,
            y: 180,
            lineWidth: 400
        });
        this.stage.addChild(this.promptText);

        this.toggleButtons(true);
        this.updateTree();

        new InstructionIcon(this.stage);
    }

    insertDrill(event){
        if (this.newNode.value <  event.target.object.value){
            this.promptText.text = "Smaller";
            this.promptText.color = "black";
            this.currentNode = this.currentNode.left;
        } else if (this.newNode.value > event.target.object.value){
            this.promptText.text = "Larger";
            this.promptText.color = "black";
            this.currentNode = this.currentNode.right;
        } else {
            event.target.object.value = this.newNode.value;
            event.target.object.textNode.text = this.newNode.value;

            this.values.add(this.newNode.value);

            this.addNode(event.target.object);
            this.endDrill();
            return;
        }
        
        event.target.object.shapeNode.removeAllEventListeners();
        event.target.object.children.forEach((e) => {
            e.shapeNode.addEventListener("click", (evt) => {
                this.click(evt);
            });
            e.shapeNode.addEventListener("touchend", (evt) => {
                this.click(evt);
            });
            e.activate();
        });
    }

    deleteDrill(event){
        if (this.newNode.target){
            const target = this.newNode.target;
            if ((target.right.value) && (target.left.value)){    
                if (this.currentNode.left.value){
                    this.currentNode = this.currentNode.left;
                } else {
                    target.textNode.text = this.currentNode.value;
                    target.value = this.currentNode.value;

                    this.currentNode.left.clear();
                    this.currentNode.clear();

                    if (this.currentNode.parent == target){
                        this.currentNode.parent.right = this.currentNode.right;
                        this.currentNode.parent.children[1] = this.currentNode.right;
                        this.currentNode.right.parent = this.currentNode.parent;
                    } else {
                        this.currentNode.parent.left = this.currentNode.right;
                        this.currentNode.parent.children[0] = this.currentNode.right;
                        this.currentNode.right.parent = this.currentNode.parent;
                    }

                    this.updateTree();
                    this.endDrill();
                    return;
                }
            } else if (target == this.root){
                this.root = this.currentNode;
                target.clear();
                if (!(target.left.value)) target.left.clear();
                if (!(target.right.value)) target.right.clear();

                this.updateTree();
                this.endDrill();
                return;
            } else if (target.parent.right == target){
                target.parent.right = this.currentNode;
                target.parent.children[1] = this.currentNode;
                this.currentNode.parent =target.parent;
                
                target.clear();
                if (!(target.left.value)) target.left.clear();
                if (!(target.right.value)) target.right.clear();

                this.updateTree();
                this.endDrill();
                return;
            } else {
                target.parent.left = this.currentNode;
                target.parent.children[0] = this.currentNode;
                this.currentNode.parent =target.parent;

                target.clear();
                if (!(target.left.value)) target.left.clear();
                if (!(target.right.value)) target.right.clear();

                this.updateTree();
                this.endDrill();
                return;
            }
        } else if (this.newNode.value <  event.target.object.value){
            this.promptText.text = "Smaller";
            this.promptText.color = "black";
            this.currentNode = this.currentNode.left;
        } else if (this.newNode.value > event.target.object.value){
            this.promptText.text = "Larger";
            this.promptText.color = "black";
            this.currentNode = this.currentNode.right;
        } else {
            event.target.object.textNode.text = "";
            this.values.delete(event.target.object.value);
            event.target.object.value = undefined;
            this.newNode.target = event.target.object;
            
            if (event.target.object.right.value){
                this.currentNode = this.currentNode.right;
            }  else if (event.target.object.left.value){
                this.currentNode = this.currentNode.left;
            } else {
                event.target.object.children.forEach((e) =>
                    e.clear()
                );
                event.target.object.children = undefined;
                this.updateTree();
                event.target.object.shapeNode.removeAllEventListeners();
                this.endDrill();
                return;
            }

            this.promptText.text = "Find the replacement Node";
            this.newNode.textNode.text = this.newNode.value;
        }

        event.target.object.shapeNode.removeAllEventListeners();
        event.target.object.children.forEach((e) => {
            e.shapeNode.addEventListener("click", (evt) => this.click(evt));
            e.shapeNode.addEventListener("touchend", (evt) => this.click(evt));
            e.activate();
        });
    }

    searchDrill(event){
        if (this.newNode.value <  event.target.object.value){
            this.promptText.text = "Smaller";
            this.promptText.color = "black";
            this.currentNode = this.currentNode.left;
        } else if (this.newNode.value > event.target.object.value){
            this.promptText.text = "Larger";
            this.promptText.color = "black";
            this.currentNode = this.currentNode.right;
        } else {
            this.promptText.color = "black";
            event.target.object.shapeNode.removeAllEventListeners();
            this.endDrill();
            this.promptText.text = 
                (this.newNode.value == event.target.object.value)? 
                "Value found":"Value not in tree";
            return;
        }

        event.target.object.shapeNode.removeAllEventListeners();
        event.target.object.children.forEach((e) => {
            e.shapeNode.addEventListener("click", (evt) => this.click(evt));
            e.shapeNode.addEventListener("touchend", (evt) => this.click(evt));
            e.activate();
        });
    }

    click(event){
        if ((this.currentDrill == null) || this.newNode == null){
            return
        }

        if (event.target.object != this.currentNode){
            this.incorrect();
            return;
        }

        if (event.target.object != this.root){
            event.target.object.parent.children.forEach((e) => {
                e.shapeNode.removeAllEventListeners();
            });
        }
        
        setCircleColour(
            event.target.object.shapeNode, event.target.baseColour
        );

        if (this.currentDrill == "insert"){
            this.insertDrill(event);
        } else if (this.currentDrill == "delete"){
            this.deleteDrill(event);
        } else {
            this.searchDrill(event);
        }

        if (this.hint){
            this.giveHint();
        }

        this.stage.update();
    }

    startDrill(){
        this.toggleButtons(false);

        let n; // the probability that the new value is in the tree
        if (this.currentDrill == "insert"){
            n = 0;
        } else if (this.currentDrill == "delete"){
            n = 1;
        } else {
            n = 0.7;
        }

        let value
        if (Math.random() < n){
            do {
                value = Math.floor(Math.random()*100) + 1;
            } while (!(this.values.has(value)));
        } else {
            do {
                value = Math.floor(Math.random()*100) + 1;
            } while (this.values.has(value));
        }

        this.newNode = new Circle(
            this.stageWidth/2, 80, this.circleSize, this.stage, value
        );
        this.newNode.value = value;
        this.newNode.shapeNode.removeAllEventListeners();

        this.root.activate();
        this.root.shapeNode.addEventListener("click", (evt) => this.click(evt));
        this.root.shapeNode.addEventListener("touchend", (evt) => this.click(evt));
        this.currentNode = this.root;

        this.stage.update();
    }

    endDrill(){
        this.currentNode = this.root;
        this.newNode.clear();
        this.newNode = null;
        this.toggleButtons(true);
        this.toggleHint(false);
        this.correct();
        this.stage.update();
    }

    addNode(node){
        if (!(node.children)){
            const left = new Circle(0, 0, this.circleSize, this.stage);
            left.setFontSize(this.circleSize);
            left.shapeNode.removeAllEventListeners();
            left.parent = node;

            const right = new Circle(0, 0, this.circleSize, this.stage);
            right.setFontSize(this.circleSize);
            right.shapeNode.removeAllEventListeners();
            right.parent = node;

            node.left = left;
            node.right = right;

            node.children = [left, right];
        }

        this.updateTree();
    }

    updateTree(){
        const root = d3.hierarchy(this.root);
        const tree = d3.tree().nodeSize([100, 100]).separation(function(){return 1});

        tree(root);
        let left = root;
        let right = root;

        root.eachBefore(node => {
            if (node.x < left.x) left = node;
            if (node.x > right.x) right = node;
        });

        this.line.graphics.clear();
        this.line.graphics.setStrokeStyle(4).beginStroke("black");

        root.each(node => {
            node.data.set(node.x + this.stageWidth/2, node.y + 200);
            node.data.depth = node.depth;
            node.data.textNode.text = (node.data.value)?"?":"";
            if (!(node.data.value)){
                node.data.changeColour("lightgray");
            } else {
                node.data.changeColour(DEFAULT_COLOUR)
            }
        });

        root.each(node => {
            if (node.data.children){
                node.data.children.forEach((e) => {
                    this.drawLine(node.data, e)
                });
            }
        });

        this.stage.update();
    }
    
    drawLine(source, target){
        const angleA = Math.atan2(target.y - source.y, target.x - source.x);
        const angleB = Math.atan2(source.y - target.y, source.x - target.x);

        this.line.graphics.moveTo(
            source.x + this.circleSize*Math.cos(angleA), 
            source.y + this.circleSize*Math.sin(angleA)
        )
        this.line.graphics.lineTo(
            target.x + this.circleSize*Math.cos(angleB), 
            target.y + this.circleSize*Math.sin(angleB)
        )    
    }

    correct(){
        this.promptText.color = CORRECT_COLOUR;
        this.errorCount = 0;
        this.toggleHint(false);
        this.promptText.text = "Correct";

        this.stage.update();
    }

    incorrect(){
        this.promptText.text = "Try Again";
        this.promptText.color = HIGHLIGHT_COLOUR;
    
        if (++this.errorCount == this.hintCount){
            this.toggleHint(true);
        }

        this.stage.update();
    }

    toggleButtons(on){
        if (on){
            if (this.values.size < 17){
                this.insertButton = new Button(
                    (this.stageWidth - 200)/2 - 250, 20, 200, 100, this.stage, "Insert"
                );
        
                this.insertButton.shapeNode.addEventListener("click", () => {
                    this.toggleButtons(false);
                    this.currentDrill = "insert";
                    this.promptText.text = "Find where the node should be inserted";
                    this.promptText.color = "black";
                    this.startDrill();
                });
        
            }

            if (this.values.size > 0){
                this.searchButton = new Button(
                    (this.stageWidth - 200)/2, 20, 200, 100, this.stage, "Search"
                );
    
                this.searchButton.shapeNode.addEventListener("click", () => {
                    this.toggleButtons(false);
                    this.currentDrill = "search";
                    this.promptText.text = "Find the node";
                    this.promptText.color = "black";
                    this.startDrill();
                });
        
                this.deleteButton = new Button(
                    (this.stageWidth - 200)/2 + 250, 20, 200, 100, this.stage, "Remove"
                );
    
                this.deleteButton.shapeNode.addEventListener("click", () => {
                    this.toggleButtons(false);
                    this.currentDrill = "delete";
                    this.promptText.text = "Find the node to delete";
                    this.promptText.color = "black";
                    this.startDrill();
                });
            }
        } else {
            this.insertButton.clear();
            this.searchButton.clear();
            this.deleteButton.clear();
        }
    }

    toggleHint(on){
        if (on){
            this.hintButton = new Button(
                this.stageWidth - 500, 20, 300, 100, this.stage, "Hint"
            );
            this.hintButton.shapeNode.addEventListener("click", 
                () => this.giveHint()
            );
        } else {
            if (this.hint) this.hint.changeColour(DEFAULT_COLOUR);
            this.hint = null;
            // setCircleColour(this.root.shapeNode, DEFAULT_COLOUR);
            if (this.hintButton) this.hintButton.clear();
            this.hintButton = null;
        }
    }

    giveHint(){
        if (this.hint){
            this.hint.changeColour(DEFAULT_COLOUR);
        }

        this.hint = this.currentNode;
        this.hint.changeColour(HINT_COLOUR);
    }
    
}