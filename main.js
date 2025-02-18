// Import all the drills
import { SelectionSortDrill } from "./drills/SelectionSort.js";
import { InsertionSortDrill } from "./drills/InsertionSort.js";
import { MergeDrill } from "./drills/Merge.js";
import { QuickSortDrill } from "./drills/QuickSort.js";
import { heapDrill } from "./drills/Heap.js";
import { BST } from "./drills/BST.js";
import { DFS } from "./drills/DFS.js"
import { BFS } from "./drills/BFS.js";

// Initiate drill, instruction, and get instruction container
var drill;
var instructionContainer = document.getElementById("instructionContainer");
var instructions;

// Maps displayed drill names to values
const DRILL_NAMES = {
    "Selection Sort": "selection",
    "Insertion Sort": "insertion",
    "Merge": "merge",
    "Quick Sort": "quick",
    "Heap": "heap",
    "Binary Search Tree": "bst",
    "DFS": "dfs",
    "BFS": "bfs",
}

// Maps drill values to objects
const DRILL_LIST = {
    "selection": SelectionSortDrill,
    "insertion": InsertionSortDrill,
    "merge": MergeDrill,
    "heap":heapDrill,
    "quick": QuickSortDrill,
    "bst": BST,
    "dfs": DFS,
    "bfs": BFS
}   

// Go to new drill when selected value changes
window.changeAlg = function changeAlg(){
    // Get url parameter
    const value = new URLSearchParams(window.location.search).get("selected")

    // Get selection element
    const selected = document.getElementById("selection");

    // Update Url and redirect
    var url = window.location.href;
    if(url.indexOf("?") > 0) {
        url = url.substring(0, url.indexOf("?"));
    } ;

    if (selected.value in DRILL_LIST && value != selected.value){    
        url += ("?selected=" + selected.value);
    } 
    window.location.replace(url);
}

// Initial function when page loads
$(function(){
    // Get elements and url parameters
    const selected = document.getElementById("selection");
    const canvas = document.getElementById("canvas");
    const close = document.getElementById("x");
    const height = document.getElementById("canvasContainer").offsetHeight + "px";
    const value = new URLSearchParams(window.location.search).get("selected")

    // Set selection element options and its value based on DRILL_NAMES
    for (const [key, value] of Object.entries(DRILL_NAMES)) {
        selected.options[selected.options.length] = new Option(key, value);
    }
    
    // Get elements for insturctions
    instructionContainer = document.getElementById("instructionContainer");
    instructions = document.getElementById("instructions");

    // Update size of instruction container to be same as canvas
    instructionContainer.style.height = height;

    // Add functionality for closing the instruction
    close.addEventListener("click", () => {
        instructionContainer.style.display = "none";
    });
    
    // canvas.getContext("2d", {willReadFrequently: true}); // Failed attempt to get rid of warning, does nothing
    
    // Update selection element to the drill selected
    for (let i = 0; i < selected.options.length; i++){
        if (selected.options[i].value == value){
            selected.selectedIndex = i;
            break;
        }
    }

    // Create drill if one is selected
    if (selected.value in DRILL_LIST){
        // Initiate drill
        drill = new (DRILL_LIST[selected.value])();

        // Update instructions
        instructions.innerText = drill.description; 
        instructionContainer.style.display = "none";

        // Update canvas size to fit the drill
        canvas.height = drill.stageHeight;
        canvas.width = drill.stageWidth;

        // Update stage
        drill.stage.update();
    }

    // Resize instruction container when user resize window
    window.onresize = (function(){
        var height = document.getElementById("canvasContainer").offsetHeight + "px";
        instructionContainer.style.height = height;
    })
})