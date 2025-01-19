
//creating classes for vertex's and edges

class Node {
    constructor(data, x, y, radius){
        this.data = data;
        this.x = x,
        this.y = y;
        this.radius = radius;
        this.visited = false;
        this.adjecencyList = [];
    }
}

class Edge{
    constructor(startV, endV ,directed , weight){
        this.startV = startV;
        this.endV = endV;
        this.directed = directed;
        this.weight = weight;
    }
}



//initializing buttons
let addVertex = document.getElementById("addButton");
let addEdge = document.getElementById("edgeButton");
let clear = document.getElementById("clearButton");
let depthFirst = document.getElementById("depthFirst");

//initializing canvas for displaying graph
let canvas = document.getElementById("graphDisplay");
let context = canvas.getContext("2d");


//global variables
let nodes = [];
let nodesData = []; //for displaying the vertexs
let edges = [];
let edgesData = [];
let current_node_index = null;
let isDragging = false;
let startX;
let startY;
let counter = 0;

let confirmed = false;
let startNode = null;
let endNode = null;

//initializing pre outputs for tracking nodes and edges
document.getElementById("nodes").textContent = JSON.stringify(nodesData, null, 2);
document.getElementById("edges").textContent = JSON.stringify(edgesData);


//function to calculate if the mouse is inside a node when clicked
let is_mouse_in_node = function(mouseX, mouseY, circleX, circleY, circleRadius){
    const distX = mouseX - circleX;
    const distY = mouseY - circleY;
    const distance = Math.sqrt(distX * distX + distY * distY);
    return distance <= circleRadius;
}


let dragOffsetX = 0;
let dragOffsetY = 0;
//function for detecting if a node is being clicked/dragged for movement
let originalDown = canvas.onmousedown = function(event){
    event.preventDefault();
    console.log(event);

    const rect = canvas.getBoundingClientRect();

    startX = event.clientX - rect.left;
    startY = event.clientY - rect.top;
    console.log(startX);
    console.log(startY);

    let index = 0;
    for(let node of nodes){
        if(is_mouse_in_node(startX, startY, node.x, node.y, node.radius)){
            //console.log('yes');
            current_node_index = index;
            console.log(index);
            isDragging = true;
            dragOffsetX = node.x - startX;
            dragOffsetY = node.y - startY;
            return;
        }//else{
           // console.log('no');
        //}
        index++;
    }
}

let originalUp = canvas.onmouseup = function(event){
    if(!isDragging){
        return;
    }
    event.preventDefault();
    isDragging = false;
}

let originalOut = canvas.onmouseout = function(event){
    if(!isDragging){
        return;
    }
    event.preventDefault();
    isDragging = false;
}

let originalMove = canvas.onmousemove = function(event){
    if(!isDragging){
        return;
    }else{
        console.log('move with dragging');
        event.preventDefault();

        const rect = canvas.getBoundingClientRect();

        let mouseX = event.clientX - rect.left;
        let mouseY = event.clientY - rect.top;

        let current_node = nodes[current_node_index];
        current_node.x = mouseX + dragOffsetX;
        current_node.y = mouseY + dragOffsetY;
        
        context.clearRect(0, 0, canvas.width, canvas.height);
        for (let n of nodes) {
            drawNode(n);
          }
        
        for (let edge of edges) {
            drawEdge(edge.startV.x, edge.startV.y, edge.endV.x, edge.endV.y);                            //this needs to be finished redrawing edges after a node is moved
        }

        startX = mouseX;
        startY = mouseY;
    }
}

//used for after an edge is drawn so vertices can be moved again
function restoreHandlers(){
    canvas.onmousedown = originalDown;
    canvas.onmouseup = originalUp;
    canvas.onmouseout = originalOut;
    canvas.onmousemove = originalMove;
}



//logic for pressing add vertex button
function add(event){
    
    //calculating center of the canvas
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 20;

    let node = new Node(counter, centerX, centerY, radius);

    nodes.push(node);
    nodesData.push(node.data);
    document.getElementById("nodes").textContent = JSON.stringify(nodesData);
    console.log(nodes)
    drawNode(node);
    
    counter++;
}

//draws a vertex on the canvas
function drawNode(node){
    context.beginPath();
    context.strokeStyle = "black";
    context.lineWidth = 2;
    context.arc(node.x, node.y, node.radius, 0, 2* Math.PI, false);
    context.stroke();
    context.closePath();

    context.font = "16px Comic Sans MS";
    context.fillstyle = 'black';
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(node.data, node.x, node.y)
}

