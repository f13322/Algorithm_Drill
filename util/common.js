const HIGHLIGHT_COLOUR = "#ff5555";
const DEFAULT_COLOUR = "#55ddff";
const CORRECT_COLOUR = "#8fd102";
const PARTIAL_COLOUR = "#34ffcd";
const HINT_COLOUR = "#FAEF59";
const BUTTON_COLOUR = "#D3D3D3";


class InstructionIcon{
    constructor(stage){
        this.stage = stage
        this.container = new createjs.Container();
        this.container.x = stage.width- 40;
        this.container.y = 40;

        this.shape = new createjs.Shape();
        this.shape.graphics.setStrokeStyle(6)
                           .beginStroke(BUTTON_COLOUR)
                           .beginFill("rgba(255,255,255,1)")
                           .drawCircle(0, 0, 20, 20);
        this.shape.x = 0;
        this.shape.y = 0;
        this.container.addChild(this.shape);

        this.text = new createjs.Text("", "bold 30px Arial", BUTTON_COLOUR).set({
            text: "i",
            textAlign:"center",
            textBaseline: "middle",
            x: 0,
            y: 2
        });
        this.container.addChild(this.text);

        this.container.addEventListener("click", () =>{showInstruction()})
        this.container.addEventListener("mouseover", () =>{
            this.shape.graphics.clear()
                               .setStrokeStyle(6)
                               .beginStroke(darkenColour(BUTTON_COLOUR))
                               .beginFill("rgba(255,255,255,1)")
                               .drawCircle(0, 0, 20, 20);
            this.text.color = darkenColour(BUTTON_COLOUR);
            this.stage.update();
        })
        this.container.addEventListener("mouseout", () =>{
            this.shape.graphics.clear()
                               .setStrokeStyle(6)
                               .beginStroke(BUTTON_COLOUR)
                               .beginFill("rgba(255,255,255,1)")
                               .drawCircle(0, 0, 20, 20);
            this.text.color = BUTTON_COLOUR;
            this.stage.update();
        })

        stage.addChild(this.container);
    }
}

class Rect{
    constructor(x, y, width, height, stage, text="", colour=DEFAULT_COLOUR){
        this.font = ["", "40px Arial", ""];
        this.container = new createjs.Container();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.colour = colour

        this.stage = stage;

        this.shapeNode = new createjs.Shape();
        this.shapeNode.baseColour = colour;
        this.shapeNode.width = width;
        this.shapeNode.height = height;
        this.shapeNode.selected = false;
        
        this.textNode = new createjs.Text(...this.font);
        this.container.addChild(this.shapeNode);
        this.container.addChild(this.textNode);
        
        this.textNode.set(
            {
                text: text,
                textAlign:"center",
                textBaseline: "middle",
                x: width/2,
                y: height/2,
            }
        )
        
        this.shapeNode.graphics.beginFill(colour)
        .drawRect(0, 0, width, height)
        .endFill();
        this.activate();
        
        this.container.x = x;
        this.container.y = y;
        this.container.shapeNode = this.shapeNode;
        this.container.textNode = this.textNode;
        this.stage.addChild(this.container);

        this.shapeNode.object = this;
        this.textNode.object = this;
        this.container.object = this;
    }

    changeColour(colour){
        this.colour = colour;
        this.shapeNode.baseColour = colour;
        this.shapeNode
            .graphics.clear()
                .beginFill(this.colour)
                .drawRect(0, 0, this.width, this.height)
                .endFill();
        this.stage.update();
    }

    activate(){
        this.shapeNode.addEventListener("mouseover", () => {
            setRectColour(this.shapeNode, HIGHLIGHT_COLOUR);
            this.stage.update();
        });
        
        this.shapeNode.addEventListener("mouseout", () => {
            if (!this.shapeNode.selected){
                setRectColour(this.shapeNode, this.shapeNode.baseColour);
                this.stage.update();
            }
        });
    }

    clear(){
        this.stage.removeChild(this.container);
    }

    move(x, y){
        this.container.x = this.container.x + x;
        this.container.y = this.container.y + y;
        this.x = this.x + x;
        this.y = this.y + y;
    }

    set(x, y){
        this.container.x = x;
        this.container.y = y;
        this.x = x;
        this.y = y;
    }
}

class Circle{
    constructor(x, y, radius, stage, text="", colour=DEFAULT_COLOUR){
        this.font = ["", "40px Arial", ""];
        this.container = new createjs.Container();
        this.radius = radius;
        this.x = x;
        this.y = y;
        this.width = radius;
        this.height = radius;
        this.colour = colour

        this.stage = stage;

        this.shapeNode = new createjs.Shape();
        this.shapeNode.baseColour = colour;
        this.shapeNode.width = radius;
        this.shapeNode.height = radius;
        this.shapeNode.selected = false;
        
        this.textNode = new createjs.Text(...this.font);
        this.container.addChild(this.shapeNode);
        this.container.addChild(this.textNode);
        
        this.textNode.set(
            {
                text: text,
                textAlign:"center",
                textBaseline: "middle",
                // x: radius/2,
                // y: radius/2,
            }
        )
        
        this.shapeNode.graphics.beginFill(colour)
        .drawCircle(0, 0, radius)
        .endFill();
        this.activate();
        
        this.container.x = x;
        this.container.y = y;
        this.container.shapeNode = this.shapeNode;
        this.container.textNode = this.textNode;
        this.stage.addChild(this.container);

        this.shapeNode.object = this;
        this.textNode.object = this;
        this.container.object = this;
    }

