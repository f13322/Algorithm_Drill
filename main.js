import { SelectionSortDrill } from "./drills/SelectionSort.js";
import { InsertionSortDrill } from "./drills/InsertionSort.js";
import { MergeDrill } from "./drills/Merge.js";
import { QuickSortDrill } from "./drills/QuickSort.js";
import { DFS } from "./drills/DFS.js"
import { heapDrill } from "./drills/Heap.js";

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