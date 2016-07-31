pt.exoplanets = pt.exoplanets || {};

pt.exoplanets.init = function(planets) {
	
	//Remove any existing svgs
	d3.select('#exo-planets #exoplanets svg').remove();

	///////////////////////////////////////////////////////////////////////////
	//////////////////// Set up and initiate svg containers ///////////////////
	///////////////////////////////////////////////////////////////////////////	

	var margin = {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0
	};
	
	pt.exoplanets.width = $(".slides").width() - margin.left - margin.right;
	pt.exoplanets.height = $(".slides").height() - margin.top - margin.bottom;
				
	//SVG container
	pt.exoplanets.svg = d3.select('#exo-planets #exoplanets')
		.append("svg")
		.attr("width", pt.exoplanets.width + margin.left + margin.right)
		.attr("height", pt.exoplanets.height + margin.top + margin.bottom);
		
	pt.exoplanets.container = pt.exoplanets.svg.append("g")
		.attr("transform", "translate(" + (margin.left + pt.exoplanets.width/2) + "," + (margin.top + pt.exoplanets.height/2) + ")");

	//Remove tooltip when clicking anywhere in body
	d3.select("#exoplanets")
		.on("click", function(d) { pt.exoplanets.stopTooltip = true; });

	///////////////////////////////////////////////////////////////////////////
	////////////////////// Star and planet variables //////////////////////////
	///////////////////////////////////////////////////////////////////////////

	//Planet orbit variables
	//The larger this is the more accurate the speed is
	pt.exoplanets.resolution = 1, //perhaps make slider?
	pt.exoplanets.speedUp = 300,//400,
	pt.exoplanets.au = 149597871, //km
	pt.exoplanets.radiusSun = 695800, //km
	pt.exoplanets.radiusJupiter = 69911, //km
	pt.exoplanets.phi = 0, //rotation of ellipses
	pt.exoplanets.radiusSizer = 6, //Size increaser of radii of planets
	pt.exoplanets.planetOpacity = 0.6;
	pt.exoplanets.stopTooltip = true;

	pt.exoplanets.storySpeedUp = 6;

	//Format with 2 decimals
	pt.exoplanets.formatSI = d3.format(".2f");

	//Create star in the Middle - scaled to the orbits
	//Radius of our Sun in these coordinates (taking into account size of circle inside image)
	var ImageWidth = pt.exoplanets.radiusSun/pt.exoplanets.au * 3000 * (2.7/1.5);
	pt.exoplanets.container.append("svg:image")
		.attr("x", -ImageWidth)
		.attr("y", -ImageWidth)
		.attr("class", "sun")
		.attr("xlink:href", "slides/slide_07/img/sun.png")
		.attr("width", ImageWidth*2)
		.attr("height", ImageWidth*2)
		.attr("text-anchor", "middle");	

	pt.exoplanets.setupPlanets(planets);

}//init

