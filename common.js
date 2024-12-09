let drillList = []

let drill;


function randomList(size){
    // Generate list of distinct values between 1 and 100 inclusive.
    if (size > 100){
        console.error("Error: Random List size should be less than 100")
        return null;
    }
    
    var list = new Set();
    while (list.size < size){
        list.add(Math.floor(Math.random() * 100) + 1);
    }

    list = Array.from(list);
    return list;
}

function changeAlg(){
    let selected = document.getElementById("selection");

    if (drill){
        drill.stage.removeAllChildren();
        drill.stage.update();
    }

    switch (selected.value){
        case "sort": 
            drill = new SelectionSortDrill();
            break;
        case "tree":
            drill = new heapDrill();
            break;
        case "graph":
            drill = new DFS();
            break;
    }
    
    drill.stage.update();
}

class SelectionSortDrill{
    constructor(){
        this.numValues = 8
        this.stage = new createjs.Stage("canvas");
        this.stage.enableMouseOver(10);
        this.steps = this.selectionSortAlg(randomList(this.numValues));
        this.select = [];
        this.containers = [];

        this.drawInitial();
        this.stage.update();
    }

    reset(){
        this.stage = new createjs.Stage("canvas");
        this.steps = this.selectionSortAlg(randomList(this.numValues));
        this.select = [];

        this.drawInitial();
        this.stage.update();
    }

    selectionSortAlg(list){
        let steps = [];
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
        let temp = t1.parent.children[1].text;

        t1.parent.children[1].text = t2.parent.children[1].text;
        t2.parent.children[1].text = temp;

        t1.colour = "blue";
        t1.graphics.clear()
                   .beginFill("lightBlue")
                   .drawRect(0, 0, 50, 50)
                   .endFill();
        
        t2.colour = "blue";
        t2.graphics.clear()
                   .beginFill("lightBlue")
                   .drawRect(0, 0, 50, 50)
                   .endFill();
    }

    drawInitial(){
        for (let i = 0; i < this.numValues; i++){
            let container = new createjs.Container();
            let rect = new createjs.Shape();
            let text = new createjs.Text("", "30px Arial", "");
    
            rect.graphics.beginFill("lightBlue")
                         .drawRect(0, 0, 50, 50)
                         .endFill();
            rect.colour = "blue";
            container.y = 50; 
            container.x = i*50 + 600;
    
            text.set({
                text: "" + this.steps[0][i],
                textAlign:"center",
                textBaseline: "middle",
                x: 25,
                y: 25,
            })
    
            container.addChild(rect);
            container.addChild(text);
            this.stage.addChild(container)
            
            rect.on("click", function(evt){
                drill.click(evt);
            });

            rect.addEventListener("mouseover", () => {
                rect.graphics.clear()
                             .beginFill("red")
                             .drawRect(0, 0, 50, 50); 
                this.stage.update();
            });
            
            rect.addEventListener("mouseout", () => {
                if (rect.colour != "red"){
                    rect.graphics.clear()
                                .beginFill("lightBlue")
                                .drawRect(0, 0, 50, 50);
                    this.stage.update();
                }
            });
        }
        this.stage.update();
    }

    click(event){
        if (event.target.colour == "blue"){
            event.target.colour = "red";
            event.target.graphics.beginFill("red")
                                 .drawRect(0, 0, 50, 50)
                                 .endFill();
            if (this.select.length == 1){
                this.swap(event.target, this.select[0]);
                this.select.pop();
            }
            else {
                this.select.push(event.target);
            }
        } else {
            event.target.colour = "blue";
            event.target.graphics.beginFill("lightBlue")
                                 .drawRect(0, 0, 50, 50)
                                 .endFill();
            this.select.pop();
        }
        this.stage.update();
    }

    check(event){
        for (let i = 0; i < this.numValues; i++)
        this.steps[event.target.counter][i];
    }
}

class heapDrill{
    constructor(){
        this.height = 4;
        this.stage = new createjs.Stage("canvas");
        this.values = randomList(8);

        this.nodes = [];
        this.lines = [];
        this.select = [];
        this.list =  [];

        this.drawInitial();
        this.stage.update();
    }

