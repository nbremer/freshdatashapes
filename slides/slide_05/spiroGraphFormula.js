pt.spiroGraphFormula = pt.spiroGraphFormula || {};

pt.spiroGraphFormula.init = function() {
	
	//Remove any existing svgs
	d3.select('#spiro-graph-formula #spiroGraphFormula svg').remove();

	///////////////////////////////////////////////////////////////////////////
	//////////////////// Set up and initiate svg containers ///////////////////
	///////////////////////////////////////////////////////////////////////////	

	var margin = {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0
	};
	
	var width = $(".slides").width() - margin.left - margin.right;
	pt.spiroGraphFormula.width = width;
	var height = $(".slides").height() - margin.top - margin.bottom - 60;
	pt.spiroGraphFormula.height = height;
				
	//SVG container
	pt.spiroGraphFormula.svg = d3.select('#spiro-graph-formula #spiroGraphFormula')
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("class","spiroWrapper")
		.style("filter","url(#glow)")
		.attr("transform", "translate(" + (margin.left) + "," + (margin.top) + ")");
	
	///////////////////////////////////////////////////////////////////////////
	///////////////////////////// Create filter ///////////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	//SVG filter for the glow effect
	var defs = pt.spiroGraphFormula.svg.append("defs");

	//Filter for the outside glow
	var filter = defs.append("filter").attr("id","glow"),
		feGaussianBlur = filter.append("feGaussianBlur").attr("stdDeviation","2").attr("result","coloredBlur"),
		feMerge = filter.append("feMerge"),
		feMergeNode_1 = feMerge.append("feMergeNode").attr("in","coloredBlur"),
		feMergeNode_2 = feMerge.append("feMergeNode").attr("in","SourceGraphic");
    

	///////////////////////////////////////////////////////////////////////////
	///////////////////////// Set-up other things /////////////////////////////
	///////////////////////////////////////////////////////////////////////////	
		
	pt.spiroGraphFormula.line = d3.svg.line()
		.x(function(d) { return d.x; })
		.y(function(d) { return d.y; });

}//init

pt.spiroGraphFormula.resetOpacity = function() {
	
	//Show everything (in case you move backward)
	d3.selectAll("#spiro-graph-formula .formula")
		.transition().duration(250)
		.style("color", "#adadad");

	d3.select("#formulaWrapper")
		.transition().duration(500)
		.style("opacity", 1);

	d3.select(".slide-background.stack.present").selectAll(".slide-background.present")
		.style("background-image", "none");

	// d3.select(".spiro-img")
	// 	.transition().duration(500)
	// 	.style("opacity", 1);

}//resetOpacity

pt.spiroGraphFormula.showSpiros = function() {

	//Make formula less visible
	d3.selectAll("#spiro-graph-formula .formula")
		.transition().duration(750)
		.style("color", "#e2e2e2");

	//Change the background
	setTimeout(function() {
		d3.select("#formulaWrapper")
			.transition().duration(1000)
			.style("opacity", 0);

		d3.select(".slide-background.stack.present").selectAll(".slide-background.present")
			.style("background-image", "url('slides/slide_05/spiro-background.png')");
		}, 1000);

	// d3.select(".spiro-img")
	// 	.transition().duration(1000).delay(7000)
	// 	.style("opacity", 0);

	//Calculate and draw the spirographs
	setTimeout(pt.spiroGraphFormula.drawSpiros,500);

}//showSpiros


