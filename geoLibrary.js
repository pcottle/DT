/****** 
    math things
    
*********/

function randPoint() {
    var x = p.random(0,p.width);
    var y = p.random(0,p.height);
    return new Point(x,y);
}

function arrayShuffle(theArray) {
    var len = theArray.length;
    var i = len;
    while (i--) {
        var p = parseInt(Math.random()*len);
        var t = theArray[i];
        theArray[i] = theArray[p];
        theArray[p] = t;
    }
};

highlightedEdges = [];
var outputId = false;

/************************
    Primitives and such
    
******************/



function Vertex(id,x,y) {
    this.id = id;
    this.x = x;
    this.y = y;


    var newX = ((this.x - minVertexX) / (maxVertexX - minVertexX)) * 0.8 * p.width + 0.1 * p.width;
    var newY = ((this.y - minVertexY) / (maxVertexY - minVertexY)) * 0.8 * p.height + 0.1 * p.height;
    var point = new Point(newX,newY);
    point.id = this.id;

    this.scaledPoint = point;
}

Vertex.prototype.toString = function() {
	return this.id;
}

Vertex.prototype.draw = function() {
    //scale this so it fits the viewport essentially

    this.scaledPoint.draw();
}

Vertex.prototype.getScaledCoords = function() {
    return this.scaledPoint;
}

Vertex.prototype.getCoords = function() {
    return {'x':this.x,'y':this.y}
}

function Segment(p1,p2) {
    this.p1 = p1;
    this.p2 = p2;
}

Segment.prototype.lightSegment = function() {
    p.strokeCap(p.ROUND);
    p.colorMode(p.HSB);
    p.strokeWeight(2);
    p.stroke(p.color(100,100,100,200));
}

Segment.prototype.normalSegment = function() {
    p.strokeCap(p.ROUND);
    p.colorMode(p.RGB);
    p.strokeWeight(4);
    p.stroke(0,0,0);
}

Segment.prototype.pointOnLine = function(a,b,c) {
    var Ba = $V([b.x - a.x, b.y - a.y, 0]);
    var Ca = $V([c.x - a.x, c.y - a.y, 0]);

    var crossResultVec = Ba.cross(Ca);
    var crossResult = crossResultVec.elements[2];

    if(Math.abs(crossResult) > 0.001)
    {
        return false;
    }
    return true;
}

Segment.prototype.pointOnSegment = function(a,b,c) {
    //first get the cross product between b-a and c-a and check that it's zero
    var Ba = $V([b.x - a.x, b.y - a.y, 0]);
    var Ca = $V([c.x - a.x, c.y - a.y, 0]);

    var crossResultVec = Ba.cross(Ca);
    var crossResult = crossResultVec.elements[2];

    if(Math.abs(crossResult) > 0.001)
    {
        return false;
    }
    //now check if its inside segment
    var dotResult = Ba.dot(Ca);
    if(dotResult < 0)
    {
        return false;
    }
    //is the dot product less than the squared distance of the Ba vector?
    var squaredDist = Ba.elements[0]*Ba.elements[0] + Ba.elements[1]*Ba.elements[1];
    if(dotResult > squaredDist)
    {
        return false;
    }
    return true;
}

function Edge(v1,v2) {
    this.v1 = v1;
    this.v2 = v2;

    var ids = [v1.id,v2.id];
    ids.sort();
    this.id = String(ids[0]) + String(ids[1]);
}

Edge.prototype.toString = function() {
	return this.id;
}

Edge.prototype.draw = function() {
    //now a line between each
    Segment.prototype.normalSegment();
    var c1 = this.v1.getScaledCoords();
    var c2 = this.v2.getScaledCoords();
    
    p.line(c1.x,c1.y,c2.x,c2.y);

    //draw each point / vertex
    Point.prototype.normalPoint();
    this.v1.draw();
    Point.prototype.highlightedPoint();
    this.v2.draw();
}

Edge.prototype.orientTest = function(point) {
    return orient2D(this.v1,this.v2,point);
}

Edge.prototype.getNeighborTris = function() {
	result = fLibrary.getTrisOnEdge(this);
    return result;
}

Edge.prototype.numNeighbors = function() {
    result = this.getNeighborTris();
    return result.length;
}

Edge.prototype.convexPointTest = function(point) {
    //ok so this edge has only one neighboring tri,
    //and we want to see if this point is on the opposite side
    var myNeighbors = this.getNeighborTris();
    if(myNeighbors.length != 1)
    {
        throw new Error("did convex point test on an edge with multiple or 0 neighboring tris");
    }
    var otherPoint = myNeighbors[0].getThirdPoint(this);

    //test if on same side
    var ss = Triangle.prototype.sameSide;
    return !ss(this.v1,this.v2,otherPoint,point);

}

    
function orient2D(pp,q,r) {
    var m1 = $M([
        [pp.x - r.x, pp.y - r.y],
        [q.x - r.x, q.y - r.y]
    ]);
    var det = m1.det() * -1;
    return det;
}


function Point(x,y) {
    this.x = x;
    this.y = y;
    this.isPoint = true;
    
    this.strokeWidth = 2;
    this.id = Math.round(Math.random()*1000);
}

