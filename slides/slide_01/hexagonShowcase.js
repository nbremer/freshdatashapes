pt.hexagonShowcase = pt.hexagonShowcase || {};

pt.hexagonShowcase.init = function() {
	
	//Remove any existing svgs
	d3.select('#hexagon-showcase #hexagonShowcase svg').remove();

	///////////////////////////////////////////////////////////////////////////
	//////////////////// Set up and initiate svg containers ///////////////////
	///////////////////////////////////////////////////////////////////////////	

	var margin = {
		top: 250,
		right: 0,
		bottom: 250,
		left: 0
	};
	var width = $(".slides").width()*0.95 - margin.left - margin.right;
	var height = $(".slides").height()*1 - margin.top - margin.bottom;
	pt.hexagonShowcase.height = height;		

	//SVG container
	pt.hexagonShowcase.svg = d3.select('#hexagon-showcase #hexagonShowcase')
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom);
		
	var svg = pt.hexagonShowcase.svg.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		
	///////////////////////////////////////////////////////////////////////////
	/////////////////////// Calculate hexagon variables ///////////////////////
	///////////////////////////////////////////////////////////////////////////	

	var SQRT3 = Math.sqrt(3),
		hexRadius = Math.min(width, height)/2,
		hexWidth = SQRT3 * hexRadius,
		hexHeight = 2 * hexRadius;
	var hexagonPoly = [[0,-1],[SQRT3/2,0.5],[0,1],[-SQRT3/2,0.5],[-SQRT3/2,-0.5],[0,-1],[SQRT3/2,-0.5]];
	var hexagonPath = "m" + hexagonPoly.map(function(p){ return [p[0]*hexRadius, p[1]*hexRadius].join(','); }).join('l') + "z";

	pt.hexagonShowcase.hexRadius = hexRadius;

	///////////////////////////////////////////////////////////////////////////
	///////////////// Create defs for all gradients and filters ///////////////
	///////////////////////////////////////////////////////////////////////////	

	var numColors = 10;
	var colorScale = d3.scale.linear()
	   .domain([0,(numColors-1)/2,numColors-1])
	   .range(["#2c7bb6", "#ffff8c", "#d7191c"])
	   .interpolate(d3.interpolateHcl);

	var defs = svg.append("defs");

	//Create a clip path that is the same as the top hexagon
	defs.append("clipPath")
        .attr("id", "clip")
        .append("path")
        .attr("d", "M" + (width/2) + "," + (height/2) + hexagonPath);

	///////////////////////////////////////////////////////////////////////////
	////////////////////// Create set of random circles ///////////////////////
	///////////////////////////////////////////////////////////////////////////	

	//Create dataset with random initial positions
	randStart = [];
	for(var i = 0; i < 50; i++) {
		randStart.push({
			rHex: Math.random() * hexWidth,
			theta: Math.random() * 2 * Math.PI,
			r: 8 + Math.random() * 30,
			color: colorScale(i%numColors)
		});
	}//for i

	///////////////////////////////////////////////////////////////////////////
	///////////////////// Create rainbow underlying gradient //////////////////
	///////////////////////////////////////////////////////////////////////////	

	defs.append("linearGradient")
		.attr("id", "gradientRainbowIntro")
		.attr("gradientUnits", "userSpaceOnUse") 
		.attr("x1", -hexWidth/2*0.9).attr("y1", 0)
		.attr("x2", hexWidth/2*0.9).attr("y2", 0)
		.selectAll("stop") 
		.data(d3.range(numColors))                  
		.enter().append("stop") 
		.attr("offset", function(d,i) { return (i/(numColors-1)*100) + "%"; })   
		.attr("stop-color", function(d) { return colorScale(d); });

	///////////////////////////////////////////////////////////////////////////
	//////////////////// Create sphere-planet like gradient ///////////////////
	///////////////////////////////////////////////////////////////////////////	

	var gradientPlanet = defs.selectAll(".planetGradient")
		.data(randStart)
		.enter().append("radialGradient")
		.attr("class",".planetGradient")
		.attr("cx", "25%")
		.attr("cy", "25%")
		.attr("r", "65%")
		.attr("id", function(d,i){ return "gradientPlanetIntro-"+i; });

	gradientPlanet.append("stop")
		.attr("offset", "0%")
		.attr("stop-color", function(d,i) { return d3.rgb(colorScale(i%numColors)).brighter(1); });

	gradientPlanet.append("stop")
		.attr("offset", "40%")
		.attr("stop-color", function(d,i) { return colorScale(i%numColors); });
		 
	gradientPlanet.append("stop")
		.attr("offset",  "100%")
		.attr("stop-color", function(d,i) { return d3.rgb(colorScale(i%numColors)).darker(1); });

	///////////////////////////////////////////////////////////////////////////
	//////////////////////// Create slider gradient ///////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	pt.hexagonShowcase.keepSliding = true;

	var sliderGradient = defs.selectAll(".sliderGradient")
		.data(randStart)
		.enter().append("linearGradient")
		.attr("class", "sliderGradient")
		.attr("gradientUnits", "userSpaceOnUse")    
		.attr("x1", -hexWidth/2).attr("y1", 0)
		.attr("x2", hexWidth/2).attr("y2", 0)             
		.attr("id", function(d,i) { return "gradientSliderIntro-" + i; });
	
	sliderGradient.append("stop")
		.attr("class", "left")
		.attr("offset", 0.4)
		.attr("stop-color", "#9E9E9E")
		.attr("stop-opacity", 0.5); 
	
	sliderGradient.append("stop")
		.attr("class", "left")
		.attr("offset", 0.4)
		.attr("stop-color", function(d,i) { return colorScale(i%numColors); })
		.attr("stop-opacity", 1); 

	sliderGradient.append("stop")
		.attr("class", "right")
		.attr("offset", 0.6)
		.attr("stop-color", function(d,i) { return colorScale(i%numColors); })
		.attr("stop-opacity", 1); 
	
	sliderGradient.append("stop")
		.attr("class", "right")
		.attr("offset", 0.6)
		.attr("stop-color", "#9E9E9E")
		.attr("stop-opacity", 0.5); 

	///////////////////////////////////////////////////////////////////////////
	///////////////////////// Create animated gradient ////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	var animatedGradient = defs.append("linearGradient")
		.attr("gradientUnits", "userSpaceOnUse")
		.attr("id","animatedGradientIntroSlide");
		
	//The gradient definition below isn't the fastest or most optimal way
	//but because safari can't handle spreadMethod reflect I had to make
	//changes. This will result in an optically indefinite flow
	animatedGradient.attr("x1","-75%")
		.attr("y1","0%")
		.attr("x2","25%")
		.attr("y2","0%")
		.attr("spreadMethod", "reflect");

	var colorsDuplicated = d3.range(numColors).concat(d3.range(numColors).reverse());
	colorsDuplicated = colorsDuplicated.concat(colorsDuplicated);
	
	animatedGradient.selectAll("stop") 
		.data(colorsDuplicated.concat(0))                  
		.enter().append("stop") 
		.attr("offset", function(d,i) { return Math.round( (i/(colorsDuplicated.length)*100) * 10 ) / 10 + "%"; })   
		.attr("stop-color", function(d,i) { return colorScale(d); });

	animatedGradient.append("animate")
		.attr("attributeName","x1")
		.attr("values","-75%;-25%")
		.attr("dur","7s")
		.attr("repeatCount","indefinite");

	animatedGradient.append("animate")
		.attr("attributeName","x2")
		.attr("values","25%;75%")
		.attr("dur","7s")
		.attr("repeatCount","indefinite");

	///////////////////////////////////////////////////////////////////////////
	////////////////////////// Create Gooey filter ////////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	//Code taken from http://tympanus.net/codrops/2015/03/10/creative-gooey-effects/
	var gooeyFilter = defs.append("filter").attr("id","gooeyIntro");
	gooeyFilter.append("feGaussianBlur")
		.attr("in","SourceGraphic")
		.attr("stdDeviation","8")
		.attr("result","blur");
	gooeyFilter.append("feColorMatrix")
		.attr("in","blur")
		.attr("mode","matrix")
		.attr("values","1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7")
		.attr("result","gooey");

	///////////////////////////////////////////////////////////////////////////
	/////////////////////////// Create Glow filter ////////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	//Filter for the outside glow
	var glowFilter = defs.append("filter").attr("id","glowIntroSlide"),
		feGaussianBlurGlow = glowFilter.append("feGaussianBlur").attr("stdDeviation","2").attr("result","coloredBlur"),
		feMergeGlow = glowFilter.append("feMerge"),
		feMergeNode_1 = feMergeGlow.append("feMergeNode").attr("in","coloredBlur"),
		feMergeNode_2 = feMergeGlow.append("feMergeNode").attr("in","SourceGraphic");

	///////////////////////////////////////////////////////////////////////////
	////////////////////// Place circles inside hexagon ///////////////////////
	///////////////////////////////////////////////////////////////////////////	

    //First append a group for the clip path, then a new group that can be transformed
	pt.hexagonShowcase.circleWrapper = svg.append("g")
		.attr("clip-path", "url(#clip")
		.style("clip-path", "url(#clip)") //make it work in safari
		.append("g")
		.style("isolation", "isolate")
		.attr("transform", "translate(" + (width/2) + "," + (height/2) + ")");

	//Rectangle for glow
	pt.hexagonShowcase.circleWrapper.append("rect")
		.attr("class", "glowBackgroundRect")
		.attr("x", -hexWidth)
		.attr("y", -hexHeight)
		.attr("width", hexWidth*2)
		.attr("height", hexHeight*2)
		.style("fill", "#262626")
		.style("opacity", 0);

    pt.hexagonShowcase.circle = pt.hexagonShowcase.circleWrapper.selectAll(".dots")
    	.data(randStart)
    	.enter().append("circle")
    	.attr("class", "dots")
    	.attr("cx", function(d) { return d.rHex * Math.cos(d.theta); })
    	.attr("cy", function(d) { return d.rHex * Math.sin(d.theta); })
      	.attr("r", 0)
      	.style("fill", "url(#gradientRainbowIntro)")
		.style("opacity", 0.7);

	///////////////////////////////////////////////////////////////////////////
	///////////////////////// Place Hexagon in center /////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	//Place a hexagon on the scene
	pt.hexagonShowcase.hexagonOutline = svg.append("path")
		.attr("class", "hexagon")
		.attr("d", "M" + (width/2) + "," + (height/2) + hexagonPath)
		.style("stroke", "#d8d8d8")
		.style("stroke-width", "7px")
		.style("fill", "none")
		.style("opacity", 0);

	///////////////////////////////////////////////////////////////////////////
	////////////////////////////// Create title ///////////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	pt.hexagonShowcase.title = svg.append("text")
		.attr("id", "title")
		.attr("x", width/2)
		.attr("y", height/2 + 70)
		.text("fresh data shapes");

	pt.hexagonShowcase.name = svg.append("text")
		.attr("id","name")
		.attr("x", width/2)
		.attr("y", height/2 - 30)
		.text("Nadieh Bremer");

	///////////////////////////////////////////////////////////////////////////
	///////////////////////////// Fade out title //////////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	//Hide title (in case you move in from the back)
	d3.selectAll("#hexagon-showcase #title, #hexagon-showcase #name")
		.style("opacity", 1);

	pt.hexagonShowcase.direction = "forward";
	pt.hexagonShowcase.fragment = "start";

}//init

