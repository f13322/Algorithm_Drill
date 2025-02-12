// Define colours used
const HIGHLIGHT_COLOUR = "#ff5555";
const DEFAULT_COLOUR = "#55ddff";
const CORRECT_COLOUR = "#8fd102";
const PARTIAL_COLOUR = "#34ffcd";
const HINT_COLOUR = "#FAEF59";
const BUTTON_COLOUR = "#D3D3D3";

// Draws the button for instructions on the canvas at the given location
class InstructionIcon{
    constructor(stage){
        // Set stage
        this.stage = stage

        // Initialise the container for the shape and text
        this.container = new createjs.Container();
        this.container.x = this.stage.width- 60;
        this.container.y = 60;
        
        // Initialise the circle for the icon and add to container
        this.shape = new createjs.Shape();
        this.shape.graphics.setStrokeStyle(8)
                           .beginStroke(BUTTON_COLOUR)
                           .beginFill("rgba(255,255,255,1)")
                           .drawCircle(0, 0, 30, 30);
        this.shape.x = 0;
        this.shape.y = 0;
        this.container.addChild(this.shape);

        // Initialise the "i" text in the circle and add to container
        this.text = new createjs.Text("", "bold 40px Arial", BUTTON_COLOUR).set({
            text: "i",
            textAlign:"center",
            textBaseline: "middle",
            x: 0,
            y: 2
        });
        this.container.addChild(this.text);

        // Show insturcions on click
        this.container.addEventListener("click", () =>{this.showInstruction()})

        // Change the colour of the icon on hover, and hover off
        this.container.addEventListener("mouseover", () =>{
            this.shape.graphics.clear()
                               .setStrokeStyle(8)
                               .beginStroke(darkenColour(BUTTON_COLOUR))
                               .beginFill("rgba(255,255,255,1)")
                               .drawCircle(0, 0, 30, 30);
            this.text.color = darkenColour(BUTTON_COLOUR);
            this.stage.update();
        })
        this.container.addEventListener("mouseout", () =>{
            this.shape.graphics.clear()
                               .setStrokeStyle(8)
                               .beginStroke(BUTTON_COLOUR)
                               .beginFill("rgba(255,255,255,1)")
                               .drawCircle(0, 0, 30, 30);
            this.text.color = BUTTON_COLOUR;
            this.stage.update();
        })

        // add container to object
        stage.addChild(this.container);
    }

    // Display the instruction
    showInstruction(){
        var height = document.getElementById("canvasContainer").offsetHeight + "px";
        instructionContainer.style.height = height;
        instructionContainer.style.display = "flex";
    }
}

// Creates a rectangle with the given attributes on the stage.
class Rect{
    constructor(x, y, width, height, stage, text="", colour=DEFAULT_COLOUR, fontSize=40){
        // Set attributes
        this.font = ["", fontSize + "px Arial", ""];
        this.x = x;     // The x and y coordinates of the top left of the rect
        this.y = y;
        this.width = width;
        this.height = height;
        this.colour = colour
        this.stage = stage;
        
        // Initialise container for holding shape and text
        this.container = new createjs.Container();
        this.container.x = x;
        this.container.y = y;
        this.container.object = this;
        this.stage.addChild(this.container);

        // Initialise the shape
        this.shapeNode = new createjs.Shape();
        this.shapeNode.baseColour = colour;
        this.shapeNode.width = width;
        this.shapeNode.height = height;
        this.shapeNode.selected = false;
        this.shapeNode.graphics.beginFill(colour)
                               .drawRect(0, 0, width, height)
                               .endFill();
        this.shapeNode.object = this;
        this.container.addChild(this.shapeNode);
        
        // Initialise the text
        this.textNode = new createjs.Text(...this.font);
        this.textNode.set(
            {
                text: text,
                textAlign:"center",
                textBaseline: "middle",
                x: width/2,
                y: height/2,
            }
        )
        this.textNode.object = this;
        this.container.addChild(this.textNode);

        // Activate hover
        this.activate();
    }

    // Change the colour of the shapeNode and update the default colour
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

    // Activaet hover functions
    activate(){
        this.shapeNode.addEventListener("mouseover", () => {
            setRectColour(this.shapeNode, HIGHLIGHT_COLOUR);
            this.stage.update();
            if (this.tap){
                this.shapeNode.dispatchEvent("mouseout");
                this.tap = false;
            }
        });
        
        this.shapeNode.addEventListener("mouseout", () => {
            if (!this.shapeNode.selected){
                setRectColour(this.shapeNode, this.shapeNode.baseColour);
                this.stage.update();
            }
            this.tap = false;
        });

        // Cancel the next hover function if the node is pressed on
        this.shapeNode.addEventListener("pressup", () => {
            this.tap = true;
        });
    }

