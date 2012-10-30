# Delaunay Triangulation

This was a short project for John Shewchuk's 294-74 Mesh Generation and Processing Class. A [Delaunay Triangulation](http://en.wikipedia.org/wiki/Delaunay_triangulation) is defined as triangulation where no point lies inside the circumcircle of any triangle in the triangulation

<img src="http://petercottle.com/miscPics/dt.png"/>

## Demo

You can play with the algorithm and GUI [here](http://petercottle.com/DT/DT.html) .

## Implementation

There are many methods for computing the Delaunay triangulation for a set of points -- I chose to devise a hybrid approach that combines the Bowyer-Watson algorithm with the naive edge-flip algorithm.

Points inserted inside the convex hull of the existing points are located in a sublinear time by using walking-point location. The Bowyer-Watson algorithm then finds the cavity of triangles to delete (essentially a form of BFS), and then these points are re-triangulated.

For points outside the convex hull, each point is first connected to all visible edges. The edge flip algorithm is then used to Delaunay-fy each generated triangle.

## Takeaways

* This was my first time working with Processing.js. While it's a pleasure to work with, only later did I benchmark my code and realize hat over 90% of CPU time was being dedicated to drawing the scene, even during static periods of time. I learned the importance of choosing a graphics library, and to be wary of frameworks ported from other languages.

* This was also my first time working with randomly generated colors. Working in the Hue, Brightness, and Saturation space is *significantly* easier to deal with when generating random colors. As a plus, selecting a medium-high saturation and having partial opacities gives the demo a very "pastel" feel that I ended up being quite happy with.