pt.exoplanets.setupPlanets = function(planets) {

	///////////////////////////////////////////////////////////////////////////
	///////////////////////////////// Colors //////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	//Create color gradient for planets based on the temperature of the star that they orbit
	var colors = ["#FB1108","#FD150B","#FA7806","#FBE426","#FCFB8F","#F3F5E7","#C7E4EA","#ABD6E6","#9AD2E1","#42A1C1","#1C5FA5", "#172484"];
	var colorScale = d3.scale.linear()
		  .domain([2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 14000, 20000, 30000]) // Temperatures
		  .range(colors);

	//Create the gradients for the planet fill
	//Radial gradient with the center at one end of the circle, as if illuminated from the side
	//A gradient is created for each planet and colored to the temperature of its star
	var gradientContainer = pt.exoplanets.container.append("defs");

	var gradientRadial = gradientContainer
		.selectAll("radialGradient").data(planets).enter()
		.append("radialGradient")
		.attr("cx", "50%")
		.attr("cy", "50%")
		.attr("r", "50%")
		.attr("fx", "0%")
		.attr("gradientUnits", "objectBoundingBox")
		.attr('id', function(d){return "gradientRadial-"+d.ID})

	gradientRadial.append("stop")
		.attr("offset", "0%")
		.attr("stop-color", function(d) {return d3.rgb(colorScale(d.temp)).brighter(1);});

	gradientRadial.append("stop")
		.attr("offset", "40%")
		.attr("stop-color", function(d) {return colorScale(d.temp);});
		 
	gradientRadial.append("stop")
		.attr("offset",  "100%")
		.attr("stop-color", function(d) {return d3.rgb(colorScale(d.temp)).darker(1.75);});

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// Create Scales ////////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	//Set scale for radius of circles
	var rScale = d3.scale.linear()
		.range([1, 20])
		.domain([0, d3.max(planets, function(d) { return d.Radius; })]);	

	///////////////////////////////////////////////////////////////////////////
	/////////////////////////// Plot and move planets /////////////////////////
	///////////////////////////////////////////////////////////////////////////

	//Drawing a line for the orbit
	var orbitsContainer = pt.exoplanets.container.append("g").attr("class","orbitsContainer");
	var orbits = orbitsContainer.selectAll("g.orbit")
					.data(planets).enter().append("ellipse")
					.attr("class", "orbit")
					.attr("cx", function(d) {return d.cx;})
					.attr("cy", function(d) {return d.cy;})
					.attr("rx", function(d) {return d.major;})
					.attr("ry", function(d) {return d.minor;})
					.style("fill", "#3E5968")
					.style("fill-opacity", 0)
					.style("stroke", "white")
					.style("stroke-opacity", 0);	

	//Drawing the planets			
	var planetContainer = pt.exoplanets.container.append("g").attr("class","planetContainer");
	var planets = planetContainer.selectAll("g.planet")
					.data(planets).enter()				
					.append("circle")
					.attr("class", "planet")
					.attr("r", function(d) {return pt.exoplanets.radiusSizer*d.Radius;})
					.attr("cx", function(d) {return d.x;})
					.attr("cy", function(d) {return d.y;})
					.style("fill", function(d){return "url(#gradientRadial-" + d.ID + ")";})
					.style("fill-opacity", pt.exoplanets.planetOpacity)
					.style("stroke-opacity", 0)
					.style("stroke-width", "3px")
					.style("stroke", "white")
					.on("mouseover", function(d, i) {
						pt.exoplanets.stopTooltip = false					
						pt.exoplanets.showTooltip(d);
						pt.exoplanets.showEllipse(d, i, 0.8);
					})
					.on("mouseout", function(d, i) {
						//pt.exoplanets.showEllipse(d, i, 0);
					});

	///////////////////////////////////////////////////////////////////////////
	//////////////////////////// Explanation Texts ////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	//The explanation text during the introduction
	pt.exoplanets.textTop = pt.exoplanets.container.append("text")
		.attr("class", "explanation")
		.attr("x", 0 + "px")
		.attr("y", -70 + "px")
		.attr("dy", "1em")
		.style("fill","white")
		.attr("opacity", 0)
		.text("");   

	///////////////////////////////////////////////////////////////////////////
	///////////////////////////// Progress circle /////////////////////////////
	///////////////////////////////////////////////////////////////////////////

	//Draw the progress circle
	//Create a small icon that starts when an animation is going on
	pt.exoplanets.progressWrapper = pt.exoplanets.container.append("g")
			.attr("class", "progressWrapper")
			.attr("transform", "translate(0,-220)")
			.style("pointer-events", "none");

	//Circle in the back so the whole thing becomes clickable
	pt.exoplanets.progressWrapper.append("circle")
		.attr("r", 12)
		.style("opacity", 0.01);
		
	//Create the play button
	pt.exoplanets.progressWrapper.append("path")
		.attr("class", "play")
		.attr("d", d3.svg.symbol().type("triangle-up").size(35))
		.style("fill","#3B3B3B")
		.attr("transform", "translate(1,0) rotate(90)")
		.style("opacity", 0);

	//Create the arc around the play button
	pt.exoplanets.progressWrapper.append("path")
		.datum({startAngle: 0,endAngle: 2*Math.PI})
		.attr("class", "playCircle")
		.style("fill", "white")
		.style("opacity", 0);


	pt.exoplanets.counter = 1;
	//Order of steps when clicking button
	d3.select(".progressWrapper")      
		.on("click", function(e){

			if(pt.exoplanets.counter === 1) pt.exoplanets.draw1();
			else if(pt.exoplanets.counter === 2) pt.exoplanets.draw2();
			else if(pt.exoplanets.counter === 3) pt.exoplanets.draw3();
			else if(pt.exoplanets.counter === 4) pt.exoplanets.draw4();
			else if(pt.exoplanets.counter === 5) pt.exoplanets.draw5();
			else if(pt.exoplanets.counter === 6) pt.exoplanets.draw6();
			
			pt.exoplanets.counter += 1;
		});

	///////////////////////////////////////////////////////////////////////////
	//////////////////////// Make the planets rotate //////////////////////////
	///////////////////////////////////////////////////////////////////////////

	//Change x and y location of each planet
	pt.exoplanets.keepPlanetsRotating = false;
	d3.timer(function() {       		
		//Move the planet - DO NOT USE TRANSITION
		d3.selectAll(".planet")
			.attr("cx", pt.exoplanets.locate("x"))
			.attr("cy", pt.exoplanets.locate("y"))
			.attr("transform", function(d) {
				return "rotate(" + (d.theta%360) + "," + d.x + "," + d.y + ")";
			});		

		return pt.exoplanets.keepPlanetsRotating;		
	});

	pt.exoplanets.direction = "forward";

}//setupPlanets