pt.hexagonShowcase.setup = function() {

	//Move titles, in case you move backward
	pt.hexagonShowcase.name
		.style("opacity", 1)
		.transition().duration(1000)
		.attr("y", pt.hexagonShowcase.height/2 - 30)
		.style("font-size", 140);
	pt.hexagonShowcase.title
		.style("opacity", 1)
		.transition().duration(1000)
		.attr("y", pt.hexagonShowcase.height/2 + 70);

	//Hide the hexagon outline
	pt.hexagonShowcase.hexagonOutline
		.transition().duration(1000)
		.style("opacity", 0);

	//Stop circles and hide
	pt.hexagonShowcase.keepMoving = false;
	pt.hexagonShowcase.circle
		.transition("grow").duration(1000)
		.attr("r", 0);

}//setup

pt.hexagonShowcase.gradient = function() {

	//Move titles outward
	pt.hexagonShowcase.name
		.transition("move").duration(1500)
		.attr("y", pt.hexagonShowcase.height/2 - pt.hexagonShowcase.hexRadius - 60)
		.style("font-size", 90);
	pt.hexagonShowcase.title
		.transition().duration(1500)
		.attr("y", pt.hexagonShowcase.height/2 + pt.hexagonShowcase.hexRadius + 120);

	//Hide the titles after a certain time
	d3.selectAll("#hexagon-showcase #title, #hexagon-showcase #name")
		.style("opacity", 1)
		.transition().duration(2000).delay(8000)
		.style("opacity", 0);

	//Circles are allowed to move again
	pt.hexagonShowcase.keepMoving = true;

	//Start moving the circles
	pt.hexagonShowcase.circle.each(pt.hexagonShowcase.move);
	//Make the circles big
	pt.hexagonShowcase.circle
		.transition("grow")
		.duration(function(d,i) { return Math.random()*2000+500; })
		.delay(function(d,i) { return Math.random()*3000;})
		.attr("r", function(d,i) { return d.r; });

	//Show the hexagon outline
	pt.hexagonShowcase.hexagonOutline
		.style("opacity", 0)
		.transition().duration(2000)
		.style("opacity", 1);

	//Place gradient over circles
	pt.hexagonShowcase.circle
      	.style("fill", "url(#gradientRainbowIntro)")
      	.transition("changeSize").duration(1000)
      	.attr("r", function(d) { return d.r })
		.style("opacity", 0.8);

	//Stop gooey (in case you move backwards)
	pt.hexagonShowcase.circleWrapper.style("filter", null);

	if(pt.hexagonShowcase.direction === "forward") d3.select("#hexagon-showcase").attr("data-autoslide", 2700);

}//gradient

