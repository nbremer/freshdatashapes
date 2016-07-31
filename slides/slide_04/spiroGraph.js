pt.spiroGraph = pt.spiroGraph || {};

pt.spiroGraph.init = function() {
	
	//Remove any existing svgs
	d3.select('#spiro-graph #spiroGraph svg').remove();

	///////////////////////////////////////////////////////////////////////////
	//////////////////// Set up and initiate svg containers ///////////////////
	///////////////////////////////////////////////////////////////////////////	

	var margin = {
		top: 10,
		right: 10,
		bottom: 10,
		left: 10
	};
	
	var width = $(".slides").width() - margin.left - margin.right;
	var height = $(".slides").height()*0.95 - margin.top - margin.bottom;
				
	//SVG container
	pt.spiroGraph.svg = d3.select('#spiro-graph #spiroGraph')
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("class","spiroWrapper")
		.style("isolation", "isolate")
		.attr("transform", "translate(" + (width/2 + margin.left) + "," + (height/2 + margin.top) + ")");
	
	///////////////////////////////////////////////////////////////////////////
	///////////////////////////// Create filter ///////////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	//SVG filter for the glow effect
	var defs = pt.spiroGraph.svg.append("defs");

	//Filter for the outside glow
	var filter = defs.append("filter").attr("id","glow"),
		feGaussianBlur = filter.append("feGaussianBlur").attr("stdDeviation","3.5").attr("result","coloredBlur"),
		feMerge = filter.append("feMerge"),
		feMergeNode_1 = feMerge.append("feMergeNode").attr("in","coloredBlur"),
		feMergeNode_2 = feMerge.append("feMergeNode").attr("in","SourceGraphic");

	///////////////////////////////////////////////////////////////////////////
	///////////////////////// Set-up other things /////////////////////////////
	///////////////////////////////////////////////////////////////////////////	
		
	pt.spiroGraph.maxSize = Math.min(width, height) / 2,

	pt.spiroGraph.line = d3.svg.line()
		.x(function(d) { return d.x; })
		.y(function(d) { return d.y; });

	pt.spiroGraph.colors = ["#2c7bb6", "#00a6ca","#00ccbc","#53D86A","#FFCB2F","#FE9526","#e76818","#d7191c"];	
	pt.spiroGraph.numColors = pt.spiroGraph.colors.length;

	pt.spiroGraph.direction = "forward";

}//init

//Fixed circles: 96, 105, 
//Wheels: 24, 30, 32, 36, 40, 45, 48, 52, 56, 60, 63, 64, 72, 75, 80, 84

//96-24
//96-32
//96-40
//96-45
//96-48
//96-56
//96-60
//96-63
//96-64
//96-72
//96-80
//96-84
//105-24
//105-36
//105-48
//105-30
//105-45
//105-52
//105-56
//105-60
//105-63
//105-72
//105-75
//105-80
//105-84

pt.spiroGraph.calculateHypocycloid = function(R, r, rho, alpha, length, start) {

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
        	//console.log(theta);
        	break;
        }//if

        //Set the start location
        if(theta === startNum) {
        	x0 = x;
        	y0 = y;
        }//if

    }//for theta 
	
	//Output the variables of this spiro         
	//console.log("R: " + R + ", r: " + r + ", rho: " + rho + ", start: ", + startNum + ", steps: ", numTheta);
	
	return lineData;
}//function calculateHypocycloid

//Animate a spirograph
pt.spiroGraph.addHypoAnimate = function( R, r, rho, alpha, color, thickness, length, start, duration, delay, random ) {

	var drawTime = typeof duration === "undefined" ? 2 : duration;

	////////////////////////////////////////////////////////////
	//////////////// Draw an animated Spirograph ///////////////
	////////////////////////////////////////////////////////////

	var path = pt.spiroGraph.svg.append("path")
		.attr("class", "spirograph")
		.attr("d", pt.spiroGraph.line(pt.spiroGraph.calculateHypocycloid(R, r, rho, alpha, length, start, random)) )
		.style("mix-blend-mode", "multiply")
		.style("stroke-linecap", "round")
		.style("stroke-width", typeof thickness === "undefined" ? 4 : thickness)
		.style("stroke", color);
		
	var totalLength = path.node().getTotalLength();	
	var dashArray = totalLength + " " + totalLength;
	
	//Animate the path by offsetting the path so all you see is the white last bit of dashArray 
	//(which has a length that is the same length as the entire path), and then slowly move this
	//out of the way so the rest of the path becomes visible (the stuff at the start of dashArray)
	path
	  	.attr("stroke-dasharray", dashArray)
	  	.attr("stroke-dashoffset", totalLength)
	  	.transition("drawing").duration(drawTime * 1000).delay(delay * 1000)
	  	.ease("linear")
		.attr("stroke-dashoffset", 0);

}//addHypoAnimate