pt.exoplanets.rotatePlanets = function() {

	pt.exoplanets.speedUp = 400;

	//Bring all planets back
	pt.exoplanets.bringBack(opacity = pt.exoplanets.planetOpacity, delayTime = 1); 

	//Loop through tooltips
	pt.exoplanets.tooltipLoop();
}

///////////////////////////////////////////////////////////////////////////
//////////////////////// Storytelling steps ///////////////////////////////
///////////////////////////////////////////////////////////////////////////	

pt.exoplanets.draw0 = function() {

	pt.exoplanets.storySpeedUp = 6;

	//Make the tooltips stop
	clearInterval(pt.exoplanets.randomExoplanet);

	//Speed up for the slides
	pt.exoplanets.speedUp = 100;

	//Stop any visible tooltips that might still be there
	pt.exoplanets.stopTooltip = true;

	//Remove event listeners during examples
	pt.exoplanets.removeEvents();
							
	//Start
	pt.exoplanets.startCircle(time = 29/pt.exoplanets.storySpeedUp);
	
	pt.exoplanets.changeText("Let me introduce you to this chaos of exoplanets that orbit many " + 
			   "different stars in our Milky Way", 
				delayDisappear = 0/pt.exoplanets.storySpeedUp, delayAppear = 1/pt.exoplanets.storySpeedUp);
	//Dim all planets
	pt.exoplanets.dim(delayTime = 0/pt.exoplanets.storySpeedUp);
	
	//Highlight the biggest planet
	pt.exoplanets.highlight(235, delayTime=8/pt.exoplanets.storySpeedUp);
				
	pt.exoplanets.changeText("Here we have WASP-12 b, one of the biggest planets in our dataset. " +
			   "Its radius is more than 20x bigger than Earth", 
				delayDisappear = 7/pt.exoplanets.storySpeedUp, delayAppear = 8/pt.exoplanets.storySpeedUp);


	pt.exoplanets.changeText("As comparison, here we have Kepler-68 c, which is about the same size as Earth. " + 
			   "It's so small in comparison to the rest that you can barely see it",
				delayDisappear = 16/pt.exoplanets.storySpeedUp, delayAppear = 17/pt.exoplanets.storySpeedUp);
				
	//Highlight an Earth like chosen planet
	pt.exoplanets.highlight(215, delayTime = 17/pt.exoplanets.storySpeedUp);

	pt.exoplanets.changeText("As a note, although the sizes of the planet are scaled, and the orbits are scaled, " + 
			   "they are not scaled to each other. Otherwise most planets would become smaller than " +
			   "a pixel if I keep them on these orbits. ",
				delayDisappear = 27/pt.exoplanets.storySpeedUp, delayAppear = 28/pt.exoplanets.storySpeedUp);

	if(pt.exoplanets.direction === "forward") {
		d3.select("#exo-planets").attr("data-autoslide", 700*32/pt.exoplanets.storySpeedUp);
	}//if

}//function Draw0