pt.hexagonShowcase.gooey = function( ) {

    pt.hexagonShowcase.circleWrapper.style("filter", "url(#gooeyIntro)");

    pt.hexagonShowcase.circle
    	.style("fill", "url(#gradientRainbowIntro)")
    	.style("mix-blend-mode", null)
    	.transition("changeSize").duration(1000)
      	.attr("r", function(d) { return 15 + Math.random() * 30; })
		.style("opacity", 1);

}//gooey

pt.hexagonShowcase.animated = function( ) {

	pt.hexagonShowcase.circleWrapper.style("filter", null);

	pt.hexagonShowcase.keepSliding = false;

	pt.hexagonShowcase.circle
      	.style("fill", "url(#animatedGradientIntroSlide)")
      	.style("mix-blend-mode", null)
      	.transition("changeOpacity").duration(1000)
      	.attr("r", function(d) { return d.r })
		.style("opacity", 0.9)

}//animated

pt.hexagonShowcase.slider = function( ) {

	pt.hexagonShowcase.circleWrapper.style("filter", null);

	pt.hexagonShowcase.keepSliding = true;

    pt.hexagonShowcase.circle
      	.style("fill", function(d,i) { return "url(#gradientSliderIntro-" + i + ")"; })
      	.transition("changeSize").duration(500)
      	.attr("r", function(d) { return d.r; })
		.style("opacity", 0.9);
	
	function moveGradient() {
		
		//Safari can only handle this function when loaded from local host
		if(is_safari) return;

		//Move the left side of the gradient
		d3.selectAll("#hexagonShowcase .left")
			.transition().duration(duration)
		    .attrTween("offset", function() { 
		    	return d3.interpolate(start, end); 
		    })
		    .call(endall, function() {
		    	d3.selectAll("#hexagonShowcase .left")
					.transition().duration(duration)
			    	.attrTween("offset", function() { 
			    		return d3.interpolate(end, start); 
		    		})
		    		.call(endall, function() {
		    			if(pt.hexagonShowcase.keepSliding) {
		    				moveGradient();
		    			}
		    		});
		    });

		//Move the right side of the gradient
		d3.selectAll("#hexagonShowcase .right")
			.transition().duration(duration)
		    .attrTween("offset", function() { 
		    	return d3.interpolate(start+range, end+range); 
		    })
		    .call(endall, function() {
		    	d3.selectAll("#hexagonShowcase .right")
					.transition().duration(duration)
			    	.attrTween("offset", function() { 
			    		return d3.interpolate(end+range, start+range); 
		    		});
		    });
	}//moveGradient

	var start = 0,
		range = 0.40,
		end = 1-range,
		duration = 1500;

	moveGradient();

}//slider

