
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
let breadthFirst = document.getElementById("bfs");
let topoSort = document.getElementById("topoSort");
let toggleInput = document.querySelector('#toggleDiv input[type="checkbox"]');

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
let isDirectedGraph = true;

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
            if(!isDirectedGraph){
                drawEdge(edge.startV.x, edge.startV.y, edge.endV.x, edge.endV.y, edge.startV.radius);
            }else{
                drawDirectedEdge(edge.startV.x, edge.startV.y, edge.endV.x, edge.endV.y, edge.startV.radius);
            }
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
                            drawEdge(edge.startV.x, edge.startV.y, edge.endV.x, edge.endV.y, edge.startV.radius);
                        }
                    }
                    

                    const moveRect = canvas.getBoundingClientRect();
                    let currentX = moveEvent.clientX - moveRect.left;
                    let currentY = moveEvent.clientY - moveRect.top;

                    //making sure edge is only drawn if another vertice is clicked
                    for(let node of nodes){
                        if(is_mouse_in_node(currentX, currentY, node.x, node.y, node.radius)){
                            endNode = node;
                            let edge1 = new Edge(startNode, endNode, isDirectedGraph, 0);
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
function drawEdge(startX, startY, endX, endY, radius) {
    // Calculate the angle between the start and end points
    const dx = endX - startX;
    const dy = endY - startY;
    const angle = Math.atan2(dy, dx);

    // Adjust the start and end points to be on the edges of the circles
    const startXAdjusted = startX + radius * Math.cos(angle);
    const startYAdjusted = startY + radius * Math.sin(angle);
    const endXAdjusted = endX - radius * Math.cos(angle);
    const endYAdjusted = endY - radius * Math.sin(angle);

    context.beginPath();
    context.moveTo(startXAdjusted, startYAdjusted);
    context.lineTo(endXAdjusted, endYAdjusted);
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
            

            const dx = endNode.x - startNode.x;
            const dy = endNode.y - startNode.y;
            const angle = Math.atan2(dy, dx);

            const startXAdjusted = startNode.x + startNode.radius * Math.cos(angle);
            const startYAdjusted = startNode.y + startNode.radius * Math.sin(angle);
            const endXAdjusted = endNode.x - endNode.radius * Math.cos(angle);
            const endYAdjusted = endNode.y - endNode.radius * Math.sin(angle);

            context.beginPath();
            context.moveTo(startXAdjusted, startYAdjusted);
            context.lineTo(endXAdjusted, endYAdjusted);
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
        drawEdge(edge.startV.x, edge.startV.y, edge.endV.x, edge.endV.y, edge.startV.radius);
    }

    if (nodes.length > 0) {
        dfsTraversal(nodes[0], visited, result);
    }

    console.log("DFS Result: ", result); 
    alert("DFS Traversal Order: " + result.join(" -> "));
}

function bfsTraversal(node, visited, result){
    if(!node){
        return;
    }

    let queue = [];
    queue.push(node);
    visited.add(node);
    result.push(node.data);

    while(queue.length > 0){
        let current_node = queue.shift();

        for(let neighbor of current_node.adjecencyList){
            if(!visited.has(neighbor)){
                visited.add(neighbor);
                result.push(neighbor.data);

                highlightEdge(current_node, neighbor);
                queue.push(neighbor);
            }
        }
    }
}

function breadthFirstSearch(event){
    initAdjecencyList();
    let visited = new Set();
    let result = [];

    context.clearRect(0, 0, canvas.width, canvas.height);
    for (let node of nodes) {
        drawNode(node);
    }
    for (let edge of edges) {
        drawEdge(edge.startV.x, edge.startV.y, edge.endV.x, edge.endV.y, edge.startV.radius);
    }

    if(nodes.length > 0){
        bfsTraversal(nodes[0], visited, result);
    }

    alert("BFS Traversal Order: " + result.join(" -> "));
}

function drawDirectedEdge(startX, startY, endX, endY, radius) {
    const dx = endX - startX;
    const dy = endY - startY;
    const angle = Math.atan2(dy, dx);

    const startXAdjusted = startX + radius * Math.cos(angle);
    const startYAdjusted = startY + radius * Math.sin(angle);
    const endXAdjusted = endX - radius * Math.cos(angle);
    const endYAdjusted = endY - radius * Math.sin(angle);

    context.beginPath();
    context.moveTo(startXAdjusted, startYAdjusted);
    context.lineTo(endXAdjusted, endYAdjusted);
    context.strokeStyle = "black";
    context.lineWidth = 2;
    context.stroke();
    context.closePath();

    const arrowLength = 10;
    const arrowAngle = Math.PI / 8;
    context.beginPath();
    context.moveTo(endXAdjusted, endYAdjusted);
    context.lineTo(endXAdjusted - arrowLength * Math.cos(angle - arrowAngle), endYAdjusted - arrowLength * Math.sin(angle - arrowAngle));
    context.lineTo(endXAdjusted - arrowLength * Math.cos(angle + arrowAngle), endYAdjusted - arrowLength * Math.sin(angle + arrowAngle));
    context.lineTo(endXAdjusted, endYAdjusted);
    context.fillStyle = "black";
    context.fill();
    context.closePath();
}

toggleInput.addEventListener('change', () => {
    isDirectedGraph = !toggleInput.checked;

    context.clearRect(0, 0, canvas.width, canvas.height);
    nodes.forEach(n => drawNode(n));
    edges.forEach(edge => {
        if(isDirectedGraph){
            drawDirectedEdge(edge.startV.x, edge.startV.y, edge.endV.x, edge.endV.y, edge.startV.radius);
        }else{
            drawEdge(edge.startV.x, edge.startV.y, edge.endV.x, edge.endV.y, edge.startV.radius)
        }
    })
})

function topologicalSort(event){
    if(isDirectedGraph){
        initAdjecencyList();

        inDegree = {};
        topoOrder = [];
        for(let v in nodes){
            inDegree[v] = 0;
        }

        for(let v in nodes){
            nodes[v].forEach(neighbor => {
                inDegree[neighbor]++;
            })
        }

        let queue = [];
        for(let v in inDegree){
            if(inDegree[v] == 0){
                queue.push(v);
            }
        }

        while(queue.length > 0){
            let currentNode = queue.shift();
            topoOrder.push(currentNode.data);

            nodes.forEach(neighbor => {
                inDegree[neighbor]--;
                if(inDegree[neighbor] ==0){
                    queue.push(neighbor);
                }
            })
        }
        console.log(topoOrder);
    }else{
        alert("Graph must be directed in order to have a topological ordering!");
    }
}


addVertex.addEventListener("click", add);
addEdge.addEventListener("click", newEdge);
clear.addEventListener("click", clearCanvas);
depthFirst.addEventListener("click", depthFirstSearch);
breadthFirst.addEventListener("click", breadthFirstSearch);
topoSort.addEventListener("click", topologicalSort);