//Scaling radii	
pt.exoplanets.draw1 = function() {

	d3.select("#exo-planets").attr("data-autoslide", 0);

	pt.exoplanets.storySpeedUp = 2;

	pt.exoplanets.startCircle(time = 5/pt.exoplanets.storySpeedUp);
	
	pt.exoplanets.changeText("Scaling the planetary radii to the orbits would give you this result. " +
			   "(The star in the center was already scaled to our Sun)",
				delayDisappear = 0/pt.exoplanets.storySpeedUp, delayAppear = 3/pt.exoplanets.storySpeedUp);
				
	//Dim all planets
	pt.exoplanets.dim(delayTime = 0/pt.exoplanets.storySpeedUp);
	//Bring all planets back
	pt.exoplanets.bringBack(opacity = pt.exoplanets.planetOpacity, delayTime = 1/pt.exoplanets.storySpeedUp); 
		
	//Scale to the new radius
	d3.selectAll(".planet")
		.transition().delay(700 * 2 / pt.exoplanets.storySpeedUp).duration(2000/pt.exoplanets.storySpeedUp)
		.attr("r", function(d) {
			var newRadius = pt.exoplanets.radiusJupiter/pt.exoplanets.au*3000*d.Radius;
			if  (newRadius < 1) {return 0;}
			else {return newRadius;}
		});

	if(pt.exoplanets.direction === "forward") {
		d3.select("#exo-planets").attr("data-autoslide", 6000/pt.exoplanets.storySpeedUp);
	}//if

}//function Draw1

//Radius of orbit
pt.exoplanets.draw2 = function() {

	d3.select("#exo-planets").attr("data-autoslide", 0);

	pt.exoplanets.storySpeedUp = 6;

	pt.exoplanets.startCircle(time = 26/pt.exoplanets.storySpeedUp);
	
	//Dim all planets again
	pt.exoplanets.dim(delayTime = 0/pt.exoplanets.storySpeedUp);
	//Make planets bigger again
	d3.selectAll(".planet")
		.transition().delay(700 * 1 / pt.exoplanets.storySpeedUp).duration(1500/pt.exoplanets.storySpeedUp)
		.attr("r", function(d) {return pt.exoplanets.radiusSizer * d.Radius;});		

	//Highlight the biggest planet
	pt.exoplanets.highlight(235, delayTime = 4/pt.exoplanets.storySpeedUp);
	pt.exoplanets.changeText("Let's get back to WASP-12 b. The distance to the star it orbits is only 2% of the distance " +
			   "between the Earth and the Sun",
				delayDisappear = 0/pt.exoplanets.storySpeedUp, delayAppear = 3/pt.exoplanets.storySpeedUp);

	pt.exoplanets.changeText("The distance between the Earth and the Sun is 150 million kilometers " +
			   "and is called an Astronomical Unit, or 'au'. Thus the distance of WASP-12 b to its star is 0.02 au",
				delayDisappear = 12/pt.exoplanets.storySpeedUp, delayAppear = 13/pt.exoplanets.storySpeedUp);

	pt.exoplanets.changeText("This is extremely close. Even Mercury, the planet closest to our Sun, is stil 0.3 au away, which " +
			   "would not fit on most regular screen sizes ",
				delayDisappear = 24/pt.exoplanets.storySpeedUp, delayAppear = 25/pt.exoplanets.storySpeedUp);	

	if(pt.exoplanets.direction === "forward") {
		d3.select("#exo-planets").attr("data-autoslide", 700*30/pt.exoplanets.storySpeedUp);
	}//if

}//Draw2

//Orbital period
pt.exoplanets.draw3 = function() {

	d3.select("#exo-planets").attr("data-autoslide", 0);

	pt.exoplanets.startCircle(time = 18/pt.exoplanets.storySpeedUp);
	
	pt.exoplanets.changeText("The planets you see here are quite different from Earth because of more reasons. " +
			   "The average time it takes these 288 planets to go around their star is only 17 Earth days! ",
				delayDisappear = 0/pt.exoplanets.storySpeedUp, delayAppear = 1/pt.exoplanets.storySpeedUp);

	pt.exoplanets.changeText("WASP-12 b goes around in just 26 hours",
				delayDisappear = 11/pt.exoplanets.storySpeedUp, delayAppear = 12/pt.exoplanets.storySpeedUp);	
				
	//Highlight an Earth like chosen planet
	pt.exoplanets.highlight(215, delayTime = 16/pt.exoplanets.storySpeedUp);
	pt.exoplanets.changeText("and Kepler-68 c in almost 10 days",
				delayDisappear = 16/pt.exoplanets.storySpeedUp, delayAppear = 17/pt.exoplanets.storySpeedUp);			

	if(pt.exoplanets.direction === "forward") {
		d3.select("#exo-planets").attr("data-autoslide", 700*25/pt.exoplanets.storySpeedUp);
	}//if

}//Draw3
		