Point.prototype.toString = function() {
	return String(this.id);
	//return "Point: " + this.x + "," + this.y + " id: " + this.id;
}

Point.prototype.draw = function() {
    var r = Point.prototype.drawSize;
    p.ellipse(this.x,this.y,r,r);

    if(outputId)
    {
        p.colorMode(p.RGB);
        p.fill(p.color(0,0,0));
        p.text(String(this.id),this.x,this.y);
        p.fill(p.color(255,255,255));
    }

    //p.point(this.x,this.y);
}

Point.prototype.normalSize = 8;
Point.prototype.highlightSize = 8;
Point.prototype.drawSize = 5;

Point.prototype.getScaledCoords = function() {
    return this;
}

Point.prototype.highlightedPoint = function() {
    Point.prototype.drawSize = Point.prototype.highlightSize;
    p.colorMode(p.RGB);
    p.strokeWeight(2);
    p.stroke(p.color(0,21,255));
    p.fill(p.color(133,143,255));
}

Point.prototype.normalPoint = function() {
    Point.prototype.drawSize = Point.prototype.normalSize;
    p.colorMode(p.RGB);
    p.strokeWeight(2);
    p.stroke(0,0,0);
    p.fill(255,255,255);
}


function Circle(x,y,radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
}

Circle.prototype.draw = function() {
    p.colorMode(p.HSB);
    
    p.stroke(0,0,255);
    p.fill(p.map(this.radius,0,300,0,255),255,p.dist(0,0,this.x,this.y)*50,50);

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
        return null;
        throw new Error("that circumcirlce is invalid, points are on top of each other");
		return;
	}

	var centerX = (slope1 * slope2 * (p3.y - p1.y) + slope1*(p2.x + p3.x) - slope2*(p1.x + p2.x))/(2*(slope1-slope2));
	var centerY = -1/slope1 * (centerX - (p1.x + p2.x)/2) + (p1.y + p2.y)/2;
	var radius = p.dist(centerX,centerY,p2.x,p2.y);
    
    if(!centerX || !centerY || !radius)
    {
        /*
        console.log("warning -- invalid circumcircle");
        console.log("the points");
        console.log(p1,p2,p3);
        console.log("center center radius");
        console.log(centerX,centerY,radius);
        console.log("slope",slope1,slope2);
        */
        return null;
        //throw new Error("invalid circumcircle, center or radius is undefined");
    }
    var c = new Circle(centerX,centerY,radius);
    return c;
}

Circle.prototype.testPointInside = function(testPoint) {
    //essentially get the distance from here to the center, and then
    //test that against the radius
    var distance = p.dist(this.x,this.y,testPoint.x,testPoint.y);
    return distance <= this.radius;
}

Circle.prototype.inCircle = function(a,b,c,d) {
    var m = $M([
        [a.x - d.x, a.y - d.y, Math.pow(a.x-d.x,2) + Math.pow(a.y-d.y,2)],
        [b.x - d.x, b.y - d.y, Math.pow(b.x-d.x,2) + Math.pow(b.y-d.y,2)],
        [c.x - d.x, c.y - d.y, Math.pow(c.x-d.x,2) + Math.pow(c.y-d.y,2)]
    ]);

	var pointInside = {};
	pointInside['x'] = (1/3) * (a.x + b.x + c.x);
	pointInside['y'] = (1/3) * (a.y + b.y + c.y);

	var mTest = $M([
        [a.x - pointInside.x, a.y - pointInside.y, Math.pow(a.x-pointInside.x,2) + Math.pow(a.y-pointInside.y,2)],
        [b.x - pointInside.x, b.y - pointInside.y, Math.pow(b.x-pointInside.x,2) + Math.pow(b.y-pointInside.y,2)],
        [c.x - pointInside.x, c.y - pointInside.y, Math.pow(c.x-pointInside.x,2) + Math.pow(c.y-pointInside.y,2)]
    ]);

    var det = m.det();
	var detTest = mTest.det();

	var detSign = Math.round(det / Math.abs(det));
	var testSign = Math.round(detTest / Math.abs(detTest));

	return detSign == testSign;

    if(det > 0)
    {
        //console.log("inside");
		return true;
    }
    else
    {
        //console.log("outside");
		return false;
    }
    return det;
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
    this.hasGeneratedCircle = false;

    this.vertexMap = {};
    for(var i = 0; i < 3; i++)
    {
        this.vertexMap[this.vertices[i].id] = true;
    }

    this.myCircumCircle = null;

    this.generateId();
}

Triangle.prototype.getCCWvertices = function() {
    //we need to get an array and then sort these vertices in CCW order
    //this is the same as sorting the vectors from the avg point
    //to the vertices

    var compareFunc = function(a,b) {
        var angleA = p.atan2(a.x,a.y);
        var angleB = p.atan2(b.x,b.y);
        return angleA-angleB;
    };

    var avgPoint = this.getAvgPoint();
    var sortArray = [];

    for(var i = 0; i < this.vertices.length; i++)
    {
        var v = this.vertices[i];
        var sortObj = {'id':v.id,
                       'x':v.x - avgPoint.x,
                       'y':v.y - avgPoint.y};
        sortArray.push(sortObj);
    }
    sortArray.sort(compareFunc);
    return sortArray;
}