    // Add a boarder for the shape with given colour
    drawBoarder(colour){
        this.shapeNode
            .graphics.clear()
            .setStrokeStyle(5)
            .beginStroke(colour)
            .beginFill(this.colour)
            .drawRect(0, 0, this.width, this.height)
            .endFill();
        this.stage.update();
    }

    // Remove this object from the stage
    clear(){
        this.stage.removeChild(this.container);
    }

    // Change the font size of the text
    setFontSize(size){
        this.textNode.set({font: size + "px Arial"});
    }

    // Move the shape by x pixels horizontally and y pixels vertically
    move(x, y){
        this.container.x = this.container.x + x;
        this.container.y = this.container.y + y;
        this.x = this.x + x;
        this.y = this.y + y;
    }

    // Move the shape to the given x and y coordinates
    set(x, y){
        this.container.x = x;
        this.container.y = y;
        this.x = x;
        this.y = y;
    }
}

// Creates a circle with the given attributes on the stage.
class Circle{
    constructor(x, y, radius, stage, text="", colour=DEFAULT_COLOUR){
        // Set attributes
        this.font = ["", "40px Arial", ""];
        this.radius = radius;
        this.x = x;     // The x and y coordinate of the center of the circle
        this.y = y;
        this.width = radius;
        this.height = radius;
        this.colour = colour
        this.stage = stage;
        
        // Initialise container for holding shape and text
        this.container = new createjs.Container();
        this.container.x = x;
        this.container.y = y;
        this.container.object = this;
        this.stage.addChild(this.container);

        // Initialise the shape
        this.shapeNode = new createjs.Shape();
        this.shapeNode.baseColour = colour;
        this.shapeNode.radius = radius;
        this.shapeNode.width = radius;
        this.shapeNode.height = radius;
        this.shapeNode.graphics.beginFill(colour)
                               .drawCircle(0, 0, radius)
                               .endFill();
        this.shapeNode.selected = false;
        this.shapeNode.object = this;
        this.container.addChild(this.shapeNode);
        
        // Initialise the text
        this.textNode = new createjs.Text(...this.font);
        this.textNode.set(
            {
                text: text,
                textAlign:"center",
                textBaseline: "middle",
                // x: radius/2,
                // y: radius/2,
            }
        )
        this.textNode.object = this;
        this.container.addChild(this.textNode);

        // Activate hover
        this.activate();
    }

    // Change the colour of the shapeNode and update the default colour
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

    // Add a boarder for the shape with given colour
    drawBoarder(colour){
        this.shapeNode
            .graphics.clear()
            .setStrokeStyle(5)
            .beginStroke(colour)
            .beginFill(this.colour)
            .drawCircle(0, 0, this.radius)
            .endFill();
        this.stage.update();
    }

    // Activate the hover functions
    activate(){
        this.shapeNode.addEventListener("mouseover", () => {
            setCircleColour(this.shapeNode, HIGHLIGHT_COLOUR);
            this.stage.update();
            if (this.tap){
                this.shapeNode.dispatchEvent("mouseout");
                this.tap = false;
            }
        });
        
        this.shapeNode.addEventListener("mouseout", () => {
            if (!this.shapeNode.selected){
                setCircleColour(this.shapeNode, this.shapeNode.baseColour);
                this.stage.update();
            }
            this.tap = false;
        });

        // Cancel the next hover function if the node is pressed on
        this.shapeNode.addEventListener("pressup", () => {
            this.tap = true;
        });


    }
    
    // Change the font size of the text
    setFontSize(size){
        this.textNode.set({font: size + "px Arial"});
    }

    // Remove this object from the stage
    clear(){
        this.stage.removeChild(this.container);
    }

    // Move the shape by x pixels horizontally and y pixels vertically
    move(x, y){
        this.container.x = this.container.x + x;
        this.container.y = this.container.y + y;
        this.x = this.x + x;
        this.y = this.y + y;
    }

    // Move the shape to the given x and y coordinates
    set(x, y){
        this.container.x = x;
        this.container.y = y;
        this.x = x;
        this.y = y;
    }
}

// Create a rectangular button with the given attributes on the stage
class Button extends Rect{
    constructor(x, y, width, height, stage, text="", colour=BUTTON_COLOUR){
        // Use constructor of Rect
        super(x, y, width, height, stage, text, colour)

        // Clear the event listeners from the rect consturctor to prevent overlap
        this.shapeNode.removeAllEventListeners();

        // Add event listeners for hover functions.
        this.shapeNode.addEventListener("mouseover", () =>{
            this.hoverOn();
            if (this.tap){
                this.shapeNode.dispatchEvent("mouseout");
                this.tap = false;
            }
        });

        this.shapeNode.addEventListener("mouseout", () =>{
            this.hoverOff();
            this.tap = false;
        });
        
        // Cancel the next hover function if the node is pressed on 
        this.shapeNode.addEventListener("pressup", () =>{
            this.tap = true;
        });
    }