//Elliptical orbits - Circles
pt.exoplanets.draw4 = function() {	

	d3.select("#exo-planets").attr("data-autoslide", 0);

	//Start progress button
	pt.exoplanets.startCircle(time = 22/pt.exoplanets.storySpeedUp);
	
	pt.exoplanets.changeText("Both of the planets highlighted now are on very circular orbits. " +
			   "However, this is not always the case",
				delayDisappear = 0/pt.exoplanets.storySpeedUp, delayAppear = 1/pt.exoplanets.storySpeedUp);	
				
	pt.exoplanets.changeText("Most orbits are shaped more like stretched out circles: ellipses. " +
			   "The 'eccentricity' describes how round or how stretched out an ellipse is",
				delayDisappear = 10/pt.exoplanets.storySpeedUp, delayAppear = 11/pt.exoplanets.storySpeedUp);

	pt.exoplanets.changeText("If the eccentricity is close to 0, the ellipse is more like a circle, " +
			   "like our planets here. However, if the eccentricity is close to 1, " +
			   "the ellipse is long and skinny",
				delayDisappear = 20/pt.exoplanets.storySpeedUp, delayAppear = 21/pt.exoplanets.storySpeedUp);
		
	if(pt.exoplanets.direction === "forward") {
		d3.select("#exo-planets").attr("data-autoslide", 700*26/pt.exoplanets.storySpeedUp);
	}//if		
}//Draw4	

//Elliptical orbits 
pt.exoplanets.draw5 = function() {

	d3.select("#exo-planets").attr("data-autoslide", 0);

	//Start progress button
	pt.exoplanets.startCircle(time = 10/pt.exoplanets.storySpeedUp);
	
	pt.exoplanets.changeText("Here we have Kepler-75 b, which is already on a very stretched orbit. " +
			   "Its eccentricity is 0.57",
				delayDisappear = 1/pt.exoplanets.storySpeedUp, delayAppear = 2/pt.exoplanets.storySpeedUp, xloc=200, yloc = -24*1);
				
	//Dim all planets again
	pt.exoplanets.dim(delayTime = 0/pt.exoplanets.storySpeedUp);
	
	//Highlight elliptical orbit
	pt.exoplanets.highlight(237, delayTime = 2/pt.exoplanets.storySpeedUp);

	pt.exoplanets.changeText("Let me speed things up a bit. Do you see that the planet is moving faster " +
			   "when it is close to the star? If you want to know why that happens, " +
			   "please look up Kepler's 2nd law",
				delayDisappear = 8/pt.exoplanets.storySpeedUp, delayAppear = 9/pt.exoplanets.storySpeedUp, xloc=200, yloc = -24*2);
	
	//In case you move backward
	pt.exoplanets.removeEvents();
	//Make the tooltips stop
	clearInterval(pt.exoplanets.randomExoplanet);

	//Show the progress wrapper - in case you move backward
	d3.select(".progressWrapper")
		.transition().delay(0).duration(500)
		.style("opacity", 1);
	
	setTimeout(function() { pt.exoplanets.speedUp = 50; }, 700*8/pt.exoplanets.storySpeedUp);
			
}//draw5

//Finish story
pt.exoplanets.draw6 = function() {

	//No more speed up
	pt.exoplanets.storySpeedUp = 1;

	//Remove text
	pt.exoplanets.changeText("", delayDisappear = 0, delayAppear = 1);

	//Bring back events
	pt.exoplanets.resetEvents();

	//Return planets to original speed
	pt.exoplanets.speedUp = 400;
	
	//Bring all planets back
	pt.exoplanets.bringBack(opacity = pt.exoplanets.planetOpacity, delayTime = 1); 

	//Hide the progress wrapper
	d3.select(".progressWrapper")
		.transition().delay(0).duration(1000)
		.style("opacity", 0);

	//Loop through tooltips
	pt.exoplanets.tooltipLoop();

	pt.exoplanets.direction === "backward";
	d3.select("#exo-planets").attr("data-autoslide", 0);
		
}//draw6