Triangle.prototype.toString = function() {
	return "Triangle: " + this.id;
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

Triangle.prototype.getAvgPoint = function() {
    var a = this.vertices[0];
    var b = this.vertices[1];
    var c = this.vertices[2];

    var avgX = (1/3.0) * (a.x + b.x + c.x);
    var avgY = (1/3.0) * (a.y + b.y + c.y);

    var avgPoint = new Point(avgX,avgY);
    return avgPoint;
}

Triangle.prototype.WPLsearch = function(searchPoint) {
    //this function ASSUMES that you have checked if the point
    //is inside the triangle. it only tries to find a triangle
    //of its neighbors that goes in the right direction

    //two methods -- one is compute distance between avg point
    //of neighbor and tri, and the other is the ss test

    var searchSet = new geoSet();
    searchSet.add(this);

    var avgPoint = this.getAvgPoint();
    var ss = Triangle.prototype.sameSide;

    //get all your edges
    var edges = this.getEdges();
    for(var i = 0; i < edges.length; i++)
    {
        var e = edges[i];
        var a = e.v1;
        var b = e.v2;

        //test if the point is on the opposite side of this
        //edge as the avg point
        if(!ss(a,b,avgPoint,searchPoint))
        {
            //we could search here
            var neighbors = fLibrary.getTrisOnEdge(e);
            searchSet.addArray(neighbors);
        }
    }
    //now remove yourself from searchset -- you get added when
    //the neighbor edge query thing happens
    searchSet.remove(this);

    //all the tris you could search
    return searchSet.getAll();
}

Triangle.prototype.isDegenerate = function() {
    var a = this.vertices[0];
    var b = this.vertices[1];
    var c = this.vertices[2];

    return Segment.prototype.pointOnLine(a,b,c);
}

Triangle.prototype.getEdges = function() {
    //make an edge for a->b, b->c, and c->a
    var a = this.vertices[0];
    var b = this.vertices[1];
    var c = this.vertices[2];

    var e1 = new Edge(a,b);
    var e2 = new Edge(b,c);
    var e3 = new Edge(c,a);

    return [e1,e2,e3];
}

Triangle.prototype.getNeighborTris = function() {
	//essentially for each edge, get their neighbors,
	//and then reduce and remove yourself and return
	
	var myEdges = this.getEdges();

	var allTris = {};

	for(var i = 0; i < myEdges.length; i++)
	{
		var e = myEdges[i];
		var nTris = e.getNeighborTris();
		for(var j = 0; j < nTris.length; j++)
		{
			var t = nTris[j];
			allTris[t.id] = t;
		}
	}
	//ok so now return the ones that aren't you
	var toReturn = [];
	for(key in allTris)
	{
		if(key != this.id)
		{
			toReturn.push(allTris[key]);
		}
	}

	return toReturn;
}

Triangle.prototype.getCircumcircle = function() {
    if(this.hasGeneratedCircle)
    {
        return this.myCircumcircle;
    }
    this.hasGeneratedCircle = true;

    var v1 = this.vertices[0].getScaledCoords();
    var v2 = this.vertices[1].getScaledCoords();
    var v3 = this.vertices[2].getScaledCoords();
    
    var c = Circle.prototype.circleFromPoints(v1,v2,v3);
    this.myCircumcircle = c;
    return c;
}

Triangle.prototype.sameSide = function(p,q,r,testPoint) {
    triResult = orient2D(p,q,r);
    triSign = Math.round(triResult / Math.abs(triResult));

    pointResult = orient2D(p,q,testPoint);
    pointSign = Math.round(pointResult / Math.abs(pointResult));

    return pointSign == triSign;
}

Triangle.prototype.testInCircumcircle = function(testPoint) {
    //do the geometric primitive
    return Circle.prototype.inCircle(this.vertices[0],this.vertices[1],this.vertices[2],testPoint);
}

Triangle.prototype.drawHighlighted = function() {

    Point.prototype.highlightedPoint();
    //draw the points
    for(var i = 0; i < 3; i++)
    {
        var point = this.vertices[i].getScaledCoords();
        point.draw();
    }
    
    Segment.prototype.lightSegment();
    for(var i = 0; i < 3; i++)
    {
        var next = i + 1;
        if(next >= 3)
        {
            next = 0;
        }
        var p1 = this.vertices[i].getScaledCoords();
        var p2 = this.vertices[next].getScaledCoords();
        
        p.line(p1.x,p1.y,p2.x,p2.y);
    }
    p.fill(p.color(133,143,255));
    p.triangle( this.vertices[0].x,this.vertices[0].y,
                this.vertices[1].x,this.vertices[1].y,
                this.vertices[2].x,this.vertices[2].y);
    p.noFill();
}

Triangle.prototype.isGhostTri = function() {
    if(!this.hasCheckedGhost)
    {
        this.hasCheckedGhost = true;
        this.isGhost = (this.vertices[0].id < 0 || this.vertices[1].id < 0 || this.vertices[2].id < 0);
    }
    return this.isGhost;
}

Triangle.prototype.draw = function() {
    if(this.isGhostTri())
    {
        //return; 
    }


    
    Point.prototype.normalPoint();
    //draw the points
    for(var i = 0; i < 3; i++)
    {
        var point = this.vertices[i].getScaledCoords();
        point.draw();
    }
    
    Segment.prototype.lightSegment();
    for(var i = 0; i < 3; i++)
    {
        var next = i + 1;
        if(next >= 3)
        {
            next = 0;
        }
        var p1 = this.vertices[i].getScaledCoords();
        var p2 = this.vertices[next].getScaledCoords();
        
        p.line(p1.x,p1.y,p2.x,p2.y);
    }
}

Triangle.prototype.drawCircumcircle = function() {
    //with scaled coordinates
    var c = this.getCircumcircle();
    if(c)
    {
        c.draw();
    }
}

Triangle.prototype.drawBoth = function() {
    this.drawCircumcircle();
    this.draw();
}

Triangle.prototype.containsEdge = function(testEdge) {
    var v1 = testEdge.v1;
    var v2 = testEdge.v2;

    return this.vertexMap[v1.id] && this.vertexMap[v2.id];
}

Triangle.prototype.getThirdPoint = function(testEdge) {
    var v1 = testEdge.v1;
    var v2 = testEdge.v2;
    if(!this.vertexMap[v1.id] || !this.vertexMap[v2.id])
    {
        throw new Error("error! asked for a third point when edge points not here");
    }

    for(var i = 0; i < 3; i++)
    {
        var myV = this.vertices[i];
        if(myV.id != v1.id && myV.id != v2.id)
        {
            return myV;
        }
    }
}

Triangle.prototype.containsPoint = function(testPoint) {
    var a = this.vertices[0];
    var b = this.vertices[1];
    var c = this.vertices[2];

    //not too bad -- just do the sameside test for all
    var ss = Triangle.prototype.sameSide;

    //we need to change this for when the point is on the triangle line,
    //this technically means the triangle "contains" the point which is kinda bs
    var ss1 = ss(a,b,c,testPoint);
    var ss2 = ss(b,c,a,testPoint);
    var ss3 = ss(c,a,b,testPoint);

    if(!ss1)
    {
        //see if its on the line
        //ON LINE TEST
        ss1 = Segment.prototype.pointOnSegment(a,b,testPoint);
    }
    if(!ss2)
    {
        ss2 = Segment.prototype.pointOnSegment(b,c,testPoint);
    }
    if(!ss3)
    {
        ss3 = Segment.prototype.pointOnSegment(c,a,testPoint);
    }

    //we need to return both the result of the test and
    //if one of the points was on a line
    return ss1 && ss2 && ss3;
}


function triLibrary() {
    this.tris = [];
    this.highlightedTris = {};
}

triLibrary.prototype.addTri = function(tri) {
    this.tris.push(tri);
}

triLibrary.prototype.highlightTriById = function(triId) {
    this.highlightedTris[triId] = true;
}

triLibrary.prototype.highlightTri = function(tri) {
    this.highlightedTris[tri.id] = true;
}

triLibrary.prototype.pointInsideAnyTri = function(point) {
    if(this.getTriContainingPoint(point))
    {
        return true;
    }
    return false;
}

triLibrary.prototype.getTriContainingPoint = function(point) {

    for(var i = 0; i < this.tris.length; i++)
    {
        if(this.tris[i].containsPoint(point))
        {
            return this.tris[i];
        }
    }
    return null;
}

triLibrary.prototype.getAllTrisWithPointInCircumcircle = function(point) {

	toReturn = [];
	
	for(var i = 0; i < this.tris.length; i++)
	{
		if(this.tris[i].testInCircumcircle(point))
		{
			toReturn.push(this.tris[i]);
		}
	}
	return toReturn;
}

triLibrary.prototype.highlightTrisContainingPoint = function(point) {
    for(var i = 0; i < this.tris.length; i++)
    {
        var thisTri = this.tris[i];
        if(thisTri.containsPoint(point))
        {
            if(this.highlightedTris[thisTri.id])
            {
                this.highlightedTris[thisTri.id] = false;
            }
            else
            {
                this.highlightedTris[thisTri.id] = true;
            }
        }
    }
}

triLibrary.prototype.drawAllTris = function(mode) {
    for(var i = 0; i < this.tris.length; i++)
    {
        var thisTri = this.tris[i];
        if(this.highlightedTris[thisTri.id])
        {
            thisTri.drawHighlighted();
        }
        else if(mode)
        {
            thisTri.drawBoth();
        }
        else
        {
            thisTri.draw();
        }
    }
}

triLibrary.prototype.getTrisOnEdge = function(edge) {
    resultTris = [];
    for(var i = 0; i < this.tris.length; i++)
    {
        var thisTri = this.tris[i];
        if(thisTri.containsEdge(edge))
        {
            resultTris.push(thisTri);
        }
    }

    if(resultTris.length > 2)
    {
        throw new Error("Error -- more than 2 tries on an edge");
    }

    return resultTris;
}

triLibrary.prototype.getEdgesWithOneTri = function() {
    //horrible running time
    var singleEdges = [];

    for(var i = 0; i < this.tris.length; i++)
    {
        var theseEdges = this.tris[i].getEdges();
        for(var j = 0; j < theseEdges.length; j++)
        {
            var e = theseEdges[j];
            if(e.numNeighbors() == 1)
            {
                singleEdges.push(e);
            }
        }
    }

    return singleEdges;
}


triLibrary.prototype.deleteTri = function(tri) {
    for(var i = 0; i < this.tris.length; i++)
    {
        var thisTri = this.tris[i];
        if(thisTri.id == tri.id)
        {
            this.tris.splice(i,1);
            return;
        }
    }
	return;
	//error muted
	console.log(tri);
	console.log(this.tris);
    throw new Error("error -- this library does not contain that tri");
}

triLibrary.prototype.outputAllTris = function() {
    var textForOutput = "";

    for(var i = 0; i < this.tris.length; i++)
    {
        var t = this.tris[i];

        var sortedV = t.getCCWvertices();
        var a = sortedV[0]; var b = sortedV[1]; var c = sortedV[2];

        textForOutput += String(i + 1) + " " + a.id + " " + b.id + " " + c.id + "\n";
    }

    textForOutput = String(this.tris.length) + " 3 0 \n" + textForOutput;
    return textForOutput;
}

function doFlipAlgorithmWithTris(trisToStart)
{
	var checkedEdges = {};
	var edgeQueue = [];

	for(var i = 0; i < trisToStart.length; i++)
	{
		var t = trisToStart[i];
		edgeQueue = edgeQueue.concat(t.getEdges());
	}
	//now all edges are in buffer... start the checking process
	while(edgeQueue.length > 0)
	{
		var e = edgeQueue.pop();
		if(checkedEdges[e.id])
		{ continue; }

		checkedEdges[e.id] = true;

		//check if should flip
		if(!shouldFlip(e))
		{ continue; }

		//ok now we for sure have to flip this edge
		//so we might need to check it again
		checkedEdges[e.id] = false;

		//do the flip, and get a list of tris created
		var trisCreated = doFlip(e);

		for(var i = 0; i < trisCreated.length; i++)
		{
			edgeQueue = edgeQueue.concat(trisCreated[i].getEdges());
		}
		//done
	}
}

function shouldFlip(edge)
{
	if(edge.numNeighbors() != 2)
	{
		return false;
	} 
	//get our neighbors
	var neighbors = edge.getNeighborTris();
	var n1 = neighbors[0];
	var n2 = neighbors[1];

	//see if the third point of our first neighbor is in the circumcircle
	//of our other neighbor tri
	
	var testPoint = n1.getThirdPoint(edge);
	return n2.testInCircumcircle(testPoint);

}

function doFlip(edge)
{
	//basically get the third points of our neighbors,
	//connect those for an edge, and connect that edge
	//to our original vertices
	var neighbors = edge.getNeighborTris();
	var n1 = neighbors[0];
	var n2 = neighbors[1];

	var newPoint1 = n1.getThirdPoint(edge);
	var newPoint2 = n2.getThirdPoint(edge);

	var origPoint1 = edge.v1;
	var origPoint2 = edge.v2;

	//now we have all this data so go delete our neighbor tris
	fLibrary.deleteTri(n1);
	fLibrary.deleteTri(n2);

	//make a new edge and new tris
	var newEdge = new Edge(newPoint1,newPoint2);

	var trisCreated = [];
	
	var edgeArray = new Array(newEdge);
	trisCreated = trisCreated.concat(joinAllEdgesToPoint(edgeArray,origPoint1));
	trisCreated = trisCreated.concat(joinAllEdgesToPoint(edgeArray,origPoint2));

	//return these created tris
	return trisCreated;
}

function recursiveTriSearch(thisTri,checkedTris,trisToDelete,point)
{
	//ok return if you're already in here
	if(checkedTris[thisTri.id])
	{return;}
	checkedTris[thisTri.id] = true;
	
	var testResult = thisTri.testInCircumcircle(point);

	if(!testResult)
	{ return; }
	//we contain it! so go add ourselves and search onwards
	trisToDelete.push(thisTri);

	var myNeighbors = thisTri.getNeighborTris();
	for(var i = 0; i < myNeighbors.length; i++)
	{
		recursiveTriSearch(myNeighbors[i],checkedTris,trisToDelete,point);
	}
	//should be done here, go ahead and return
	return;
}

function insertPointInsideTri(seedTri,point) {
    //by definition, the point is inside the triangle so
    //its inside the triangle's circumcirlce

    //we will have a few things... a closed set of edges
    //that we have checked, a closed set of tris that we have checked,
    //etc

    checkedTris = {};
    trisToDelete = [];
    edgesToJoin = [];

	//search off of this seed tri	
	recursiveTriSearch(seedTri,checkedTris,trisToDelete,point);
	
	edgeCount = {};
	edgeMap = {};

	//we need to find the cavity formed by these triangles. the cavity is essentially
	//the edges that only appear once. we will use an edge mapper
    for(var i = 0; i < trisToDelete.length; i++)
    {
		//get the edges for this tri
		var edges = trisToDelete[i].getEdges();
		for(var j = 0; j < edges.length; j++)
		{
			//store edge count
			var e = edges[j];
			//if we havent seen this one yet
			if(!edgeCount[e.id])
			{
				edgeMap[e.id] = e;
				edgeCount[e.id] = 1;
			}
			else
			{
				edgeCount[e.id] = edgeCount[e.id] + 1;
			}
		}
		fLibrary.deleteTri(trisToDelete[i]);
    }

	//ok now go through and see which edges are only there once
	edgesToJoin = [];
	for(key in edgeCount)
	{
		var count = edgeCount[key];
		if(count == 1)
		{
			edgesToJoin.push(edgeMap[key]);
		}
	}
    //make triangles with our edges
    joinAllEdgesToPoint(edgesToJoin,point);
}

function insertAnyPoint(point) {
    //see if theres a tri containing this point
	fLibrary.addVertex(point);
    var result = fLibrary.getTriContainingPoint(point);
    //console.log(result); the triangle i got when searching...
    if(result)
    {
        insertPointInsideTri(result,point);
    }
    else
    {
        insertPointOutsideConvexHull(point);
    }
}

function insertPointOutsideConvexHull(point) {
    //ok so basically get all the singleton edges, and then see if they are
    //visible, and if they are, connect them

    var singleEdges = fLibrary.getEdgesWithOneTri();

    var edgesToConnect = [];

    //find all the edges that are visible to me
    for(var i = 0; i < singleEdges.length; i++)
    {
        var e = singleEdges[i];
        if(e.convexPointTest(point))
        {
            edgesToConnect.push(e);
        }
    }
    var trisCreated = joinAllEdgesToPoint(edgesToConnect,point);
    doFlipAlgorithmWithTris(trisCreated);
}


function joinAllEdgesToPoint(edgesToConnect,point)
{
    var trisCreated = [];
    //connect all of these
    for(var i = 0; i < edgesToConnect.length; i++)
    {
        var e = edgesToConnect[i];
        var t = new Triangle(point,e.v1,e.v2);

        //here we need to make sure the tri isnt 
        //degenerate... because this happens when
        //we insert points righton top of lines

        //so test the tri for being degenerate
        if(!t.isDegenerate())
        {
            fLibrary.addTri(t);
            trisCreated.push(t);
        }
    }
    return trisCreated;
}


function makeSortFunction(parentVertex)
{
	//we will use javascript closures to make a sort function
	//that takes in this parent vertex and does the atan2 function
	var compareTwo = function(a,b) {
		//subtract each 
		var aX = a.x - parentVertex.x;
		var aY = a.y - parentVertex.y;

		var bX = b.x - parentVertex.x;
		var bY = b.y - parentVertex.y;

		return p.atan2(aX,aY) - p.atan2(bX,bY);
	}

	return compareTwo;
}



function geoSet() {
	this.mySet = {};
}

geoSet.prototype.addArray = function(toAdd) {
    for(var i = 0; i < toAdd.length; i++)
    {
        this.add(toAdd[i]);
    }
}

geoSet.prototype.toString = function() {
	var str = "";
	for(key in this.mySet)
	{
		str = str + String(this.mySet[key]) + ", ";
	}
	return str;
}

geoSet.prototype.union = function(otherSet) {
    var toReturn = new geoSet();
    for(key in this.mySet)
    {
        toReturn.add(this.mySet[key]);
    }
    for(key in otherSet.mySet)
    {
        toReturn.add(this.mySet[key]);
    }
    return toReturn;
}

geoSet.prototype.add = function(obj) {
    if(!obj || !obj.id)
    {
        return;
    }
	if(!obj.id)
	{
		throw new Error("error -- obj has no id to be inserted",obj.id);
	}
	this.mySet[obj.id] = obj;
}

geoSet.prototype.remove = function(obj) {
	this.mySet[obj.id] = false;
}

geoSet.prototype.isIn = function(obj) {
	return this.mySet[obj.id];
}

geoSet.prototype.getAll = function() {
	var toReturn = [];
	for(key in this.mySet)
	{
		if(this.mySet[key])
		{
			toReturn.push(this.mySet[key]);
		}
	}
	return toReturn;
}












function Link(myVertex) {
    this.parentVertex = myVertex;
    this.myVertices = [];
	this.myVertexSet = new geoSet();
    this.hasGeneratedSortFunction = false;
	this.sortFunction = null;
}

Link.prototype.getNeighborTrisOfEdge = function(vertex) {
	//its implied that we are querying the edge of parentVertex -> vertex
	if(!this.myVertexSet.isIn(vertex))
	{
        console.log("the link is this", this);
        console.log("the point is this", vertex);
		throw new Error("error -- that vertex isnt in my set");
	}


	//we need to get the "location" of vertex, and then one before and one after
	var itsIndex = this.getIndexOf(vertex);
	var oneBefore = this.correctIndex(itsIndex - 1);
	var oneAfter = this.correctIndex(itsIndex + 1);

	var pBefore = this.myVertices[oneBefore];
	var pAfter = this.myVertices[oneAfter];

	//make two tris, but use a set because there could be only one tri
	var triSet = new geoSet();

	var tri1 = new Triangle(this.parentVertex,vertex,pBefore);
	var tri2 = new Triangle(this.parentVertex,vertex,pAfter);

    //the key thing here is that if this triangle doesn't exist,
    if(fLibrary.triSet.isIn(tri1))
    {
        triSet.add(tri1);
    }
    if(fLibrary.triSet.isIn(tri2))
    {
        triSet.add(tri2);
    }

    /*
    triSet.add(tri1);
    triSet.add(tri2);
    */

	return triSet.getAll();
}

Link.prototype.getAllEdges = function() {
	var edgeSet = new geoSet();

	for(var i = 0; i < myVertices.length; i++)
	{
		//make an edge
		var e = new Edge(this.parentVertex,this.myVertices[i]);
		edgeSet.add(e);
	}
	return edgeSet.getAll();
}

Link.prototype.correctIndex = function(number) {
	if(number == -1)
	{
		//wrap around to the front
		return this.myVertices.length - 1;
	}
	if(number == this.myVertices.length)
	{
		//wrap around to beginning
		return 0;
	}
	if(number < -1 || number > this.myVertices.length)
	{
		throw new Error("bad index for wraparound",number);
	}

	return number;
}

Link.prototype.getIndexOf = function(vertex) {

	for(var i = 0; i < this.myVertices.length; i++)
	{
		if(this.myVertices[i].id == vertex.id)
		{
			return i;
		}
	}
    console.log("the link", this);
    console.log("the vertex to get is ", vertex);
	throw new Error("tried to get the index of a vertex that does not exist in our set");
}

Link.prototype.toString = function() {
	return "Link: parentVertex of: " + String(this.parentVertex);
}

Link.prototype.getSortFunction = function() {
	if(!this.hasGeneratedSortFunction)
	{
		this.sortFunction = makeSortFunction(this.parentVertex);
		this.hasGeneratedSortFunction = true;
	}
	return this.sortFunction;
}

Link.prototype.sortVertices = function() {
	this.myVertices.sort(this.getSortFunction());
}

Link.prototype.addVertex = function(vertex) {
	//prevent inserting multiple times, could screw up
	//getting neighbors or counting tris
	
	if(!this.myVertexSet.isIn(vertex))
	{
		this.myVertexSet.add(vertex);
		this.myVertices.push(vertex);
		this.sortVertices();
	}
	/*
	else
	{
		console.log("warning -- adding vertex multiple times");
		console.log("link",this);
		console.log("vertex",vertex);
	}
	*/
}

Link.prototype.deleteVertex = function(vertex) {
	this.removeVertex(vertex);
}

Link.prototype.removeVertex = function(vertex) {
	if(!this.myVertexSet.isIn(vertex))
	{
        //this is fine because triangles share edges and you delete them alot
		return;
	}

	for(var i = 0; i < this.myVertices.length; i++)
	{
		var v = this.myVertices[i];
		if(v.id == vertex.id)
		{
			this.myVertices.splice(i,1);
			this.myVertexSet.remove(vertex);
			return;
		}
	}
}

Link.prototype.draw = function() {
    this.drawEdges();
}

Link.prototype.drawEdges = function() {
    var myCoords = this.parentVertex.getScaledCoords();
    var myX = myCoords.x;
    var myY = myCoords.y;

    for(key in this.myVertices)
    {
        var v = this.myVertices[key];
        var coords = v.getScaledCoords();
        var x = coords.x;
        var y = coords.y;

        p.line(myX,myY,x,y);
    }
}


function bbckLibrary() {
	this.vertexToLink = {};
	this.vertexToObj = {};
    this.startingTriForWPL = null;
}

bbckLibrary.prototype.addVertex = function(vertex) {
	if(this.vertexToObj[vertex])
	{
		throw new Error("warning -- trying to add a vertex multiple times to bbckStructure");
		return;
	}

	var newLink = new Link(vertex);
	this.vertexToLink[vertex] = newLink;
	this.vertexToObj[vertex] = vertex;
}


bbckLibrary.prototype.deleteEdge = function(edge) {
	//this does the bidirectional insertion
	var v1 = edge.v1; var v2 = edge.v2;
	if(!this.vertexToObj[v1] || !this.vertexToObj[v2])
	{
		throw new Error("error -- trying to add edge when vertices aren't added yet");
	}

	var link1 = this.vertexToLink[v1];
	var link2 = this.vertexToLink[v2];

	link1.deleteVertex(v2);
	link2.deleteVertex(v1);
}

bbckLibrary.prototype.insertEdge = function(edge) {
	//this does the bidirectional insertion
	var v1 = edge.v1; var v2 = edge.v2;
	if(!this.vertexToObj[v1] || !this.vertexToObj[v2])
	{
		throw new Error("error -- trying to add edge when vertices aren't added yet");
	}

	var link1 = this.vertexToLink[v1];
	var link2 = this.vertexToLink[v2];

	link1.addVertex(v2);
	link2.addVertex(v1);

	//should be done, links take care of it
}

bbckLibrary.prototype.addTri = function(tri) {
    this.startingTriForWPL = tri;

	var edges = tri.getEdges();
	for(var i = 0; i < 3; i++)
	{
		this.insertEdge(edges[i]);
	}
}

bbckLibrary.prototype.findTriContainingPoint = function(point) {
    var startTri = fLibrary.tLibrary.tris[0];
    //enter the loop... ?
    var result = this.walkingPointLocation(startTri,point);
    return result;
}

bbckLibrary.prototype.walkingPointLocation = function(startTri,point) {
    //begin the queue thing
    var checkedTris = new geoSet();
    var triQueue = [];
    triQueue.push(startTri);

    while(triQueue.length > 0)
    {
        var t = triQueue.pop();
        
        //dont search the same tri twice
        //this kinda ends up being like depth first graph search
        if(checkedTris.isIn(t))
        {
            continue;
        }
        checkedTris.add(t);

        //see if it contains it
        if(t.containsPoint(point))
        {
            //we are done!
            return t;
        }
        //otherwise get all the neighbors to search
        var neighbors = t.WPLsearch(point);
        if(neighbors.length)
        {
            triQueue = triQueue.concat(neighbors);
        }
    }
    //no triangle found :(
    return null;
}

bbckLibrary.prototype.deleteTri = function(tri) {

	var edges = tri.getEdges();
	for(var i = 0; i < 3; i++)
	{
		this.deleteEdge(edges[i]);
	}
}

bbckLibrary.prototype.getTrianglesForVertex = function(vertex) {

	//Outline:
	//	make all the edges for this vertex (a link method)
	//	query all the triangles for these edges
	//	add these to a triset
	//	return the triset array

    //wait do we need this??

	throw new Error('not done yet');
}

bbckLibrary.prototype.getTrisOnEdge = function(edge) {
	return this.getNeighborsOfEdge(edge);
}

bbckLibrary.prototype.getNeighborsOfEdge = function(edge) {
	//for each edge "direction", get the tris and add to a set
	var v1 = edge.v1;
	var v2 = edge.v2;

	var link1 = this.vertexToLink[v1];
	var link2 = this.vertexToLink[v2];

	var tris1 = link1.getNeighborTrisOfEdge(v2);
	var tris2 = link2.getNeighborTrisOfEdge(v1);

	var triSet1 = new geoSet();
    triSet1.addArray(tris1);
    var triSet2 = new geoSet();
    triSet2.addArray(tris2);

	if(tris1.length != tris2.length)
	{
        console.log("on this edge", edge, "i got");
		console.log(tris1);
		console.log(tris2);
        console.warn("weird!!");
        return triSet1.union(triSet2);
		throw new Error("weird, tris returned different lengths for 2 different directions");
        //TODO
	}
	//arbitrary selection
	return tris1;
}


function fullLibrary() {
	this.tLibrary = new triLibrary();
	this.bLibrary = new bbckLibrary();
	this.vertexSet = new geoSet();

    //eff the ghost vertex, lets make a set of triangles
    this.triSet = new geoSet();


}

fullLibrary.prototype.addVertex = function(vertex) {
	if(!this.vertexSet.isIn(vertex))
	{
		this.vertexSet.add(vertex);
		this.bLibrary.addVertex(vertex);
	}
}

fullLibrary.prototype.outputFile = function() {
    var text = this.tLibrary.outputAllTris();
    return text;
}

fullLibrary.prototype.drawAllTris = function(drawMode) {
	this.tLibrary.drawAllTris(drawMode);
}

fullLibrary.prototype.highlightTrisContainingPoint = function(point) {
	this.tLibrary.highlightTrisContainingPoint(point);
}

fullLibrary.prototype.addTri = function(tri) {
	for(var i = 0; i < tri.vertices.length; i++)
	{
		if(!this.vertexSet.isIn(tri.vertices[i]))
		{
			this.vertexSet.add(tri.vertices[i]);
			this.bLibrary.addVertex(tri.vertices[i]);
		}
	}
	
	//for drawing
	this.tLibrary.addTri(tri);
	//for query
	this.bLibrary.addTri(tri);

    //for existence
    this.triSet.add(tri);
}

fullLibrary.prototype.deleteTri = function(tri) {
	this.tLibrary.deleteTri(tri);
	this.bLibrary.deleteTri(tri);
    this.triSet.remove(tri);
}

fullLibrary.prototype.getTrisOnEdge = function(edge) {
	return this.bLibrary.getTrisOnEdge(edge);
}

fullLibrary.prototype.getTriContainingPoint = function(point) {
    //try this out
    return this.bLibrary.findTriContainingPoint(point);
	//return this.tLibrary.getTriContainingPoint(point);
}

fullLibrary.prototype.getEdgesWithOneTri = function() {
	console.log("NEED TO DO THIS ALSO -- edge query for convex hull");
	return this.tLibrary.getEdgesWithOneTri();
}