//Plot a spirograph
pt.spiroGraph.addHypo = function( R, r, rho, alpha, color, thickness, length, start, translation, random ) {

	var offset = typeof translation === "undefined" ? [0,0] : translation;

	pt.spiroGraph.svg.append("path")
		.attr("class", "spirograph")
		.attr("transform", "translate(" + offset[0] + "," + offset[1] + ")" )
		.attr("d", pt.spiroGraph.line(pt.spiroGraph.calculateHypocycloid(R, r, rho, alpha, length, start, random)) )
		.style("mix-blend-mode", "multiply")
		.style("stroke-linecap", "round")
		.style("stroke-width", typeof thickness === "undefined" ? 4 : thickness)
		.style("stroke", color)
		.style("opacity", 0)
		.transition("appear").duration(1000)
		.style("opacity", 1);

}//addHypo

pt.spiroGraph.spiro1 = function() {

	d3.selectAll("#spiroGraph .spirograph").remove();

	//Five pointed star 9 lines in 3 colors
	//var colors = ["#170E5E", "#2A85C8", "#80A339", "#2A85C8", "#170E5E"],
	var colors = ["#170E5E", "#2A85C8", "#88C425", "#2A85C8", "#3ac0de"],
		thick = 4,
		step = 0.05,
		offset = 3.75,
		startRho = 0.8,
		steps = 2600;
	pt.spiroGraph.addHypo(5*96, 5*56, startRho, 0, colors[0], thick, steps);
	for(var i = 1; i <=3; i++) {
		//R, r, rho, alpha, color, thickness, length, start
		pt.spiroGraph.addHypo(5*96, 5*56, startRho - i*step, i*offset, colors[i], thick, steps);
		pt.spiroGraph.addHypo(5*96, 5*56, startRho - i*step, -i*offset, colors[i], thick, steps);
	};
	pt.spiroGraph.addHypo(5*96, 5*56, startRho - 4*step, 4*offset, colors[colors.length-1], thick, steps);

}//spiro


pt.spiroGraph.spiro2 = function() {

	d3.selectAll("#spiroGraph .spirograph").remove();

	//Rainbow 7 pointed flower growing in delay
	var colors = ["#00DDCE", "#286FA5", "#A9E200", "#FFDC1E", "#FF5700", "#C62B00", "#A33384", "#2E347E"];
	colors.forEach(function(d,i) {
		//R, r, rho, alpha, color, thickness, length, start, duration, delay, random
		pt.spiroGraph.addHypoAnimate(3*175, 3*100, 0.55, i*5, d, 22, 1450, i*50, 2.5, 0);
	});

}//spiro

pt.spiroGraph.spiro3 = function() {

	d3.selectAll("#spiroGraph .spirograph").remove();

	//3 pointed star rainbow
	var counter = 0;
	var colors = ["#3465A8", "#0AA174", "#7EB852", "#EFB605", "#E47D06", "#DB0131", "#AF0158", "#7F378D" ];
	colors.forEach(function(d,i) {
		//R, r, rho, alpha, color, thickness, length, start, duration, delay
		pt.spiroGraph.addHypoAnimate(4*144, 4*96, 0.8 - counter*0.04, 0, d, 6, 750, counter*15, 2.5, 0); //counter*0.05
		counter++;
		pt.spiroGraph.addHypoAnimate(4*144, 4*96, 0.8 - counter*0.04, 0, d, 6, 750, counter*15, 2.5, 0);
		counter++;
	});

	//Rotate the groups afterwards
	d3.selectAll("#spiroGraph .spirograph")
		.transition("rotate").duration(2000)
		.delay(function(d,i) { return 2000 + i*30; })
		.attr("transform", function(d,i) { return "rotate(" + (i*10) + ")"; })
		.style("stroke-width", 6);
		
}//spiro