//Randomly show and hide exoplanets with orbits and tooltips
pt.exoplanets.tooltipLoop = function() {

	pt.exoplanets.randomExoplanet = setInterval(function () {
		pt.exoplanets.stopTooltip = true

		var chosenPlanet = Math.max(0, Math.round(Math.random()*planets.length) - 1);

		setTimeout(function() { 
			pt.exoplanets.stopTooltip = false;
			pt.exoplanets.showTooltip("none", chosenPlanet);
		}, 100);							
		
		pt.exoplanets.showEllipse("none", chosenPlanet, 1);

		//pt.exoplanets.highlight(chosenPlanet);

	}, 1500);

}//tooltipLoop

///////////////////////////////////////////////////////////////////////////
/////////////////////////// Show the tooltip //////////////////////////////
///////////////////////////////////////////////////////////////////////////	

//Show the tooltip on hover
pt.exoplanets.showTooltip = function(d, i) {	

	if( typeof i !== "undefined") {
		d = planets[i];
	} else {
		//Show how to close tooltip
		d3.select("#tooltipInfo").style("visibility", "visible");
	}//else
	
	//Make a different offset for really small planets
	//var Offset = (rScale(d.Radius)/2 < 2) ? 3 : rScale(d.Radius)/2;
	var xOffset = (10*d.Radius)/2;
	var yOffset = (10*d.Radius)/2;

	//Set first location of tooltip and change opacity
	var xpos = d.x + pt.exoplanets.width/2 - xOffset;
	var ypos = d.y + pt.exoplanets.height/2 - yOffset;
	  
	d3.select("#tooltip")
		.style('top',ypos+"px")
		.style('left',xpos+"px")
		.transition().duration(500)
		.style('opacity',1);
		
	//Keep the tooltip moving with the planet, until stopTooltip 
	//returns true (when the user clicks)
	d3.timer(function() { 
	  xpos = d.x + pt.exoplanets.width/2 - xOffset - ((10*d.Radius)/2 < 3 ? 10 : 5);
	  ypos = d.y + pt.exoplanets.height/2 - yOffset;
	  
	 //Keep changing the location of the tooltip
	 d3.select("#tooltip")
		.style('top', ypos + "px")
		.style('left', xpos + "px");
	
		//Breaks from the timer function when stopTooltip is changed to true
		//by another function
		if (pt.exoplanets.stopTooltip == true) { 
			//Hide tooltip info again
			d3.select("#tooltipInfo").style("visibility", "hidden");
			//Hide tooltip
			d3.select("#tooltip").transition().duration(300)
				.style('opacity',0)
				.call(endall, function() { //Move tooltip out of the way
					d3.select("#tooltip")
						.style('top', 0 + "px")
						.style('left', 0 + "px");
				});	
			//Remove show how to close
			return pt.exoplanets.stopTooltip;
		}
	});

	//Change the texts inside the tooltip
	d3.select("#tooltip .tooltip-planet").text(d.name);
	d3.select("#tooltip .tooltip-year").html("Discovered in: " + d.discovered);
	//d3.select("#tooltip-class").html("Temperature of star: " + d.temp + " Kelvin");
	d3.select("#tooltip-period").html("Orbital period: " + pt.exoplanets.formatSI(d.period) + " days");
	d3.select("#tooltip-eccen").html("Eccentricity of orbit: " + d.e);
	d3.select("#tooltip-radius").html("Radius of planet: " + pt.exoplanets.formatSI(d.Radius * 11.209 ) + " Earth radii");
	d3.select("#tooltip-dist").html("Approx. distance to its Star: " + pt.exoplanets.formatSI(d.major/3000) + " au");
}//showTooltip

///////////////////////////////////////////////////////////////////////////
//////////////////// Star and progress the timer button ///////////////////
///////////////////////////////////////////////////////////////////////////	

