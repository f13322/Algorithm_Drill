export class DFS{
    constructor(){
        this.stageWidth = 1600;
        this.stageHeight = 700;

        this.stage = new createjs.Stage("canvas");
        const nodes = [
            new Circle(
                this.stageWidth/2, 300, 10, this.stage, "0"
            ),new Circle(
                this.stageWidth/2, 300, 10, this.stage, "1"
            ),new Circle(
                this.stageWidth/2, 300, 10, this.stage, "2"
            ),new Circle(
                this.stageWidth/2, 300, 10, this.stage, "3"
            ),new Circle(
                this.stageWidth/2, 300, 10, this.stage, "4"
            ),new Circle(
                this.stageWidth/2, 300, 10, this.stage, "5"
            ),
          ];
      
        const links = [
            { source: nodes[0], target:nodes[1] },
            { source: nodes[1], target:nodes[2] },
            { source: nodes[2], target:nodes[3] },
            { source: nodes[3], target:nodes[4] },
            { source: nodes[4], target:nodes[5] },
            { source: nodes[5], target:nodes[0] },
        ];
        
        // Create the force simulation
        const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).strength(0.5))
        .force('charge', d3.forceManyBody().strength(-1000))
        .force('center', d3.forceCenter(this.stageWidth/2, this.stageHeight/2))  // Setting the center of the layout (e.g., 300x300 canvas size)
        .on('tick', () => this.draw(nodes));  // Run the simulation and update positions
        simulation.parent = this;
    }
    
    draw(nodes){
        nodes.forEach((e) =>{
            e.set(e.x, e.y);
        })
        this.stage.update();
    }

    drawInitial(){
        const temp = [Math.floor(Math.random()*9)];
        var newNum = 0;
        while (this.nodes.length < 5){
            newNum = Math.floor(Math.random()*temp.length);
            const val = temp[newNum];
            this.nodes.push(val);
            temp.splice(newNum, 1);
            this.nodePositions[val].children.forEach((e) =>{
                if (!this.nodes.includes(e) && !temp.includes(e)){
                    temp.push(e);
                };
            })
        }
        
        this.nodes.forEach((e) =>{
            const pos = this.nodePositions[e];
            const node = new createjs.Shape();
            node.colour = "blue";
            node.graphics.beginFill(DEFAULT_COLOUR)
            .drawCircle(0, 0, 40)
            .endFill();
            
            node.x = pos.x;
            node.y = pos.y;
            this.stage.addChild(node);
        })
        
        this.nodes.forEach((e) =>{
            const pos = this.nodePositions[e];
            let connected = false;
            while (!connected){
                pos.children.forEach((child) => {
                    if ((this.nodes.includes(child)) && (Math.random() > 0.5)){
                        this.stage.addChild(drawArc(
                            pos, this.nodePositions[child], null, 
                            Math.floor(Math.random() * 10) + 1 + ""));
                        connected = true;
                    }})
                }
            })
        

        this.stage.update();
    }
}