pt.spiroGraphFormula.calculateHypocycloid = function(R, r, rho, alpha, length, start) {
    //Function adjusted from: https://github.com/rho2k/HTML5Demos/blob/master/Canvas/spiroGraph.html
	
    var numTheta = typeof length === "undefined" ? 10000 : length;
	var startNum = typeof start === "undefined" ? 1 : start;

    alpha = alpha * Math.PI / 180;

    var x0 = 5e5, 
    	y0 = 5e5;
    
    //Create the x and y coordinates for the spirograph and put these in a variable
	var lineData = [];
    for(var theta = startNum; theta < (startNum+numTheta); theta += 1){
        var t = (Math.PI / 180) * theta ;
        var x = (R-r) * Math.cos(t + alpha) + rho * r * Math.cos( (R-r)/r * t - alpha ) ;
        var y = (R-r) * Math.sin(t + alpha) - rho * r * Math.sin( (R-r)/r * t - alpha) ;
		
        lineData.push({x: x, y: y});   

        //Break out of the loop when you reach the starting location again
        //no use to run over the same loop again
        if( Math.abs(x - x0) < 1e-1 && Math.abs(y - y0) < 1e-1 && theta > startNum + 100 ) {
        	break;
        }//if

        //Set the start location
        if(theta === startNum) {
        	x0 = x;
        	y0 = y;
        }//if                            
    } //for theta
	
	//Output the variables of this spiro         
	//console.log("R/n: " + R + ", r/m: " + r + ", rho/r: " + rho + ", start: ", + start + ", steps: ", steps);
	
	return lineData;
}//function calculateHypocycloid

//Plot a spirograph
pt.spiroGraphFormula.addHypo = function( R, r, rho, alpha, color, thickness, length, start, translation, duration, delay ) {

	var offset = typeof translation === "undefined" ? [0,0] : translation;

	pt.spiroGraphFormula.svg.append("path")
		.attr("class", "spirograph")
		.attr("transform", "translate(" + offset[0] + "," + offset[1] + ")" )
		.attr("d", pt.spiroGraphFormula.line(pt.spiroGraphFormula.calculateHypocycloid(R, r, rho, alpha, length, start)) )
		.style("mix-blend-mode", "multiply")
		.style("stroke-linecap", "round")
		.style("stroke-width", typeof thickness === "undefined" ? 4 : thickness)
		.style("stroke", color)
		.style("opacity", 0)
		.transition().duration(duration).delay(delay)
		.style("opacity", 1);

}//addHypo

//Plot a spirograph
pt.spiroGraphFormula.drawSpiros = function() {

	//var colors = ["#2c7bb6", "#00a6ca","#00ccbc","#53D86A","#FFDC1E","#E76818","#d7191c","#ED008C","#760AAE"];	

	for (var i = 0; i < 100; i++) {

		var R = getRandomNumber(15, 100);
		var r = getRandomNumber(2, (R * 0.95));
		var rho = Math.random() + Math.random();
		var alpha = getRandomNumber(0, 10);

		//Randomly place the spirograph on the page
		var translation = [getRandomNumber(0, pt.spiroGraphFormula.width), getRandomNumber(0, pt.spiroGraphFormula.height)];

		//Use the location of the center to find a color
		var color = pt.spiroGraphFormula.yiq2rgb(0.6, 
			translation[0]/pt.spiroGraphFormula.width - 0.5 + Math.random()/10 * (Math.random() > 0.5 ? 1 : -1), 
			translation[1]/pt.spiroGraphFormula.height - 0.5 + Math.random()/10 * (Math.random() > 0.5 ? 1 : -1));
		//colors[ i%colors.length ];
		
		var thickness = Math.random();

		var length = getRandomNumber(0, 10e3) + 5000;
		var start = getRandomNumber(0, 10e3);

		//Draw the spirographs
		pt.spiroGraphFormula.addHypo( R, r, rho, alpha, color, thickness, length, start, translation, 1000, i*40 );

	}//for i

}//drawSpiros

//Convert from YIQ space to RGB
pt.spiroGraphFormula.yiq2rgb = function(y,i,q){

  // matrix transform
	var r = (y + ( 0.956 * i) + ( 0.621 * q)) * 255;
	var g = (y + (-0.272 * i) + (-0.647 * q)) * 255;
	var b = (y + (-1.105 * i) + ( 1.702 * q)) * 255;
  // bounds-checking
	if (r < 0){ r=0; } else if (r > 255){ r = 255};
	if (g < 0){ g=0; } else if (g > 255){ g = 255};
	if (b < 0){ b=0; } else if (b > 255){ b = 255};
  return d3.rgb(r, g, b);

}//yiq2rgb