pt.spiroGraph.spiro4 = function() {

	d3.selectAll("#spiroGraph .spirograph").remove();

	//7-pointed rainbow star smaller versions offset
	var colors = ["#2C7BB6", "#188EC2", "#05A1C9", "#00B4C9", "#00C4C2", "#16D3B5", "#59E0A6", "#A1EF9B", "#DCFC96", "#FFFF8C", "#FFF077", "#FBD65D", "#F5BE47", "#F3A835", "#F19327", "#EC7C1D", "#E56017", "#DE3E18", "#D7191C"].reverse();
	colors.forEach(function(d,i) {
		//R, r, rho, alpha, color, thickness, length, start, translation, random 
		//pt.spiroGraph.addHypo(5*105, 5*60, 0.85 - i*0.04, i*4, d, 5, 4*360);

		//R, r, rho, alpha, color, thickness, length, start, duration, delay, random
		pt.spiroGraph.addHypoAnimate( 5*105, 5*60, 0.85-i*0.04, i*4, d, 10, 4*360, 0, 1, 0.1*i );
	});

}//spiro

// pt.spiroGraph.spiro5 = function() {

// 	d3.selectAll("#spiroGraph .spirograph").remove();

// 	//Red, orange, blue 18 rounds each
// 	var colors = ["#F56705", "#D7191C", "#2C7BB6"];
// 	var end = 22*349;
// 	colors.forEach(function(d,i) {
// 		//R, r, rho, alpha, color, thickness, length, start, duration, delay, random
// 		pt.spiroGraph.addHypoAnimate(414, 207.8, 0.5, 30, d, 1.5, end, i*end - 1, 0.5, 0.5*i );

// 		//R, r, rho, alpha, color, thickness, length, start, duration, delay, random
// 		//pt.spiroGraph.addHypoAnimate( 4*105, 4*52, 0.8, 0, d, 5, 18*347, i*18*347, 0.75, 0.75*i );

// 	});

// }//spiro

// pt.spiroGraph.spiro6 = function() {

// 	d3.selectAll("#spiroGraph .spirograph").remove();

// 	//Magenta, blue, yellow two lines round
// 	var colors = ["#ED008C","#ED008C","#00A6CA","#00A6CA","#FFDC1E","#FFDC1E"];
// 	colors.forEach(function(d,i) {
// 		//R, r, rho, alpha, color, thickness, length, start, duration, delay, random
// 		pt.spiroGraph.addHypo(5*100, 5*56, 0.6, i*2.4, d, 4, 5050);
// 		//pt.spiroGraph.addHypoAnimate(5*100, 5*56, 0.6, i*2.4, d, 5, 5050, 0, 3, 0.1*i);
// 	});	

// }//spiro

pt.spiroGraph.spiro5 = function() {

	d3.selectAll("#spiroGraph .spirograph")
		.transition("disappear").duration(500)
		.style("opacity", 0)
		.remove();

	//Magenta and blue ribbon 13 points - one overlapping
	for(var i = 0; i < 8 ; i++) {
		var color = i > 3 ? "#00A6CA" : "#ED008C";
		//R, r, rho, alpha, color, thickness, length, start, translation, random
		pt.spiroGraph.addHypo(4*130, 4*30, 0.9, (360/(13*7))*i, color, 6, 4000);
	}//for i

	if(pt.spiroGraph.direction === "forward") d3.select("#spiro-graph").attr("data-autoslide", 550);

}//spiro

pt.spiroGraph.spiro6 = function() {

	d3.selectAll("#spiroGraph .spirograph")
		.transition("disappear").duration(500)
		.style("opacity", 0)
		.remove();

	//7 pointed start blue and black
	var colors = ["#171F37", "#00CCBC", "#00CCBC", "#00CCBC", "#171F37", "#00CCBC", "#00CCBC", "#00CCBC", "#171F37"];
	colors.forEach(function(d,i) {
		//R, r, rho, alpha, color, thickness, length, start, duration, delay
		//if(d === "#171F37") {
		//	pt.spiroGraph.addHypoAnimate(5*105, 5*60, 0.8 - i*0.06, 0, d, 5, 2000, i*20, 2, 0);
		//} else {
			pt.spiroGraph.addHypo(5*105, 5*60, 0.8 - i*0.06, 0, d, 5, 2000);
		//}
	});
	// //Same but with 5 points
	// colors.forEach(function(d,i) {
	// 	//R, r, rho, alpha, color, thickness, length, start, duration, delay, random
	// 	pt.spiroGraph.addHypo(5*105, 5*63, 0.9 - i*0.07, 0, d, 6, 2000);
	// });

	// //Blue-yellow-blue many pointed spiros of varying forms
	// //R, r, rho, alpha, color, thickness, length, start, translation
	// pt.spiroGraph.addHypo(5*105, 5*80, 0.65, 0, "#0FB7E2", 5, 10000);
	// pt.spiroGraph.addHypo(5*96, 5*63, 0.45, 0, "#EE8D14", 5, 10000);
	// pt.spiroGraph.addHypo(5*105, 5*80, 0.3, 0, "#0FB7E2", 5, 10000);

}//spiro

