export class DFS{
    constructor(){
        this.stageWidth = 1600;
        this.stageHeight = 700;

        this.stage = new createjs.Stage("canvas");
        this.nodes = [
            new Circle(
                this.stageWidth/2, 301, 50, this.stage, "0"
            ),new Circle(
                this.stageWidth/2, 300, 50, this.stage, "1"
            ),new Circle(
                this.stageWidth/2, 300, 50, this.stage, "2"
            ),new Circle(
                this.stageWidth/2, 300, 50, this.stage, "3"
            ),new Circle(
                this.stageWidth/2, 300, 50, this.stage, "4"
            ),new Circle(
                this.stageWidth/2, 300, 50, this.stage, "5"
            ),
        ];

        const links = [
            { source:this.nodes[0], target:this.nodes[1] },
            { source:this.nodes[0], target:this.nodes[2] },
            { source: this.nodes[1], target:this.nodes[2] },
            { source: this.nodes[3], target:this.nodes[0] },
            { source: this.nodes[3], target:this.nodes[4] },
            { source: this.nodes[4], target:this.nodes[5] },
            // { source: this.nodes[5], target:this.nodes[0] },
        ];
        
        // Create the force simulation
        this.simulation = d3.forceSimulation(this.nodes)
        .force('link', d3.forceLink(links).strength(1).distance(200).iterations(10))
        .force('charge', d3.forceManyBody().strength(-500))
        .force('center', d3.forceCenter(this.stageWidth/2, this.stageHeight/2).strength(0.1))  // Setting the center of the layout (e.g., 300x300 canvas size)
        .force("collide", d3.forceCollide((d) => d.radius*2))
        .force("boundary", forceBoundary(0, 0, 1600, 700))
        // .on('end', () => this.draw(this.nodes, links))  // Run the simulation and update positions
        .stop();
        this.simulation.parent = this;

        this.simulation.tick(Math.ceil(Math.log(
            this.simulation.alphaMin()) / Math.log(1 - this.simulation.alphaDecay())));


        this.line = new createjs.Shape();
        
        this.stage.addChild(this.line);

        this.draw(this.nodes, links)
        
    }
    
    addNode(){
        console.log(1);
        this.nodes.push(new Circle(
            this.stageWidth/2, 300, 50, this.stage, "6"
        ))
    }
    
    draw(nodes, links){
        this.line.graphics.clear();
        this.line.graphics.setStrokeStyle(4).beginStroke("black");
        
        nodes.forEach((e) =>{
            e.set(e.x, e.y);
        })
        
        links.forEach((e) => {
            this.drawLine(e.source, e.target);
        })
        
        this.stage.update();
    }

    drawLine(source, target){
        const angleA = Math.atan2(target.y - source.y, target.x - source.x);
        const angleB = Math.atan2(source.y - target.y, source.x - target.x);
        this.line.graphics.moveTo(
            source.x + 50*Math.cos(angleA), 
            source.y + 50*Math.sin(angleA)
        )
        this.line.graphics.lineTo(
            target.x + 50*Math.cos(angleB), 
            target.y + 50*Math.sin(angleB)
        )    
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