    // Darken the button and shift the text slightly when hovered
    hoverOn(){
        setRectColour(this.shapeNode, darkenColour(this.shapeNode.baseColour));
        this.textNode.x = this.textNode.x - 1;
        this.textNode.y = this.textNode.y + 1;
        this.stage.update();
    }

    // Undo the hover changes when no longer hovered
    hoverOff(){
        setRectColour(this.shapeNode, this.shapeNode.baseColour);
        this.textNode.x = this.textNode.x + 1;
        this.textNode.y = this.textNode.y - 1;
        this.stage.update();
    }
}

// Generate list of distinct values between 1 and 100 inclusive.
function randomList(size){
    // Error if list size is greater than 100
    if (size > 100){
        console.error("Error: Random List size should be less than 100")
        return null;
    }
    
    // Add random values to set until there is enough values
    var list = new Set();
    while (list.size < size){
        list.add(Math.floor(Math.random() * 100) + 1);
    }

    // Convert from set to array and return
    list = Array.from(list);
    return list;
}

// Change the rect's colour without changing its default colour
function setRectColour(rect, colour){
    rect.graphics.clear()
                 .beginFill(colour)
                 .drawRect(0, 0, rect.width, rect.height)
                 .endFill();
}

// Change the circle's colour without changing its defauls colour
function setCircleColour(circle, colour){
    circle.graphics.clear()
                 .beginFill(colour)
                 .drawCircle(0, 0, circle.radius)
                 .endFill();
}

// Return a darker version of the colour given in hex.
function darkenColour(colour){
    var hexCode = parseInt(colour.replace(/^#/, ''), 16);
    hexCode = hexCode - parseInt("1A1A1A", 16);
    if (hexCode <= 0){
        return "#000000"
    }
    return "#" + hexCode.toString(16);
}

// Draw arc from pointA to pointB.
// If height is not given, the height of the arc will be porportional to distance.
// The arc is pointing clockwise, set reverse to false to point anti-clockwise
function drawArc(pointA, pointB, height=null, value="", reverse=false){
    // Initialise the container, shape and text
    const container = new createjs.Container();
    const shape = new createjs.Shape();
    const text = new createjs.Text("", "30px Arial", "");

    // Calculate the midpoint
    const midX = (pointA.x + pointB.x) / 2;
    const midY = (pointA.y + pointB.y) / 2;

    // Set the center of the container to the mid points
    container.x = midX;
    container.y = midY;

    // Set new x and y relative to the midpoint as new object to not alter the original
    const source = {x: pointA.x - midX, y: pointA.y - midY}
    const target = {x: pointB.x - midX, y: pointB.y - midY}

    // Calculate length between the points
    const deltaX = target.x - source.x;
    const deltaY = target.y - source.y;
    const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Set distance depending on whether height is specified
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
    
    // Calculate the new center for the arc
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
    shape.graphics.drawPolyStar(
        target.x, target.y, 10, 3 , 0, 
        endAngle*180/Math.PI- (reverse?90:-90)
    );
    
    // Set the text
    text.set({
        text: "" + value,
        textAlign:"center",
        textBaseline: "middle",
        x: -perpX*radius + centerX + (reverse? 20:-20)*perpX, 
        y: -perpY*radius + centerY + (reverse? 20:-20)*perpY
    });
    
    // Add the shape to the container
    container.addChild(shape);
    container.addChild(text);
    return(container);
}

// Swap the text and default colour of the two rectangle shapes
function swapRect(n1, n2){
    // Store the original text and default colour of n1
    var temp = n1.object.textNode.text;
    var tempColour = n1.baseColour;
    
    // Swap n1 and n2 text and default colour accrodingly
    n1.object.textNode.text = n2.object.textNode.text;
    n2.object.textNode.text = temp;

    n1.baseColour = n2.baseColour;
    n2.baseColour = tempColour;

    // Deselect both nodes and set them to their default colour
    n1.selected = false;
    setRectColour(n1, n1.baseColour);
    
    n2.selected = false;
    setRectColour(n2, n2.baseColour);
}

// Swap the text and default colour of the two circle shapes
function swapCircle(n1, n2){
    // Store the original text and default colour of n1
    var temp = n1.parent.textNode.text;
    var tempColour = n1.baseColour;

    // Swap n1 and n2 text and default colour accrodingly
    n1.parent.textNode.text = n2.parent.textNode.text;
    n2.parent.textNode.text = temp;

    n1.baseColour = n2.baseColour;
    n2.baseColour = tempColour;

    // Deselect both nodes and set them to their default colour
    n1.selected = false;
    setCircleColour(n1, n1.baseColour);
    
    n2.selected = false;
    setCircleColour(n2, n2.baseColour);
}