pt.hexagonShowcase.planet = function( ) {

	pt.hexagonShowcase.keepSliding = false;

	d3.select("#hexagonShowcase .glowBackgroundRect")
		.transition("changeColor").duration(500)
		.style("opacity", 0);

	pt.hexagonShowcase.circle
		.style("filter", null)
		.style("mix-blend-mode", null)
      	.style("fill", function(d,i) { return "url(#gradientPlanetIntro-" + i + ")"; })
      	.transition("changeSize").duration(500)
    	.attr("r", function(d) { return d.r })
		.style("opacity", 0.8);

}//planet

pt.hexagonShowcase.glow = function( ) {

	d3.select("#hexagonShowcase .glowBackgroundRect")
		.transition("changeColor").duration(500)
		.style("opacity", 1);

	pt.hexagonShowcase.circle
      	.style("filter", "url(#glowIntroSlide)")
      	.style("mix-blend-mode", null)
      	.style("fill", function(d,i) { return d.color; })
      	.transition("changeColor").duration(500)
      	.attr("r", function(d) { return d.r })
		.style("opacity", 0.9);

	pt.hexagonShowcase.fragment = "glow";

}//glow

pt.hexagonShowcase.colorBlend = function( ) {
    
    pt.hexagonShowcase.keepMoving = true;

    d3.select("#hexagonShowcase .glowBackgroundRect")
		.transition("changeColor").duration(500)
		.style("opacity", 0);

    pt.hexagonShowcase.circle
    	.style("mix-blend-mode", "multiply")
    	.style("filter", null)
    	.style("fill", function(d,i) { return d.color; })
    	.transition("changeSize").duration(500)
    	.attr("r", function(d) { return d.r })
		.style("opacity", 1);

	d3.select("#hexagon-showcase").attr("data-autoslide", 0);
	pt.hexagonShowcase.direction = "backward";

	//In case you move backward
	if(pt.hexagonShowcase.fragment === "start") {
		//Start moving the circles
		pt.hexagonShowcase.circle.each(pt.hexagonShowcase.move);
	}//if

	//Hide title (in case you move in from the back)
	d3.selectAll("#hexagon-showcase #title, #hexagon-showcase #name")
		.style("opacity", 0);

	//Hide the hexagon outline (in case you move in from the back)
	pt.hexagonShowcase.hexagonOutline
		.transition().duration(500)
		.style("opacity", 1);

	//Move titles outward (in case you move in from the back)
	pt.hexagonShowcase.title
		.transition().duration(1500)
		.attr("y", pt.hexagonShowcase.height/2 - pt.hexagonShowcase.hexRadius - 60);
	pt.hexagonShowcase.name
		.transition().duration(1500)
		.attr("y", pt.hexagonShowcase.height/2 + pt.hexagonShowcase.hexRadius + 120)
		.style("font-size", 70);

}//colorBlend