pt.spiroGraph.spiro7 = function() {

	d3.selectAll("#spiroGraph .spirograph")
		.transition("disappear").duration(500)
		.style("opacity", 0)
		.remove();

	//Dark blue inward rotating spiral
	for(var i = 0; i < 60 ; i++) {
		//R, r, rho, alpha, color, thickness, length, start, duration, delay, random
		pt.spiroGraph.addHypo(5*105, 5*84, 0.8 - i*0.015, i*3, "#11479A", 4, 1450);
	}//for i

	//if(pt.spiroGraph.direction === "forward") d3.select("#spiro-graph").attr("data-autoslide", 750);

}//spiro

pt.spiroGraph.spiro8 = function() {

	d3.selectAll("#spiroGraph .spirograph")
		.transition("disappear").duration(500)
		.style("opacity", 0)
		.remove();

	//Many pointed dark red flower turning inward with one black line
	for(var i = 0; i < 35 ; i++) {
		var color = i === 0 ? "#270202" : "#C62B00";
		//R, r, rho, alpha, color, thickness, length, start
		pt.spiroGraph.addHypo(5*96, 5*56, 0.9 - i*0.02, i*3, color, 3, 2600, 0);
	}//for i

}//spiro

//Add an envelope form
pt.spiroGraph.spiro9 = function() {

	d3.selectAll("#spiroGraph .spirograph")
		.transition("disappear").duration(500)
		.style("opacity", 0)
		.remove();

	//"#FC3A51", "#0E2430"
	//"#CE1836", "#009989"
	//R, r, rho, alpha, k, start, steps
	var envelope1 = pt.spiroGraph.svg.append("path")
		.attr("class", "spirograph")
		.attr("d", pt.spiroGraph.line(pt.spiroGraph.plotEnvelope(12, 4, 1, 0, 60, 0, 7385)) ) 
		//.attr("d", pt.spiroGraph.line(pt.spiroGraph.plotEnvelope(8, 4, 1, 0, 64, 0, 8000)) )
		.attr("transform", "scale(15)")
		.style("mix-blend-mode", "multiply")
		.style("stroke-width", 0.1)
		.style("opacity", 0)
		.style("stroke", "#FC3A51");

	envelope1
		.transition("appear1").duration(1000)
		.style("opacity", 1);

	var envelope2 = pt.spiroGraph.svg.append("path")
		.attr("class", "spirograph")
		//.attr("d", pt.spiroGraph.line(pt.spiroGraph.plotEnvelope(8, 4, 1, 45, 64, 0, 8000)) )
		.attr("d", pt.spiroGraph.line(pt.spiroGraph.plotEnvelope(12, 4, 1, 60, 60, 0, 7385)) )
		.attr("transform", "scale(15)")
		.style("mix-blend-mode", "multiply")
		.style("stroke-width", 0.1)
		.style("opacity", 0)
		.style("stroke", "#0E2430");

	envelope2
		.transition("appear2").duration(1000)
		.style("opacity", 1);


	d3.select("#spiro-graph").attr("data-autoslide", 0);
	pt.spiroGraph.direction = "backward";

}//spiro

pt.spiroGraph.plotEnvelope = function(R, r, rho, alpha, k, start, steps) {
    alpha = alpha * Math.PI / 180;
    
    //Create the x and y coordinates for the spirograph and put these in a variable
	var lineData = [];
    for(var theta = start; theta < (start+steps); theta += 0.1){
        var t = (Math.PI / 180) * theta ;
        var x =  4*r*rho * Math.sin((R*t)/r)*Math.sin(t + alpha) + ( 4*r*(k+1)*rho * Math.sin((k*R*t)/(r*(k+1)))*Math.sin(t + alpha) ) / (k + 1);
        var y = -4*r*rho * Math.sin((R*t)/r)*Math.cos(t + alpha) - ( 4*r*(k+1)*rho * Math.sin((k*R*t)/(r*(k+1)))*Math.cos(t + alpha) ) / (k + 1)  ;
		
        lineData.push({x: x, y: y});                               
    }  
	
	return lineData;
}//function plotEnvelope