    drawInitial(){
        // Draw the binary tree
        for (let i = 0; i < this.height; i++){
            for (let j = 0; j < 1<<i; j++){
                let container = new createjs.Container();
                let text = new createjs.Text("", "30px Arial", "");
                text.set({
                    text: (((1<<i) + j) <= this.values.length)
                          ? "" + this.values[((1<<i) + j)-1] : "",
                    textAlign:"center",
                    textBaseline: "middle",
                    x: 0,
                    y: 0,
                })

                let circle = new createjs.Shape();
                circle.colour = "blue";
                circle.graphics.beginFill("lightBlue")
                               .drawCircle(0, 0, 40)
                               .endFill();
                circle.on("click", function(evt){
                    drill.click(evt);
                });

                container.x = 160*j*(1<<(this.height-1-i)) 
                              + ((1<<(this.height-1-i)) - 1) * 80 + 250;
                container.y = 100*i + 100;

                container.addChild(circle);
                container.addChild(text);
                this.stage.addChild(container);
                this.nodes.push(container)
            }
        }

        for (let i = 0; i < Math.floor(this.nodes.length/2); i++){
            let line = new createjs.Shape();
            let startCoord = [this.nodes[i].x, this.nodes[i].y];
            let t1Coord = [this.nodes[i*2+1].x, this.nodes[i*2+1].y];
            let t2Coord = [this.nodes[i*2+2].x, this.nodes[i*2+2].y];

            line.graphics
                .setStrokeStyle(4)
                .beginStroke("black")
                .moveTo(...startCoord)
                .lineTo(...t1Coord)
                .endStroke();
            
            line.graphics
                .setStrokeStyle(4)
                .beginStroke("black")
                .moveTo(...startCoord)
                .lineTo(...t2Coord)
                .endStroke();
                
            this.stage.addChildAt(line, 0);
        }

        for (let i = 0; i < this.nodes.length; i++){
            let container = new createjs.Container();
            let rect = new createjs.Shape();
            let text = new createjs.Text("", "30px Arial", "");
    
            rect.graphics.beginFill("lightBlue")
                         .drawRect(0, 0, 50, 50)
                         .endFill();
            rect.colour = "blue";
            container.y = 500; 
            container.x = i*50 + 200;
    
            text.set({
                text: "" + this.nodes[i].children[1].text,
                textAlign:"center",
                textBaseline: "middle",
                x: 25,
                y: 25,
            })
    
            container.addChild(rect);
            container.addChild(text);
            this.stage.addChild(container)
            this.list.push(container);
        }
    }

    swap(t1, t2){
        let temp = t1.parent.children[1].text;
        let l1 = this.list[this.nodes.indexOf(t1.parent)];
        let l2 = this.list[this.nodes.indexOf(t2.parent)];
        
        // Update the text value of node and list
        t1.parent.children[1].text = t2.parent.children[1].text;
        l1.children[1].text = t2.parent.children[1].text;

        t2.parent.children[1].text = temp;
        l2.children[1].text = temp;

        // Reset selected node colour
        t1.colour = "blue";
        t1.graphics.clear()
                   .beginFill("lightBlue")
                   .drawCircle(0, 0, 40)
                   .endFill();
        l1.children[0].graphics.beginFill("lightBlue")
                               .drawRect(0, 0, 50, 50)
                               .endFill();
        
        t2.colour = "blue";
        t2.graphics.clear()
                   .beginFill("lightBlue")
                   .drawCircle(0, 0, 40)
                   .endFill();
        l2.children[0].graphics.beginFill("lightBlue")
                               .drawRect(0, 0, 50, 50)
                               .endFill();
    }

    click(event){
        if (event.target.colour == "blue"){
            // Select node
            event.target.colour = "red";
            event.target.graphics.beginFill("red")
                                 .drawCircle(0, 0, 40, 40)
                                 .endFill();

            this.list[
                this.nodes.indexOf(event.target.parent)
            ].children[0].graphics.beginFill("red")
                                  .drawRect(0, 0, 50, 50)
                                  .endFill();

            // Swap node if there is another selected node
            if (this.select.length == 1){
                this.swap(event.target, this.select[0]);
                this.select.pop();
            }
            else {
                this.select.push(event.target);
            }
        } else {
            // Deselect node
            event.target.colour = "blue";
            event.target.graphics.beginFill("lightBlue")
                                 .drawCircle(0, 0, 40, 40)
                                 .endFill();
            this.list[
                this.nodes.indexOf(event.target.parent)
            ].children[0].graphics.beginFill("lightBlue")
                                  .drawRect(0, 0, 50, 50)
                                  .endFill();
            this.select.pop();
        }
        this.stage.update();
    }
}