///////////////////////////////////////////////////////////////////////////
////////////////////// Circle movement inside hexagon /////////////////////
///////////////////////////////////////////////////////////////////////////	

//General idea from Maarten Lambrecht's block: http://bl.ocks.org/maartenzam/f35baff17a0316ad4ff6
pt.hexagonShowcase.move = function(d) {

	if(!pt.hexagonShowcase.keepMoving) return;

	var SQRT3 = Math.sqrt(3),
		hexRadius = pt.hexagonShowcase.hexRadius;

	var currentx = parseFloat(d3.select(this).attr("cx")),
	 	//currenty = parseFloat(d3.select(this).attr("cy")),
		radius = d.r;

	//Randomly define which quadrant to move next
	var sideX = currentx > 0 ? -1 : 1,
		sideY = Math.random() > 0.5 ? 1 : -1,
		randSide = Math.random();

	var newx,
		newy;

	//Move new locations along the vertical sides in 33% of the cases
	if (randSide > 0.66) {
		newx = sideX * 0.5 * SQRT3 * hexRadius - sideX*radius;
		newy = sideY * Math.random() * 0.5 * hexRadius - sideY*radius;
	} else {
		//Choose a new x location randomly, 
		//the y position will be calculated later to lie on the hexagon border
		newx = sideX * Math.random() * 0.5 * SQRT3 * hexRadius;
		//Otherwise calculate the new Y position along the hexagon border 
		//based on which quadrant the random x and y gave
		if (sideX > 0 && sideY > 0) {
			newy = hexRadius - (1/SQRT3)*newx;
		} else if (sideX > 0 && sideY <= 0) {
			newy = -hexRadius + (1/SQRT3)*newx;
		} else if (sideX <= 0 && sideY > 0) {
			newy = hexRadius + (1/SQRT3)*newx;
		} else if (sideX <= 0 && sideY <= 0) {
			newy = -hexRadius - (1/SQRT3)*newx;
		}//else

		//Take off a bit so it seems that the circles truly only touch the edge
		var offSetX = radius * Math.cos( 60 * Math.PI/180),
			offSetY = radius * Math.sin( 60 * Math.PI/180);
		newx = newx - sideX*offSetX;
		newy = newy - sideY*offSetY;
	}//else

	//Transition the circle to its new location
	d3.select(this)
		.transition("moveing")
		.duration(3000 + 4000*Math.random())
		.ease("linear")
		.attr("cy", newy)
		.attr("cx", newx)
		.each("end", pt.hexagonShowcase.move);

}//function move


