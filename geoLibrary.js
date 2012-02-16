/****** 
    math things
    
*********/

function randPoint() {
    var x = p.random(0,p.width);
    var y = p.random(0,p.height);
    return new Point(x,y);
}



/************************
    Primitives and such
    
    
******************/




function Vertex(id,x,y) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.myLink = null;
}

Vertex.prototype.draw = function() {
    //scale this so it fits the viewport essentially

    var newX = (this.x / maxVertexX) * 0.8 * p.width + 0.1 * p.width;
    var newY = (this.y / maxVertexY) * 0.8 * p.height + 0.1 * p.height;

    p.point(newX,newY);
    //p.point(this.x,this.y);
}

Vertex.prototype.getScaledCoords = function() {

    var newX = (this.x / maxVertexX) * 0.8 * p.width + 0.1 * p.width;
    var newY = (this.y / maxVertexY) * 0.8 * p.height + 0.1 * p.height;
    
    return new Point(newX,newY);
}

Vertex.prototype.getCoords = function() {
    return {'x':this.x,'y':this.y}
}

function Point(x,y) {
    this.x = x;
    this.y = y;
    
    this.strokeWidth = 2;
}

Point.prototype.draw = function() {

    p.point(this.x,this.y);
}

Point.prototype.getScaledCoords = function() {
    return this;
}




function Circle(x,y,radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
}

Circle.prototype.draw = function() {
    p.colorMode(p.HSB);
    
    p.stroke(0,0,255);
    p.fill(p.map(this.radius,0,300,0,255),255,p.dist(0,0,this.x,this.y)*50);

	p.ellipse(this.x,this.y,this.radius*2,this.radius*2);
    p.colorMode(p.RGB);
}

Circle.prototype.circleFromPoints = function (p1,p2,p3) {
	//from openprocessing.org/visuals/?visual=45489

	//first get circles
	var slope1 = (p1.y - p2.y) / (p1.x - p2.x);
	var slope2 = (p2.y - p3.y) / (p2.x - p3.x);

	if(Math.abs(slope1 - slope2) < 0.01)
	{
		eraseCircle();
		return;
	}
	var centerX = (slope1 * slope2 * (p3.y - p1.y) + slope1*(p2.x + p3.x) - slope2*(p1.x + p2.x))/(2*(slope1-slope2));
	var centerY = -1/slope1 * (centerX - (p1.x + p2.x)/2) + (p1.y + p2.y)/2;
	var radius = p.dist(centerX,centerY,p2.x,p2.y);

    var c = new Circle(centerX,centerY,radius);
    return c;
}

Circle.prototype.testPointInside = function(testPoint) {
    //essentially get the distance from here to the center, and then
    //test that against the radius
    var distance = p.dist(this.x,this.y,testPoint.x,testPoint.y);
    return distance <= this.radius;
}

/*****************************
    The triangle holder library!

    Initially this will be a simple collection of triangles (with ids, etc)
    but eventually it will be abstracted out to links and such


***********************/

function compareTwoVertices(a,b) {
    return a.id - b.id;
}

function Triangle(v1,v2,v3) {
    var rawVertices = [v1,v2,v3];
    this.vertices = rawVertices.sort(compareTwoVertices);

    this.generateId();
}

Triangle.prototype.generateId = function() {
    var startingId = "";

    for(var i = 0; i < 3; i++)
    {
        var v = this.vertices[i];
        startingId += String(v.id);
    }

    this.id = startingId;
}

Triangle.prototype.getCircumCircle = function() {
    var v1 = this.vertices[0];
    var v2 = this.vertices[1];
    var v3 = this.vertices[2];
    
    var c = Circle.prototype.circleFromPoints(v1,v2,v3);
    return c;
}

Triangle.prototype.testInCircumCircle = function(testPoint) {
    var c = this.getCircumCircle();
    return c.testPointInside(testPoint);
}

Triangle.prototype.draw = function() {
    //with scaled coordinates
    
    //draw the points
    for(var i = 0; i < 3; i++)
    {
        var point = this.vertices[i].getScaledCoords();
        point.draw();
    }
    
    for(var i = 0; i < 2; i++)
    {
        var p1 = this.vertices[i].getScaledCoords();
        var p2 = this.vertices[i+1].getScaledCoords();
        
        p.line(p1.x,p1.y,p2.x,p2.y);
    }
    
}

Triangle.prototype.drawCircumCircle = function() {
    //with scaled coordinates


}






















function Link(myVertex) {
    this.parentVertex = myVertex;
    this.vertices = [];
}

Link.prototype.addVertex = function(vertex) {
    this.vertices.push(vertex);
}

Link.prototype.draw = function() {
    this.drawEdges();
}

Link.prototype.drawEdges = function() {
    var myCoords = this.parentVertex.getScaledCoords();
    var myX = myCoords.x;
    var myY = myCoords.y;

    for(key in this.vertices)
    {
        var v = this.vertices[key];
        var coords = v.getScaledCoords();
        var x = coords.x;
        var y = coords.y;

        p.line(myX,myY,x,y);
    }
}


