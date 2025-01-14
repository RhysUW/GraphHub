
//creating classes for vertex's and edges

class Node {
    constructor(data, x, y, radius){
        this.data = data;
        this.x = x,
        this.y = y;
        this.radius = radius;
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

//initializing canvas for displaying graph
let canvas = document.getElementById("graphDisplay");
let context = canvas.getContext("2d");


//global variables
let nodes = [];
let nodesData = []; //for displaying the vertexs
let edges = [];
let current_node_index = null;
let isDragging = false;
let startX;
let startY;
let counter = 0;

let startVertex;
let endVertex;

//initializing pre outputs for tracking nodes and edges
document.getElementById("nodes").textContent = JSON.stringify(nodesData, null, 2);


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
canvas.onmousedown = function(event){
    event.preventDefault();
    console.log(event);

    const rect = canvas.getBoundingClientRect();

    startX = event.clientX - rect.left;
    startY = event.clientY - rect.top;
    console.log(startX);
    console.log(startY);

    let index = 0;
    for(let node of nodes){
        //console.log(node.x);
        //console.log(node.y);
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

canvas.onmouseup = function(event){
    if(!isDragging){
        return;
    }
    event.preventDefault();
    isDragging = false;
}

canvas.onmouseout = function(event){
    if(!isDragging){
        return;
    }
    event.preventDefault();
    isDragging = false;
}

canvas.onmousemove = function(event){
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

        startX = mouseX;
        startY = mouseY;
    }
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

function newEdge(event){
    if(confirm("select nodes to add new adges") == true){

        let startNode = null;

        canvas.onmousedown = function(event){
            event.preventDefault();

            const rect = getBoundingClientRect();
            startX = event.clientX - rect.left;
            startY = event.clientY - rect.top;

            for(let node of nodes){
                if(is_mouse_in_node(startX, startY, node.x, node.y, node.radius)){
                startNode = node;
                break;
                }
            } 

            if(startNode){
                canvas.onmousemove = function(moveEvent){
                    moveEvent.preventDefault();

                    context.clearRect(0, 0, canvas.weidth, canvas.height);
                    for(let node of nodes){
                        drawNode(node);
                    }

                    //optionally here redraw existin edges here if we want them visable

                    const moveRect = canvas.getBoundingClientRect();
                    let currentX = moveEvent.clientX - moveRect.left;
                    let currentY = moveEvent.clientY - moveRect.top;

                    drawEdge(startNode.x, startNode.y, currentX, currentY);

                };
            }
        };
        canvas.onmouseup = function(event){
            canvas.onmousemove = null;
        }
    }else{
        return;
    }
}

function drawEdge(startX, startY, endX, endY){
    context.beginPath();
    context.moveTo(startX, startY);
    context.LineTo(endX, endY);
    context.strokeStyle = "balck";
    context.lineWidth = 2;
    context.stroke();
    context.closePath();
}

//logic for pressing clear Graph button
function clearCanvas(event) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    nodes.length = 0;
    counter = 0;
    document.getElementById("nodes").textContent = JSON.stringify(nodesData);
}

addVertex.addEventListener("click", add);
addEdge.addEventListener("click", newEdge);
clear.addEventListener("click", clearCanvas);