pt.exoplanets.startCircle = function(time) {

	//Initiate the progress Circle
	var arc = d3.svg.arc()
		.innerRadius(10)
		.outerRadius(12);

	//Stop click event
	d3.select(".progressWrapper")
		.style("pointer-events", "none");
		
	//Dim the play button
	d3.selectAll(".play")
		.transition().delay(0).duration(500/pt.exoplanets.storySpeedUp)
		.style("opacity", 1)
		.style("fill","#3B3B3B")
		.transition().delay(700 * time)
		.style("fill","white");

	//Run the circle and at the end 
	d3.selectAll(".playCircle")
		.style("opacity", 1)
		.transition().duration(700 * time).ease("linear")
		.attrTween("d", function(d) {
		   var i = d3.interpolate(d.startAngle, d.endAngle);
		   return function(t) {
				d.endAngle = i(t);
				return arc(d);
		   }//return
		})
		.call(endall, function() {
			d3.select(".progressWrapper")
				.style("pointer-events", "auto");
		});
}//startCircle

///////////////////////////////////////////////////////////////////////////
///////////////////////// Change the visible text /////////////////////////
///////////////////////////////////////////////////////////////////////////	

//Change the text during introduction
pt.exoplanets.changeText = function(newText, delayDisappear, delayAppear, xloc, yloc, finalText) {

	//If finalText is not provided, it is not the last text of the Draw step
	if(typeof(finalText)==='undefined') finalText = false;
	
	if(typeof(xloc)==='undefined') xloc = 0;
	if(typeof(yloc)==='undefined') yloc = -200;

	var time = 700/pt.exoplanets.storySpeedUp;
	
	pt.exoplanets.textTop	
		//Current text disappear
		.transition().delay(700 * delayDisappear).duration(time)
		.attr('opacity', 0)	
		//New text appear
		.call(endall,  function() {
			pt.exoplanets.textTop.text(newText)
				.attr("y", yloc + "px")
				.attr("x", xloc + "px")
				.call(wrap, 300);	
		})
		.transition().delay(700 * delayAppear).duration(time)
		.attr('opacity', 1);
}//changeText 

///////////////////////////////////////////////////////////////////////////
//////////////////////// Planet helper functions //////////////////////////
///////////////////////////////////////////////////////////////////////////

//Calculate the new x or y position per planet
pt.exoplanets.locate = function(coord) {
	return function(d){
		var k = 360 * d.major * d.minor / (d.period * pt.exoplanets.resolution * pt.exoplanets.speedUp);
		
		for (var i = 0; i < pt.exoplanets.resolution; i++) {
			d.theta += k / (d.r * d.r);
			d.r = d.major * (1 - d.e * d.e) / (1 - d.e * Math.cos(toRadians(d.theta)));   
		}// for
				
		var x1 = d.r * Math.cos(toRadians(d.theta)) - d.focus;
		var y1 = d.r * Math.sin(toRadians(d.theta));
		
		if (d.theta > 360) {d.theta -= 360;}
				
		if (coord == "x") {
			//New x coordinates
			newX = d.cx + x1 * Math.cos(toRadians(pt.exoplanets.phi)) - y1 * Math.sin(toRadians(pt.exoplanets.phi));
			d.x = newX;
			return newX;
		} else if (coord == "y") {
			newY = d.cy + x1 * Math.sin(toRadians(pt.exoplanets.phi)) + y1 * Math.cos(toRadians(pt.exoplanets.phi));
			d.y = newY;
			return newY;
		}
	};
}//locate

//Show the total orbit of the hovered over planet
pt.exoplanets.showEllipse = function(d, i, opacity) {
		var planet = i;
		//console.log(d);
		//var duration = (opacity == 0 ? 2000 : 100) / pt.exoplanets.storySpeedUp; //If the opacity is zero slowly remove the orbit line
		
		//Highlight the chosen planet
		d3.selectAll(".planet")
			.filter(function(d, i) {return i == planet;})
			.transition().duration(100)
			.style("stroke-opacity", opacity * 1.25)
			.style("fill-opacity", 1)
			.transition().duration(2000).delay(3000)
			.style("stroke-opacity", 0)
			.style("fill-opacity", pt.exoplanets.planetOpacity);
		
		//Select the orbit with the same index as the planet
		d3.selectAll(".orbit")
			.filter(function(d, i) {return i == planet;})
			.transition().duration(100)
			.style("stroke-opacity", opacity)
			.style("fill-opacity", opacity/3)
			.transition().duration(2000).delay(3000)
			.style("stroke-opacity", 0)
			.style("fill-opacity", 0);
}//showEllipse	

