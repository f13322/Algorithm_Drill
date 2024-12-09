let numValues = 8
let container = document.getElementById("container");
let steps = []
let rows =[]
let checkButton = document.createElement("div");
checkButton.id = "checkButton";
checkButton.value = 0;
checkButton.innerText = "check";
checkButton.addEventListener("click", () => check())

function selectionSortAlg(list){
    steps = [];
    steps.push(list.slice());

    for (let i = numValues - 1; i >  0; i--){
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
    console.log(steps);

    setup()
}

function setup(){
    rows = []
    for (let i = 0; i < numValues; i++){
        let row = document.createElement("div");
        row.classList.add("sort")
        row.value = i;
        row.style.visibility = "hidden";
        rows.push(row);
        container.appendChild(row);
    }

    for (let i = 0; i < numValues; i++){
        for (let j = 0; j < numValues; j++){
            let cell = document.createElement("div");
            rows[i].appendChild(cell);
            cell.innerText = steps[i][j];
        }
    }

    $(".sort div").draggable({
        revert: true,
        containment: "parent"
    });

    $(".sort div").droppable({
        drop: function( event, ui ) {
            let target = event.target;
            let origin = ui.draggable[0];
            let temp = target.innerText;
            target.innerText = origin.innerText;
            origin.innerText = temp;
        }
    });

    rows[0].style.visibility = "visible";
    rows[0].appendChild(checkButton);
}

function check(){
    console.log(checkButton.value);
}


let a = randomList(numValues);
console.log(a);
selectionSortAlg(a);