class DFS{
    constructor(){
        this.stage = new createjs.Stage("canvas");
        this.nodePositions = [
            { x: 800, y: 50, value: 0, children: [1, 2]},
            { x: 450, y: 200, value: 1, children: [0, 3, 4, 6]},
            { x: 1150, y: 200, value: 2, children: [0, 4, 5, 7]},
            { x: 100, y: 350, value: 3, children: [1, 6]},
            { x: 800, y: 350, value: 4, children: [1, 2, 6, 7]},
            { x: 1500, y: 350, value: 5, children: [2, 7]},
            { x: 450, y: 500, value: 6, children: [1, 3, 4, 8]},
            { x: 1150, y: 500, value: 7, children: [2, 4, 5, 8]},
            { x: 800, y: 650, value: 8, children: [6, 7]}
        ]
        this.nodes = [];
        

        this.drawInitial();
    }

    drawInitial(){
        let temp = [Math.floor(Math.random()*9)];
        let newNum = 0;
        while (this.nodes.length < 5){
            newNum = Math.floor(Math.random()*temp.length);
            let val = temp[newNum];
            this.nodes.push(val);
            temp.splice(newNum, 1);
            this.nodePositions[val].children.forEach((e) =>{
                if (!this.nodes.includes(e)){
                    temp.push(e);
                };
            })
        }
        
        this.nodes.forEach((e) =>{
            let pos = this.nodePositions[e];
            const node = new createjs.Shape();
            node.colour = "blue";
            node.graphics.beginFill("lightBlue")
            .drawCircle(0, 0, 40)
            .endFill();
            
            node.x = pos.x;
            node.y = pos.y;
            this.stage.addChild(node);
        })
        
        this.nodes.forEach((e) =>{
            let pos = this.nodePositions[e];
            let connected = false;
            while (!connected){
                pos.children.forEach((child) => {
                    if ((this.nodes.includes(child)) && (Math.random() > 0.5)){
                        this.stage.addChild(drawArrow(
                            pos, this.nodePositions[child], 
                            Math.floor(Math.random() * 10) + 1 + ""));
                        connected = true;
                    }})
                }
            })
        

        this.stage.update();
    }
}

function drawArrow(A, B, value="", reverse=false){
    const angleA = Math.atan2(B.y - A.y, B.x - A.x) - 10*Math.PI/180;
    const angleB = Math.atan2(A.y - B.y, A.x - B.x) + 5*Math.PI/180;

    const pointA = {
        x: Math.cos(angleA) * 50 + A.x, // 10 + 40(size of circle) = 50
        y:Math.sin(angleA) * 50 + A.y
    };
    const pointB = {
        x: Math.cos(angleB) * 60 + B.x, // 20 + 40(size of circle) = 50
        y:Math.sin(angleB) * 60 + B.y
    };

    const container = new createjs.Container();
    const shape = new createjs.Shape();
    const text = new createjs.Text("", "30px Arial", "");

    // Calculate the midpoint
    const midX = (pointA.x + pointB.x) / 2;
    const midY = (pointA.y + pointB.y) / 2;

    container.x = midX;
    container.y = midY;

    pointA.x = pointA.x - midX;
    pointA.y = pointA.y - midY;
    
    pointB.x = pointB.x - midX;
    pointB.y = pointB.y - midY;

    // Calculate the perpendicular offset for a flatter arc
    const deltaX = pointB.x - pointA.x;
    const deltaY = pointB.y - pointA.y;
    const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Normalize the perpendicular direction
    const perpX = -(deltaY / length) * (reverse? -1:1);
    const perpY = deltaX / length * (reverse? -1:1);

    // Calculate the new center for a flatter arc
    const centerX = perpX * length; // Adjust value for flatness
    const centerY = perpY * length; // Adjust value for flatness

    // Calculate the radius
    const radius = Math.sqrt(Math.pow(pointA.x - centerX, 2) 
                   + Math.pow(pointA.y - centerY, 2));

    // Calculate the angles
    const startAngle = Math.atan2(pointA.y - centerY, pointA.x - centerX);
    const endAngle = Math.atan2(pointB.y - centerY, pointB.x - centerX);

    // Draw the arc
    shape.graphics.setStrokeStyle(4).beginStroke("black");
    shape.graphics.arc(centerX, centerY, radius, startAngle, endAngle, reverse);

    shape.graphics.beginFill("black");
    shape.graphics.drawPolyStar(pointB.x, pointB.y, 10, 3 , 0, 
                                endAngle*180/Math.PI- (reverse?90:-90));
    shape.graphics.moveTo(0, 0);
    
    text.set({
        text: "" + value,
        textAlign:"center",
        textBaseline: "middle",
        x: -perpX*radius + centerX + (reverse? 20:-20)*perpX, 
        y: -perpY*radius + centerY + (reverse? 20:-20)*perpY
    });
    
    // Add the shape to the stage
    container.addChild(shape);
    container.addChild(text);
    return(container);
}