//logic for when add edge button is pressed
function newEdge(event){
    confirmed = confirm("select nodes to add new adges")
    if(confirmed){

        canvas.onmousedown = function(event){
            event.preventDefault();

            const rect = canvas.getBoundingClientRect();
            startX = event.clientX - rect.left;
            startY = event.clientY - rect.top;

            for(let node of nodes){
                if(is_mouse_in_node(startX, startY, node.x, node.y, node.radius)){
                startNode = node;
                console.log(startNode)
                break;
                }
            } 

            if(startNode){
                canvas.onmousedown = function(moveEvent){
                    moveEvent.preventDefault();

                    context.clearRect(0, 0, canvas.width, canvas.height);
                    //redraw all nodes
                    for(let node of nodes){
                        drawNode(node);
                    }

                    //redraw all previous edges
                    if(edges){  
                        for(let edge of edges){
                            drawEdge(edge.startV.x, edge.startV.y, edge.endV.x, edge.endV.y);
                        }
                    }
                    

                    const moveRect = canvas.getBoundingClientRect();
                    let currentX = moveEvent.clientX - moveRect.left;
                    let currentY = moveEvent.clientY - moveRect.top;

                    //making sure edge is only drawn if another vertice is clicked
                    for(let node of nodes){
                        if(is_mouse_in_node(currentX, currentY, node.x, node.y, node.radius)){
                            endNode = node;
                            let edge1 = new Edge(startNode, endNode, false, 0);
                            edges.push(edge1);
                            edgesData.push('[' + edge1.startV.data + ', ' + edge1.endV.data + ']');
                            document.getElementById("edges").textContent = JSON.stringify(edgesData);
                            drawEdge(startNode.x, startNode.y, currentX, currentY, node.radius);
                            confirmed = false;
                            restoreHandlers();
                        }
                    }
                };
            }
        };
    }else{
        return;
    }
}

//function draws the edge on the canvas
function drawEdge(startX, startY, endX, endY, radius){
    context.beginPath();
    context.moveTo(startX, startY);
    context.lineTo(endX, endY);
    context.strokeStyle = "black";
    context.lineWidth = 2;
    context.stroke();
    context.closePath();
}

//logic for pressing clear Graph button
function clearCanvas(event) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    nodes.length = 0;
    edges.length = 0;
    nodesData.length = 0;
    edgesData.length = 0;
    counter = 0;
    document.getElementById("nodes").textContent = "";
    document.getElementById("edges").textContent = "";
}

function initAdjecencyList(){
    nodes.forEach(node => node.adjecencyList = []);
    for(let edge of edges){
        edge.startV.adjecencyList.push(edge.endV);
        if(!edge.directed){
            edge.endV.adjecencyList.push(edge.startV);
        }
    }

    nodes.forEach(node => {
        node.adjecencyList.sort((a, b) => a.data - b.data);
    });
}

function highlightEdge(startNode, endNode) {
    for (let edge of edges) {
        if ((edge.startV === startNode && edge.endV === endNode) ||
            (!edge.directed && edge.startV === endNode && edge.endV === startNode)) {
            
            context.beginPath();
            context.moveTo(startNode.x, startNode.y);
            context.lineTo(endNode.x, endNode.y);
            context.strokeStyle = "red";
            context.lineWidth = 3; 
            context.stroke();
            context.closePath();
            break;
        }
    }
}

function dfsTraversal(node, visited, result){
    if(!node || visited.has(node)){
        return;
    }

    visited.add(node);
    result.push(node.data);

    for(let neighbor of node.adjecencyList){
        if(!visited.has(neighbor)){
            highlightEdge(node, neighbor);
            dfsTraversal(neighbor, visited, result);
        }
    }
}

function depthFirstSearch(event) {
    initAdjecencyList(); 
    let visited = new Set();
    let result = [];

    context.clearRect(0, 0, canvas.width, canvas.height);
    for (let node of nodes) {
        drawNode(node);
    }
    for (let edge of edges) {
        drawEdge(edge.startV.x, edge.startV.y, edge.endV.x, edge.endV.y);
    }

    if (nodes.length > 0) {
        dfsTraversal(nodes[0], visited, result);
    }

    console.log("DFS Result: ", result); 
    alert("DFS Traversal Order: " + result.join(" -> "));
}


addVertex.addEventListener("click", add);
addEdge.addEventListener("click", newEdge);
clear.addEventListener("click", clearCanvas);
depthFirst.addEventListener("click", depthFirstSearch);