    changeColour(colour){
        this.colour = colour;
        this.shapeNode.baseColour = colour;
        this.shapeNode
            .graphics.clear()
                .beginFill(this.colour)
                .drawCircle(0, 0, this.radius)
                .endFill();
        this.stage.update();
    }

    activate(){
        this.shapeNode.addEventListener("mouseover", () => {
            setCircleColour(this.shapeNode, HIGHLIGHT_COLOUR);
            this.stage.update();
        });
        
        this.shapeNode.addEventListener("mouseout", () => {
            if (!this.shapeNode.selected){
                setCircleColour(this.shapeNode, this.shapeNode.baseColour);
                this.stage.update();
            }
        });
    }

    clear(){
        this.stage.removeChild(this.container);
    }

    move(x, y){
        this.container.x = this.container.x + x;
        this.container.y = this.container.y + y;
        this.x = this.x + x;
        this.y = this.y + y;
    }

    set(x, y){
        this.container.x = x;
        this.container.y = y;
        this.x = x;
        this.y = y;
    }
}

class Button extends Rect{
    constructor(x, y, width, height, stage, text="", colour=BUTTON_COLOUR){
        super(x, y, width, height, stage, text, colour)
        this.textNode.set(
            {
                text: text,
                textAlign:"center",
                textBaseline: "middle",
                x: 100,
                y: 50,
            }
        )
        this.shapeNode.addEventListener("mouseover", () =>{
            this.hoverOn();
        });

        this.shapeNode.addEventListener("mouseout", () =>{
            this.hoverOff();
        });
    }

    hoverOn(){
        setRectColour(this.shapeNode, darkenColour(this.shapeNode.baseColour));
        this.textNode.x = this.textNode.x - 1;
        this.textNode.y = this.textNode.y + 1;
        this.stage.update();
    }

    hoverOff(){
        setRectColour(this.shapeNode, this.shapeNode.baseColour);
        this.textNode.x = this.textNode.x + 1;
        this.textNode.y = this.textNode.y - 1;
        this.stage.update();
    }
}

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

function setRectColour(rect, colour){
    rect.graphics.clear()
                 .beginFill(colour)
                 .drawRect(0, 0, rect.width, rect.height)
                 .endFill();
}

function setCircleColour(circle, colour){
    circle.graphics.clear()
                 .beginFill(colour)
                 .drawCircle(0, 0, circle.radius)
                 .endFill();
}

function darkenColour(colour){
    var hexCode = parseInt(colour.replace(/^#/, ''), 16);
    hexCode = hexCode - parseInt("1A1A1A", 16);
    if (hexCode <= 0){
        return "#000000"
    }
    return "#" + hexCode.toString(16);
}

function drawArc(pointA, pointB, height=null, value="", reverse=false){
    const source = {x: pointA.x, y: pointA.y}
    const target = {x: pointB.x, y: pointB.y}
    const container = new createjs.Container();
    const shape = new createjs.Shape();
    const text = new createjs.Text("", "30px Arial", "");

    // Calculate the midpoint
    const midX = (source.x + target.x) / 2;
    const midY = (source.y + target.y) / 2;

    container.x = midX;
    container.y = midY;

    source.x = source.x - midX;
    source.y = source.y - midY;
    
    target.x = target.x - midX;
    target.y = target.y - midY;

    // Calculate the perpendicular offset for a flatter arc
    const deltaX = target.x - source.x;
    const deltaY = target.y - source.y;
    const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    var distance;
    if (height){
        const a1 = Math.atan2(deltaX/2, height);
        const a2 = Math.PI - (2 * a1);
        distance = (deltaX/2)/Math.tan(a2);
    } else {
        distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    }
    
    // Normalize the perpendicular direction
    const perpX = -(deltaY / length) * (reverse? -1:1);
    const perpY = deltaX / length * (reverse? -1:1);
    
    // Calculate the new center for a flatter arc
    const centerX = perpX * distance; // Adjust value for flatness
    const centerY = perpY * distance; // Adjust value for flatness


    // Calculate the radius
    const radius = Math.sqrt(Math.pow(source.x - centerX, 2) 
                   + Math.pow(source.y - centerY, 2));

    // Calculate the angles
    const startAngle = Math.atan2(source.y - centerY, source.x - centerX);
    const endAngle = Math.atan2(target.y - centerY, target.x - centerX);

    // Draw the arc
    shape.graphics.setStrokeStyle(4).beginStroke("black");
    shape.graphics.arc(centerX, centerY, radius, startAngle, endAngle, reverse);

    shape.graphics.beginFill("black");
    shape.graphics.drawPolyStar(target.x, target.y, 10, 3 , 0, 
                                endAngle*180/Math.PI- (reverse?90:-90));
    
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

function drawArrow(source, target, value="",){
    const container = new createjs.Container();
    const shape = new createjs.Shape();
    const text = new createjs.Text("", "30px Arial", "");
    shape.graphics.setStrokeStyle(4).beginStroke("black");

}

function swapRect(n1, n2){
    var temp = n1.parent.textNode.text;
    var tempColour = n1.baseColour;

    n1.parent.textNode.text = n2.parent.textNode.text;
    n2.parent.textNode.text = temp;

    n1.baseColour = n2.baseColour;
    n2.baseColour = tempColour;

    n1.selected = false;
    setRectColour(n1, n1.baseColour);
    
    n2.selected = false;
    setRectColour(n2, n2.baseColour);
}

function showInstruction(){
    var height = document.getElementById("canvasContainer").offsetHeight + "px";
    instructionContainer.style.height = height;
    instructionContainer.style.display = "flex";
}