//Highlight the chosen planet and its orbit
pt.exoplanets.highlight = function(planet, delayTime){
	if(typeof(delayTime)==='undefined') delayTime = 0;
	//if(typeof(tooltip)==='undefined') tooltip = true;
	var time = 1000/pt.exoplanets.storySpeedUp;
	
	//Highlight the chosen planet
	d3.selectAll(".planet")
		.filter(function(d, i) {return i == planet;})
		.transition().delay(700 * delayTime).duration(time)
		.style("stroke-opacity", 1)
		.style("fill-opacity", 1);
	
	//Select the orbit with the same index as the planet
	d3.selectAll(".orbit")
		.filter(function(d, i) {return i == planet;})
		.transition().delay(700 * delayTime).duration(time)
		.style("stroke-opacity", 0.8)
		.style("fill-opacity", 0.2);
}//highlight


//Function to bring opacity back of all planets
pt.exoplanets.bringBack = function(opacity, delayTime){
	if(typeof(delayTime)==='undefined') delayTime = 0;
	var time = 500/pt.exoplanets.storySpeedUp;
	
	//Change opacity of all
	d3.selectAll(".planet")
		.transition().delay(700 * delayTime).duration(time)
		.style("stroke-opacity", 0)
		.style("fill-opacity", opacity);

	//Hide orbits
	//Select the orbit with the same index as the planet
	d3.selectAll(".orbit")
		.transition().delay(700 * delayTime).duration(time)
		.style("stroke-opacity", 0)
		.style("fill-opacity", 0);
}//bringBack


// //Dim all other planets (and orbits)
// pt.exoplanets.dimOne = function(planet, delayTime) {
// 	if(typeof(delayTime)==='undefined') delayTime = 0;
// 	var time = 500/pt.exoplanets.storySpeedUp;
	
// 	//Dim all other planets
// 	d3.selectAll(".planet")
// 		.filter(function(d, i) {return i == planet;})
// 		.transition().delay(700 * delayTime).duration(time)
// 		.style("stroke-opacity", 0)
// 		.style("opacity", 0.1);	
		
// 	//Select the orbit with the same index as the planet
// 	d3.selectAll(".orbit")
// 		.filter(function(d, i) {return i == planet;})
// 		.transition().delay(700 * delayTime).duration(time)
// 		.style("stroke-opacity", 0)
// 		.style("fill-opacity", 0);	
// }//dimOne


//Dim all planets (and orbits)
pt.exoplanets.dim = function(delayTime) {
	if(typeof(delayTime)==='undefined') delayTime = 0;
	var time = 1000/pt.exoplanets.storySpeedUp;
	
	//Dim all other planets
	d3.selectAll(".planet")
		.transition().delay(700 * delayTime).duration(time)
		.style("stroke-opacity", 0)
		.style("fill-opacity", 0.1);	
		
	//Select the orbit with the same index as the planet
	d3.selectAll(".orbit")
		.transition().delay(700 * delayTime).duration(time)
		.style("stroke-opacity", 0)
		.style("fill-opacity", 0);	
}//dim

///////////////////////////////////////////////////////////////////////////
//////////////////////// Set / hide interactivity /////////////////////////
///////////////////////////////////////////////////////////////////////////

//Remove all events
pt.exoplanets.removeEvents = function() {
	//Remove event listeners during examples
	d3.selectAll('.planet').on('mouseover', null).on('mouseout', null);
	d3.select("svg").on("click", null);
}//removeEvents
	
//Reset all events
pt.exoplanets.resetEvents = function() {	
	//Replace planet events
	d3.selectAll('.planet')
		.on("mouseover", function(d, i) {
			pt.exoplanets.stopTooltip = false					
			pt.exoplanets.showTooltip(d);
			pt.exoplanets.showEllipse(d, i, 0.8);
		})
		.on("mouseout", function(d, i) {
			pt.exoplanets.showEllipse(d, i, 0);
		});
		
	//Replace click event
	d3.select("#exoplanets")
		.on("click", function(d) { pt.exoplanets.stopTooltip = true; });
}//resetEvents

