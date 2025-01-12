import { SelectionSortDrill } from "./drills/SelectionSort.js";
import { InsertionSortDrill } from "./drills/InsertionSort.js";
import { MergeDrill } from "./drills/Merge.js";
import { QuickSortDrill } from "./drills/QuickSort.js";
import { DFS } from "./drills/DFS.js"

const DRILL_NAMES = {
    "Selection Sort": "selection",
    "Insertion Sort": "insertion",
    "Merge": "merge",
    "Quick Sort": "quick",
    "Heap": "heap",
    "DFS": "dfs"
}

var drill;
var instructionContainer = document.getElementById("instructionContainer");
var instructions;


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
                const container = new createjs.Container();
                const text = new createjs.Text("", "30px Arial", "");
                text.set({
                    text: (((1<<i) + j) <= this.values.length)
                          ? "" + this.values[((1<<i) + j)-1] : "",
                    textAlign:"center",
                    textBaseline: "middle",
                    x: 0,
                    y: 0,
                })

                const circle = new createjs.Shape();
                circle.colour = "blue";
                circle.graphics.beginFill(DEFAULT_COLOUR)
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
            const line = new createjs.Shape();
            const startCoord = [this.nodes[i].x, this.nodes[i].y];
            const t1Coord = [this.nodes[i*2+1].x, this.nodes[i*2+1].y];
            const t2Coord = [this.nodes[i*2+2].x, this.nodes[i*2+2].y];

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
            const container = new createjs.Container();
            const rect = new createjs.Shape();
            const text = new createjs.Text("", "30px Arial", "");
    
            rect.graphics.beginFill(DEFAULT_COLOUR)
                         .drawRect(0, 0, 50, 50)
                         .endFill();
            rect.selected = false;
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
        var temp = t1.parent.children[1].text;
        var l1 = this.list[this.nodes.indexOf(t1.parent)];
        var l2 = this.list[this.nodes.indexOf(t2.parent)];
        
        // Update the text value of node and list
        t1.parent.children[1].text = t2.parent.children[1].text;
        l1.children[1].text = t2.parent.children[1].text;

        t2.parent.children[1].text = temp;
        l2.children[1].text = temp;

        // Reset selected node colour
        t1.selected = false;
        t1.graphics.clear()
                   .beginFill(DEFAULT_COLOUR)
                   .drawCircle(0, 0, 40)
                   .endFill();
        l1.children[0].graphics.beginFill(DEFAULT_COLOUR)
                               .drawRect(0, 0, 50, 50)
                               .endFill();
        
        t2.selected = false;
        t2.graphics.clear()
                   .beginFill(DEFAULT_COLOUR)
                   .drawCircle(0, 0, 40)
                   .endFill();
        l2.children[0].graphics.beginFill(DEFAULT_COLOUR)
                               .drawRect(0, 0, 50, 50)
                               .endFill();
    }

    click(event){
        if (!event.target.selected){
            // Select node
            event.target.selected = true;
            event.target.graphics.beginFill(HIGHLIGHT_COLOUR)
                                 .drawCircle(0, 0, 40, 40)
                                 .endFill();

            this.list[
                this.nodes.indexOf(event.target.parent)
            ].children[0].graphics.beginFill(HIGHLIGHT_COLOUR)
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
            event.target.selected = false;
            event.target.graphics.beginFill(DEFAULT_COLOUR)
                                 .drawCircle(0, 0, 40, 40)
                                 .endFill();
            this.list[
                this.nodes.indexOf(event.target.parent)
            ].children[0].graphics.beginFill(DEFAULT_COLOUR)
                                  .drawRect(0, 0, 50, 50)
                                  .endFill();
            this.select.pop();
        }
        this.stage.update();
    }
}

const DRILL_LIST = {
    "selection": SelectionSortDrill,
    "insertion": InsertionSortDrill,
    "merge": MergeDrill,
    "heap":heapDrill,
    "dfs": DFS,
    "quick": QuickSortDrill
}   

window.changeAlg = function changeAlg(){
    const selected = document.getElementById("selection");

    if (selected.value in DRILL_LIST){
        if (drill){
            drill.stage.removeAllChildren();
            drill.stage.update();
        }
        drill = new (DRILL_LIST[selected.value])();
        instructions.innerText = drill.description;
        instructionContainer.style.display = "none";
        const canvas = document.getElementById("canvas");
        canvas.height = drill.stageHeight;
        canvas.width = drill.stageWidth;
        drill.stage.update();
    } else {
        console.error("Invalid Selected Value");
    }
}

$(function(){
    const selected = document.getElementById("selection");
    const value = new URLSearchParams(window.location.search).get("selected")
    const canvas = document.getElementById("canvas");
    const close = document.getElementById("x");
    const height = document.getElementById("canvasContainer").offsetHeight + "px";

    for (const [key, value] of Object.entries(DRILL_NAMES)) {
        selected.options[selected.options.length] = new Option(key, value);
      }

    instructionContainer = document.getElementById("instructionContainer");
    instructions = document.getElementById("instructions");

    instructionContainer.style.height = height;
    close.addEventListener("click", () => {
        instructionContainer.style.display = "none";
    });
    
    canvas.getContext("2d", {willReadFrequently: true});
    
    for (let i = 0; i < selected.options.length; i++){
        if (selected.options[i].value == value){
            selected.selectedIndex = i;
            selected.onchange();
            break;
        }
    }
    window.onresize = (function(){
        var height = document.getElementById("canvasContainer").offsetHeight + "px";
        instructionContainer.style.height = height;
    })
})