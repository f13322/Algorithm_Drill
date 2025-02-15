export class BST{
    constructor(){
        // Set attributes
        this.stageWidth = 2000;
        this.stageHeight = 1600;
        this.maxNum = 17; // Max number of values in the bst at once
        this.initialNum = 5; // Number of values in a new bst
        this.description = 
            "- Insert/search/remove a value from the binary search tree by treversing through it.\n\n" + 
            "- Click on the current active node to compare against its value."

        this.circleSize = 40;   // Radius of circle

        this.hintCount = 3;     // Variable for hints
        this.errorCount = 0;
        
        this.root = null;
        this.currentDrill = null;   // Tracks what drill the user is doing currently
        this.currentNode = null;    // The node that the user should click on
        this.newNode = null;
        this.hintButton = null;
        
        // Initialise the stage
        this.stage = new createjs.Stage("canvas");
        this.stage.width = this.stageWidth;
        this.stage.height = this.stageHeight;
        this.stage.enableMouseOver();

        // Line for connesting nodes to its children
        this.line = new createjs.Shape();
        this.stage.addChildAt(this.line, 0);

        this.nodes = [];
        this.select = [];
        this.hint = null;
        this.values = new Set();

        // Start drill
        this.drawInitial();
        this.stage.update();
    }

    // Draw initial state of the drill
    drawInitial(){
        // Initialise root node
        const value = Math.floor(Math.random()*100) + 1;
        this.root = new Circle(
            0, 0, this.circleSize, this.stage, value
        ); 
        this.root.value = value;
        this.values.add(value);

        this.root.setFontSize(this.circleSize);
        this.root.shapeNode.removeAllEventListeners();

        // Add left and right children of root
        this.root.left = new Circle(0, 0, this.circleSize, this.stage);
        this.root.left.parent = this.root;
        this.root.right = new Circle(0, 0, this.circleSize, this.stage);
        this.root.right.parent = this.root;
        
        this.root.children = [
            this.root.left,
            this.root.right
        ]

        // Add more values to tree
        while (this.values.size < this.initialNum){
            const value = Math.floor(Math.random() * 100) + 1;
            let current = this.root;
            if (this.values.has(value)){
                continue;
            }
            while (current.value){
                if (value < current.value){
                    current = current.left;
                } else {
                    current = current.right;
                }
            }
            current.value = value;
            this.addNode(current);
            this.values.add(value);
        }

        // Deactivate childrens
        this.root.children.forEach((e) => {
            e.shapeNode.removeAllEventListeners();
            e.setFontSize(this.circleSize);
        });

        // Add prompt text
        this.promptText = new createjs.Text("", "bold 50px Arial", "").set({
            text: "",
            textAlign: "center",
            x: this.stageWidth/2 + 400,
            y: 180,
            lineWidth: 400
        });
        this.stage.addChild(this.promptText);

        // Show buttons for chosing drill
        this.toggleButtons(true);

        // Update coords for each node
        this.updateTree();  

        // Add instructions
        new InstructionIcon(this.stage);
    }

    // Drill for inserting value to bst
    insertDrill(event){
        if (this.newNode.value <  event.target.object.value){
            // The new value is smaller
            this.promptText.text = "Smaller";
            this.promptText.color = "black";

            // Set left child as current node
            this.currentNode = this.currentNode.left;
        } else if (this.newNode.value > event.target.object.value){
            // New value is larger
            this.promptText.text = "Larger";
            this.promptText.color = "black";

            // Set right child as curent node
            this.currentNode = this.currentNode.right;
        } else {    // Empty node reached
            // Add value to the empty node
            event.target.object.value = this.newNode.value;
            event.target.object.textNode.text = this.newNode.value;

            // Add value to set of values
            this.values.add(this.newNode.value);

            // Add empty left and right children to node
            this.addNode(event.target.object);

            this.endDrill();
            return;
        }
        
        // Deactivate current node and activate both children nodes
        event.target.object.shapeNode.removeAllEventListeners();
        event.target.object.children.forEach((e) => {
            e.shapeNode.addEventListener("click", (evt) => {
                this.click(evt);
            });
            e.activate();
        });
    }

    // Drill for deleting value from bst
    deleteDrill(event){
        if (this.newNode.target){   // If currently looking for replacement node
            const target = this.newNode.target; // Target is the node being removed

            if ((target.right.value) && (target.left.value)){   // If target had 2 children
                if (this.currentNode.left.value){   // Treverse down the left if possible
                    this.currentNode = this.currentNode.left;
                } else {
                    // Update value and text of target
                    target.textNode.text = this.currentNode.value;
                    target.value = this.currentNode.value;

                    // Delete current node and its empty left child
                    this.currentNode.left.clear();
                    this.currentNode.clear();

                    if (this.currentNode.parent == target){
                        // Attach children of current node to right of target
                        this.currentNode.parent.right = this.currentNode.right;
                        this.currentNode.parent.children[1] = this.currentNode.right;
                        this.currentNode.right.parent = this.currentNode.parent;
                    } else {
                        // Attach children of current node to left of its parent
                        this.currentNode.parent.left = this.currentNode.right;
                        this.currentNode.parent.children[0] = this.currentNode.right;
                        this.currentNode.right.parent = this.currentNode.parent;
                    }

                    // Update the tree and end the drill
                    this.updateTree();
                    this.endDrill();
                    return;
                }
            } else if (target == this.root){    // If the target is the root
                // Make current node the new root
                this.root = this.currentNode;

                // Clear the old root and its childrens
                target.clear();
                if (!(target.left.value)) target.left.clear();
                if (!(target.right.value)) target.right.clear();

                // Update the tree and end the drill
                this.updateTree();
                this.endDrill();
                return;
            } else if (target.parent.right == target){
                // Make the current node the right child of the target's parent
                target.parent.right = this.currentNode;
                target.parent.children[1] = this.currentNode;
                this.currentNode.parent =target.parent;
                
                // Clear the target and its childrens
                target.clear();
                if (!(target.left.value)) target.left.clear();
                if (!(target.right.value)) target.right.clear();

                // Update the tree and end the drill
                this.updateTree();
                this.endDrill();
                return;
            } else {
                // Make the current node the left child of the target's parent
                target.parent.left = this.currentNode;
                target.parent.children[0] = this.currentNode;
                this.currentNode.parent =target.parent;

                // Clear the target and its childrens
                target.clear();
                if (!(target.left.value)) target.left.clear();
                if (!(target.right.value)) target.right.clear();

                // Update the tree and end the drill
                this.updateTree();
                this.endDrill();
                return;
            }
        } else if (this.newNode.value <  event.target.object.value){
            // The value to be removed is smaller
            this.promptText.text = "Smaller";
            this.promptText.color = "black";
            this.currentNode = this.currentNode.left;   // Set left child as current node
        } else if (this.newNode.value > event.target.object.value){
            // The value to be removed is larger
            this.promptText.text = "Larger";
            this.promptText.color = "black";
            this.currentNode = this.currentNode.right;  // Set right child as current node
        } else {    // The value to be removed is found
            // Clear the text and remove value from the set
            event.target.object.textNode.text = "";
            this.values.delete(event.target.object.value);
            event.target.object.value = undefined;
            this.newNode.target = event.target.object;  // Record the node as target
            
            if (event.target.object.right.value){   
                // Set current node to right child if it exists
                this.currentNode = this.currentNode.right;
            }  else if (event.target.object.left.value){
                // Set current node to left child if it exists
                this.currentNode = this.currentNode.left;
            } else {
                // Delete the node and its children
                event.target.object.children.forEach((e) =>
                    e.clear()
                );
                event.target.object.children = undefined;

                // Update the tree and end the drill
                this.updateTree();
                event.target.object.shapeNode.removeAllEventListeners();
                this.endDrill();
                return;
            }

            // Update prompt
            this.promptText.text = "Find the replacement Node";
            this.newNode.textNode.text = this.newNode.value;
        }

        // Deactivate current node and activate both children nodes
        event.target.object.shapeNode.removeAllEventListeners();
        event.target.object.children.forEach((e) => {
            e.shapeNode.addEventListener("click", (evt) => this.click(evt));
            e.activate();
        });
    }

    // Drill for searching value from bst
    searchDrill(event){
        if (this.newNode.value <  event.target.object.value){
            // The target value is smaller than current node
            this.promptText.text = "Smaller";
            this.promptText.color = "black";

            // Set current node to left child
            this.currentNode = this.currentNode.left;
        } else if (this.newNode.value > event.target.object.value){
            // The target value is larger than current node
            this.promptText.text = "Larger";
            this.promptText.color = "black";

            // Set current node to right child
            this.currentNode = this.currentNode.right;
        } else {
            // Update prompt if the value is found or reached empty node
            this.promptText.color = "black";
            event.target.object.shapeNode.removeAllEventListeners();
            const prompt = (this.newNode.value == event.target.object.value)? 
                "Value found":"Value not in tree";
            this.endDrill();
            this.promptText.text = prompt;
            this.stage.update();
            return;
        }

        // Deactivate current node and activate both children nodes
        event.target.object.shapeNode.removeAllEventListeners();
        event.target.object.children.forEach((e) => {
            e.shapeNode.addEventListener("click", (evt) => this.click(evt));
            e.activate();
        });
    }

    // Handle the interaction when circle is clicked
    click(event){
        // Incase there is no active drills
        if ((this.currentDrill == null) || this.newNode == null){
            return
        }

        // The incorrect node is clicked
        if (event.target.object != this.currentNode){
            this.incorrect();
            return;
        }

        // Deactivate the other active nodes if it exists
        if (event.target.object != this.root){
            event.target.object.parent.children.forEach((e) => {
                e.shapeNode.removeAllEventListeners();
            });
        }
        
        // Reset circle's colour to its base colour
        setCircleColour(
            event.target.object.shapeNode, event.target.baseColour
        );

        // Call the corresponding drill
        if (this.currentDrill == "insert"){
            this.insertDrill(event);
        } else if (this.currentDrill == "delete"){
            this.deleteDrill(event);
        } else {
            this.searchDrill(event);
        }

        // Update hint if there is existing hint
        if (this.hint){
            this.giveHint();
        }

        this.stage.update();
    }


    // Start a drill based on user's choice
    startDrill(){
        // Hide all the hints
        this.toggleButtons(false);

        let n; // the probability that the new value is in the tree
        if (this.currentDrill == "insert"){ // Added value must be new
            n = 0;
        } else if (this.currentDrill == "delete"){  // Removed value must exist in set
            n = 1;
        } else {    // Search value has a 70% chance of being in the set already
            n = 0.7;
        }

        let value
        if (Math.random() < n){
            // Generate a value that exists in the set
            do {
                value = Math.floor(Math.random()*100) + 1;
            } while (!(this.values.has(value)));
        } else {
            // Generate a value that does not exists in the set
            do {
                value = Math.floor(Math.random()*100) + 1;
            } while (this.values.has(value));
        }

        // Draw new circle to contain the new value
        this.newNode = new Circle(
            this.stageWidth/2, 80, this.circleSize, this.stage, value
        );
        this.newNode.value = value;
        this.newNode.shapeNode.removeAllEventListeners();

        // Activate the root node
        this.root.activate();
        this.root.shapeNode.addEventListener("click", (evt) => this.click(evt));
        this.currentNode = this.root;

        this.stage.update();
    }

    // End of current drill
    endDrill(){
        this.currentNode = this.root;
        this.newNode.clear();
        this.newNode = null;
        this.toggleButtons(true);
        this.toggleHint(false);
        this.correct();
        this.stage.update();
    }

    // Add left and right children to node
    addNode(node){
        if (!(node.children)){
            // Draw left child
            const left = new Circle(0, 0, this.circleSize, this.stage);
            left.setFontSize(this.circleSize);
            left.shapeNode.removeAllEventListeners();
            left.parent = node;

            // Draw right child
            const right = new Circle(0, 0, this.circleSize, this.stage);
            right.setFontSize(this.circleSize);
            right.shapeNode.removeAllEventListeners();
            right.parent = node;

            // Add children to the node
            node.left = left;
            node.right = right;

            node.children = [left, right];
        }

        this.updateTree();
    }

    // Recalculate the node positions in the tree and draw them
    updateTree(){
        // Set root of tree as root of heirarchy
        const root = d3.hierarchy(this.root);

        // Generate tree using d3
        const tree = d3.tree().nodeSize([100, 100]).separation(function(){return 1});

        tree(root);
        let left = root;
        let right = root;

        root.eachBefore(node => {
            if (node.x < left.x) left = node;
            if (node.x > right.x) right = node;
        });

        // Remove the lines
        this.line.graphics.clear();
        this.line.graphics.setStrokeStyle(4).beginStroke("black");

        // Update each node
        root.each(node => {
            // Set node coord
            node.data.set(node.x + this.stageWidth/2, node.y + 200);
            node.data.depth = node.depth;

            // Update node colour and text
            node.data.textNode.text = (node.data.value)?"?":"";
            if (!(node.data.value)){
                node.data.changeColour("lightgray");
            } else {
                node.data.changeColour(DEFAULT_COLOUR)
            }
        });

        // Draw line between the nodes and its children
        root.each(node => {
            if (node.data.children){
                node.data.children.forEach((e) => {
                    this.drawLine(node.data, e)
                });
            }
        });

        this.stage.update();
    }
    
    // Draw line from source to target
    drawLine(source, target){
        // Calculate angle of the nodes relative to eachother 
        const angleA = Math.atan2(target.y - source.y, target.x - source.x);
        const angleB = Math.atan2(source.y - target.y, source.x - target.x);

        // Move line to edge of source node in direction of target node
        this.line.graphics.moveTo(
            source.x + this.circleSize*Math.cos(angleA), 
            source.y + this.circleSize*Math.sin(angleA)
        )

        // Draw line to edge of target node in direction of source node
        this.line.graphics.lineTo(
            target.x + this.circleSize*Math.cos(angleB), 
            target.y + this.circleSize*Math.sin(angleB)
        )    
    }

    // Handles hints and prompt when user made a correct move
    correct(){
        // Update prompt and clear hints
        this.promptText.color = CORRECT_COLOUR;
        this.errorCount = 0;
        this.toggleHint(false);
        this.promptText.text = "Correct";

        this.stage.update();
    }

    // Handles hints and prompt when user made an incorrect move
    incorrect(){
        // Update prompt and increment hints
        this.promptText.text = "Try Again";
        this.promptText.color = HIGHLIGHT_COLOUR;
    
        if (++this.errorCount == this.hintCount){
            this.toggleHint(true);
        }

        this.stage.update();
    }

    // Show/hide the buttons for the adding and removing drills
    toggleButtons(on){
        if (on){
            // Show button for inserting value if bst is not too large
            if (this.values.size < this.maxNum){
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

            // Show button for searching value and removing value if bst is not empty
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
            // Remove all buttons
            this.insertButton.clear();
            this.searchButton.clear();
            this.deleteButton.clear();
        }
    }

    // Toggle hint button on/off
    toggleHint(on){
        if (on){    // Show hint button
            this.hintButton = new Button(
                this.stageWidth - 500, 20, 300, 100, this.stage, "Hint"
            );
            this.hintButton.shapeNode.addEventListener("click", 
                () => this.giveHint()
            );
        } else {    // Remove hint button and all existing hints
            if (this.hint) this.hint.changeColour(DEFAULT_COLOUR);
            this.hint = null;
            if (this.hintButton) this.hintButton.clear();
            this.hintButton = null;
        }
    }

    // Give hint on what the next step should be
    giveHint(){
        // Reset previout hint if it exists
        if (this.hint){
            this.hint.changeColour(DEFAULT_COLOUR);
        }

        // Highlight current node as hint
        this.hint = this.currentNode;
        this.hint.changeColour(HINT_COLOUR);
    }
    
}