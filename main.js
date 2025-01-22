import { SelectionSortDrill } from "./drills/SelectionSort.js";
import { InsertionSortDrill } from "./drills/InsertionSort.js";
import { MergeDrill } from "./drills/Merge.js";
import { QuickSortDrill } from "./drills/QuickSort.js";
import { DFS } from "./drills/DFS.js"
import { heapDrill } from "./drills/Heap.js";
import { BST } from "./drills/BST.js";

var drill;
var instructionContainer = document.getElementById("instructionContainer");
var instructions;

const DRILL_NAMES = {
    "Selection Sort": "selection",
    "Insertion Sort": "insertion",
    "Merge": "merge",
    "Quick Sort": "quick",
    "Heap": "heap",
    "Binary Search Tree": "bst",
    "DFS": "dfs",
}

const DRILL_LIST = {
    "selection": SelectionSortDrill,
    "insertion": InsertionSortDrill,
    "merge": MergeDrill,
    "heap":heapDrill,
    "quick": QuickSortDrill,
    "bst": BST,
    "dfs": DFS,
}   

window.changeAlg = function changeAlg(){
    const value = new URLSearchParams(window.location.search).get("selected")
    const selected = document.getElementById("selection");
    
    if (selected.value in DRILL_LIST && value != selected.value){
        window.location.replace(
            window.location.origin + "\\index.html?selected=" + selected.value
        );
    } else {
        window.location.replace(window.location.origin + "\\index.html");
    }
}

$(function(){
    const selected = document.getElementById("selection");
    const canvas = document.getElementById("canvas");
    const close = document.getElementById("x");
    const height = document.getElementById("canvasContainer").offsetHeight + "px";
    const value = new URLSearchParams(window.location.search).get("selected")

    
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
            break;
        }
    }

    if (selected.value in DRILL_LIST){
        drill = new (DRILL_LIST[selected.value])();
        instructions.innerText = drill.description;
        instructionContainer.style.display = "none";
        canvas.height = drill.stageHeight;
        canvas.width = drill.stageWidth;
        drill.stage.update();
    }

    window.onresize = (function(){
        var height = document.getElementById("canvasContainer").offsetHeight + "px";
        instructionContainer.style.height = height;
    })
})