pt.spiroGraphFormula = pt.spiroGraphFormula || {};

pt.spiroGraphFormula.init = function() {

	///////////////////////////////////////////////////////////////////////////
	///////////////////// Set up and initiate containers //////////////////////
	///////////////////////////////////////////////////////////////////////////	

	pt.spiroGraphFormula.width = $(".slides").width();
	pt.spiroGraphFormula.height = $(".slides").height();

	//Create canvas
    pt.spiroGraphFormula.canvas = document.getElementById("spiroCanvas");
    pt.spiroGraphFormula.canvas.width = pt.spiroGraphFormula.width;
    pt.spiroGraphFormula.canvas.height = pt.spiroGraphFormula.height;
    pt.spiroGraphFormula.ctx = pt.spiroGraphFormula.canvas.getContext('2d');

    pt.spiroGraphFormula.ctx.globalCompositeOperation = "multiply";

	pt.spiroGraphFormula.ctx.lineCap = "butt";

	pt.spiroGraphFormula.counter = 0;

}//init

pt.spiroGraphFormula.resetOpacity = function() {
	
	//In case you move backward
	d3.selectAll("#spiro-graph-formula .formula")
		.transition().duration(250)
		.style("color", "#adadad");

}//resetOpacity

pt.spiroGraphFormula.showSpiros = function() {

	//Make formula less visible
	d3.selectAll("#spiro-graph-formula .formula")
		.transition().duration(750)
		.style("color", "#e2e2e2");

	//Calculate and draw the spirographs
	setTimeout( function() {
		requestAnimationFrame(pt.spiroGraphFormula.setVariables);
	}, 500);

}//showSpiros


pt.spiroGraphFormula.calculateHypocycloid = function(R, r, rho, alpha, length, start, color, thickness, translation) {

	var ctx = pt.spiroGraphFormula.ctx;

	var offset = typeof translation === "undefined" ? [0,0] : translation;
    var numTheta = typeof length === "undefined" ? 10000 : length;
	var startNum = typeof start === "undefined" ? 1 : start;
	alpha = alpha * Math.PI / 180;

    var x0 = 5e5, 
    	y0 = 5e5,
    	oldX, oldY;
  
  	//Translate the canvas
  	ctx.translate(offset[0], offset[1]);
  	ctx.strokeStyle = color;
    ctx.lineWidth = typeof thickness === "undefined" ? 4 : thickness;
    
    //Create the x and y coordinates for the spirograph
    for(var theta = startNum; theta < (startNum+numTheta); theta += 1){
        var t = (Math.PI / 180) * theta ;
        var x = (R-r) * Math.cos(t + alpha) + rho * r * Math.cos( (R-r)/r * t - alpha ) ;
        var y = (R-r) * Math.sin(t + alpha) - rho * r * Math.sin( (R-r)/r * t - alpha) ;
		
		if (oldX) {
			ctx.beginPath();
			ctx.moveTo(oldX, oldY);
			ctx.lineTo(x, y);
			ctx.closePath();
			ctx.stroke();
		}//if

		oldX = x;
		oldY = y; 

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

    //Translate the canvas back to the top left
    ctx.translate(-offset[0], -offset[1]);
	
}//function calculateHypocycloid

pt.spiroGraphFormula.setVariables = function() {

	var R = getRandomNumber(15, 100);
	var r = getRandomNumber(2, (R * 0.95));
	var rho = Math.random() + Math.random();
	var alpha = getRandomNumber(0, 10);

	//Randomly place the spirograph on the page
	var translation = [getRandomNumber(0, pt.spiroGraphFormula.width), getRandomNumber(0, pt.spiroGraphFormula.height)];

	//Use the location of the center to find a color
	//http://blockbuilder.org/mbostock/76342abc327062128604
	var dx = translation[0] - pt.spiroGraphFormula.width/2 ,
		dy = translation[1] - pt.spiroGraphFormula.height/2; 
	var color = d3.rgb( d3.lab(100 - (dx * dx + dy * dy) / 30000, dx / 20, dy / 20) ).toString();
	// var color = pt.spiroGraphFormula.yiq2rgb(0.6, 
	// 	translation[0]/pt.spiroGraphFormula.width - 0.5 + Math.random()/10 * (Math.random() > 0.5 ? 1 : -1), 
	// 	translation[1]/pt.spiroGraphFormula.height - 0.5 + Math.random()/10 * (Math.random() > 0.5 ? 1 : -1));	
	var thickness = Math.random();
	var length = getRandomNumber(0, 10e3) + 5000;
	var start = getRandomNumber(0, 10e3);

	//Draw the spirographs
	pt.spiroGraphFormula.calculateHypocycloid( R, r, rho, alpha, length, start, color, thickness, translation);

	pt.spiroGraphFormula.counter += 1;

	//Repeat - only 10 times for mobile
	if( !isMobile ) {
		pt.spiroGraphFormula.drawSpirographs = requestAnimationFrame(pt.spiroGraphFormula.setVariables);
	} else if (pt.spiroGraphFormula.counter < 10) {
		pt.spiroGraphFormula.drawSpirographs = requestAnimationFrame(pt.spiroGraphFormula.setVariables);
	}

}//setVariables


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


