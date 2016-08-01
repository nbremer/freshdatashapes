pt.piWalk = pt.piWalk || {};

pt.piWalk.init = function() {
	
	//Remove any existing svgs
	d3.select('#pi-walk #piWalk svg').remove();

	///////////////////////////////////////////////////////////////////////////
	//////////////////////// Set up and initiate canvas ///////////////////////
	///////////////////////////////////////////////////////////////////////////	

	pt.piWalk.width = $(".slides").width();
	pt.piWalk.height = $(".slides").height();
    
    //Create canvas
    var canvas = document.getElementById("piCanvas");
    canvas.width = pt.piWalk.width;
    canvas.height = pt.piWalk.height;
    pt.piWalk.ctx = canvas.getContext('2d');
    
	//Length of each line segment
    pt.piWalk.length = 90;
    pt.piWalk.lineThickness = 5;

    //Colors
    pt.piWalk.colors = ["#EFB605","#EC9A0E","#E63721","#D1003D","#AE0560","#872E89","#4F53AA","#118195","#15A866","#7EB852"];
    pt.piWalk.colorScale = d3.scale.linear()
    	.range( pt.piWalk.colors )
    	.domain( d3.range(0, 1e4, 1e4 / (pt.piWalk.colors.length - 1)).concat(1e4) );
    // Create gradient
	pt.piWalk.grd = pt.piWalk.ctx.createLinearGradient(pt.piWalk.width/2+100,0,pt.piWalk.width*5/6+100,0);
	pt.piWalk.colors.forEach(function(d,i) {
		pt.piWalk.grd.addColorStop(i/(pt.piWalk.colors.length - 1),d);
	});

    //Start in middle
    pt.piWalk.x = pt.piWalk.width / 2;
    pt.piWalk.y = pt.piWalk.height / 2;

	pt.piWalk.ctx.globalAlpha = 1;

	pt.piWalk.slideFragment = -1;

}//init

///////////////////////////////////////////////////////////////////////////
//////////////////////////////// Fragment -1 //////////////////////////////
///////////////////////////////////////////////////////////////////////////	


pt.piWalk.drawLegend = function() {

	pt.piWalk.slideFragment = -1;

	var ctx = pt.piWalk.ctx;

	ctx.clearRect(0, 0, pt.piWalk.width, pt.piWalk.height);

	var legendX = pt.piWalk.width / 2,
    	legendY = pt.piWalk.height / 2 + 100,
    	legendLength = 200;

	//Place pi on top
	ctx.font = "normal 300 200px Oxygen";
	ctx.fillStyle = "#dbdbdb";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText(eval('"\\u03C0"'), legendX, 200);

	ctx.font = "normal 300 40px Oxygen";
	ctx.fillStyle = "#2b2b2b";
	ctx.textAlign = "center";
	ctx.textBaseline = "top";
	ctx.fillText("3.14159...", legendX, 200);

	///////////////////////////////////////////////////////////////////////////
	/////////////////////////// Draw circular legend //////////////////////////
	///////////////////////////////////////////////////////////////////////////	

	//Setting the text for the legend
	ctx.fillStyle = "#666";
	ctx.font = "normal 300 32px Oxygen";
	
    for(var j = 0; j < pt.piWalk.colors.length; j++) {

      var radian = (2 * Math.PI) / 10 * j - (Math.PI / 2);
      var x1 = 2 * Math.cos(radian) + legendX;
      var y1 = 2 * Math.sin(radian) + legendY;
      var x2 = legendLength * Math.cos(radian) + legendX;
      var y2 = legendLength * Math.sin(radian) + legendY;
      var textX = (legendLength + 10) * Math.cos(radian) + legendX;
      var textY = (legendLength + 10) * Math.sin(radian) + legendY;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.strokeStyle = pt.piWalk.colors[j];
      ctx.lineWidth = 7;
      ctx.lineTo(x2, y2);
      ctx.stroke();
      
      //Plot text
      if (j > 0 && j < 5) {
        ctx.textAlign = "start";
      } else if (j > 5 && j < 10) {
        ctx.textAlign = "end";
      } else {
        ctx.textAlign = "center";
      }//else 

      if (j === 9 || j === 0 || j === 1) {
        ctx.textBaseline = "bottom";
      } else if (j === 2 || j === 3 || j === 7 || j === 8) {
        ctx.textBaseline = "middle";
      } else {
        ctx.textBaseline = "top";
      }//else

      ctx.fillText(j, textX, textY); 
      ctx.closePath();

    }//for j

}//drawLegend

///////////////////////////////////////////////////////////////////////////
//////////////////////////////// Fragment 0 ///////////////////////////////
///////////////////////////////////////////////////////////////////////////	

pt.piWalk.fadeLegend = function() {

	pt.piWalk.slideFragment = 0;

	var alpha = 1;
	var iteration = 0;

	var fadeInterval = setInterval(fadeOut, 5);

	function fadeOut() {
		alpha = easeInOut( 1 - ( iteration++ * 0.01 ) );
		pt.piWalk.ctx.globalAlpha = alpha;
		pt.piWalk.drawLegend();

		if( alpha < 0.01 ) {
			clearInterval(fadeInterval);
			pt.piWalk.drawHundred();
		}//if
	}//fadeOut

}//fadeLegend

pt.piWalk.drawHundred = function() {

	pt.piWalk.slideFragment = 0;

	var ctx = pt.piWalk.ctx;

	//In case you move backwards
	pt.piWalk.length = 90;
    pt.piWalk.lineThickness = 5;

	ctx.clearRect(0, 0, pt.piWalk.width, pt.piWalk.height);
	ctx.globalAlpha = 1;

    //Place digit text in top left
	pt.piWalk.xText = pt.piWalk.width * 0.3,
	pt.piWalk.yText = pt.piWalk.height * 0.2;

    //Text styles for the digit
    ctx.font = "normal 300 80px Oxygen";
	ctx.fillStyle = "black";
	ctx.textAlign = "end";

	//Start with the 3.
	setTimeout( function() {
		ctx.fillText("3.", pt.piWalk.xText, pt.piWalk.yText)
	}, 500);

    //Start in middle for the walking
    pt.piWalk.x = pt.piWalk.width / 2;
    pt.piWalk.y = pt.piWalk.height / 2;

    //Number of digits to draw
    pt.piWalk.numbersToDraw = 100;

    //Run the line drawing animation
    pt.piWalk.counter = 1;
    pt.piWalk.interval = pt.piWalk.newInterval = 400;
    pt.piWalk.intervalDecrease = 1;
    setTimeout(function() {
    	if( pt.piWalk.slideFragment === 0 ) {
    		pt.piWalk.animateHundred(pt.piWalk.numbersToDraw, pt.piWalk.lineThickness, 0.05, 0)
    	}//if
    }, 1000);

}//drawHundred

//Animate the line walking - line by line
pt.piWalk.animateHundred = function(maxNum, lineSize, stepSize, fragment) {
    
    var ctx = pt.piWalk.ctx;

    var digit = parseInt(piString[pt.piWalk.counter++]);
    //if (_.isNaN(digit)) return;
    
    //Draw the line segment for the digit
    pt.piWalk.drawLine(digit, lineSize);

    //Remove the previous digit character and place the new one
	ctx.clearRect(0,0,pt.piWalk.xText,pt.piWalk.yText);

	//Draw all the digits that have passed
	ctx.textAlign = "end";
	ctx.globalAlpha = 0.5;
    pt.piWalk.ctx.fillText("3.".concat(piString.slice(1,pt.piWalk.counter)),pt.piWalk.xText,pt.piWalk.yText);
    //Then redraw the last digit in full opacity
    ctx.globalAlpha = 1;
    ctx.fillText(digit,pt.piWalk.xText,pt.piWalk.yText);

    //Calculate the new interval speed
    if(pt.piWalk.counter * stepSize < 1 && pt.piWalk.newInterval > 20) {
    	pt.piWalk.intervalDecrease = 1 - pt.piWalk.counter * stepSize;
    	pt.piWalk.newInterval = pt.piWalk.interval * pt.piWalk.intervalDecrease;
    }//if
    // console.log("intervalDecrease", pt.piWalk.intervalDecrease);
    // console.log("newInterval", pt.piWalk.newInterval);
    
    //Stop when reaching maxNum digits
    if (pt.piWalk.counter <= maxNum && pt.piWalk.slideFragment === fragment) {
        setTimeout(pt.piWalk.animateHundred.bind(null, maxNum, lineSize, stepSize, fragment), pt.piWalk.newInterval);
    }//if

}//animateHundred

///////////////////////////////////////////////////////////////////////////
//////////////////////////////// Fragment 1 ///////////////////////////////
///////////////////////////////////////////////////////////////////////////	

pt.piWalk.zoomOutToThousand = function() {

	pt.piWalk.slideFragment = 1;
	pt.piWalk.newInterval = 20;

	pt.piWalk.ctx.clearRect(0,0,pt.piWalk.xText,pt.piWalk.yText);

	pt.piWalk.x = pt.piWalk.width / 2;
    pt.piWalk.y = pt.piWalk.height / 2;

    var stepSize = 0.02;
    var originalLineLength = pt.piWalk.length;
    var deltaLineLenght = originalLineLength - 26;
    var originalLineThickness = pt.piWalk.lineThickness;
    var deltaLineThickness = originalLineThickness - 1.5;

    var originalX = pt.piWalk.x;
    var newX = pt.piWalk.width * 0.25;
    var deltaX = originalX - newX;
    var originalY = pt.piWalk.y;
    var newY = pt.piWalk.height * 0.8;
    var deltaY = originalY - newY;
    
    //Starting numbers to draw
    pt.piWalk.numbersToDraw = 100;

    pt.piWalk.counter = 1;
    zoomOut();

	function zoomOut() {

		pt.piWalk.counter++;

	    if (pt.piWalk.counter * stepSize < 1 && pt.piWalk.slideFragment === 1) {

	    	pt.piWalk.ctx.clearRect(0,0,pt.piWalk.width,pt.piWalk.height);

	    	//Find the new line length and thickness
			var decrease = easeIn( pt.piWalk.counter * stepSize) ;
		    pt.piWalk.length = originalLineLength - deltaLineLenght * decrease;
		    pt.piWalk.lineThickness = originalLineThickness - deltaLineThickness * decrease;
		    pt.piWalk.x = originalX - deltaX * decrease;
		    pt.piWalk.y = originalY - deltaY * decrease;

		    //Needed later on
		    pt.piWalk.startX = pt.piWalk.x;
			pt.piWalk.startY = pt.piWalk.y;

		    //Draw the line group
		    pt.piWalk.drawGroup(pt.piWalk.numbersToDraw++, pt.piWalk.lineThickness);

        	setTimeout(zoomOut, pt.piWalk.newInterval);

    	} else {
    		pt.piWalk.drawThousand();
    	}

	}//zoomOut

}//zoomOutToThousand

pt.piWalk.drawThousand = function() {

	pt.piWalk.counter = pt.piWalk.numbersToDraw;
	pt.piWalk.newInterval = 1;

	animateLine(1e3, pt.piWalk.lineThickness, 1);

	//Animate the line walking - line by line
	function animateLine(maxNum, lineSize, fragment) {
	    
	    var digit = parseInt(piString[pt.piWalk.counter++]);
	    //if (_.isNaN(digit)) return;
	    pt.piWalk.drawLine(digit, lineSize);
	    
	    //Stop when reaching maxNum digits
	    if (pt.piWalk.counter <= maxNum && pt.piWalk.slideFragment === fragment) {
	        setTimeout(animateLine.bind(null, maxNum, lineSize, fragment), pt.piWalk.newInterval);
	    }//if
	}//animateLine

}//drawThousand

///////////////////////////////////////////////////////////////////////////
//////////////////////////////// Fragment 2 ///////////////////////////////
///////////////////////////////////////////////////////////////////////////	

pt.piWalk.zoomOutToTenThousand = function() {

	pt.piWalk.slideFragment = 2;
	pt.piWalk.newInterval = 1;
	pt.piWalk.counter = pt.piWalk.numbersToDraw = 1e3;

	pt.piWalk.ctx.clearRect(0,0,pt.piWalk.xText,pt.piWalk.yText);

	pt.piWalk.x = pt.piWalk.startX
    pt.piWalk.y = pt.piWalk.startY;

    var stepSize = 0.01;
    var originalLineLength = pt.piWalk.length;
    var deltaLineLenght = originalLineLength - 8;
    var originalLineThickness = pt.piWalk.lineThickness;
    var deltaLineThickness = originalLineThickness - 1;

    var originalX = pt.piWalk.x;
    var newX = pt.piWalk.width * 0.4;
    var deltaX = originalX - newX;
    var originalY = pt.piWalk.y;
    var newY = pt.piWalk.height * 0.3;
    var deltaY = originalY - newY;

    pt.piWalk.counter = 1;
    pt.piWalk.drawExtra = 2;

    zoomOut();

	function zoomOut() {

		pt.piWalk.counter++;

	    if (pt.piWalk.counter * stepSize < 1 && pt.piWalk.slideFragment === 2) {

	    	pt.piWalk.ctx.clearRect(0,0,pt.piWalk.width,pt.piWalk.height);

	    	//Find the new line length and thickness
			var decrease = easeIn( pt.piWalk.counter * stepSize) ;
		    pt.piWalk.length = originalLineLength - deltaLineLenght * decrease;
		    pt.piWalk.lineThickness = Math.floor( (originalLineThickness - deltaLineThickness * decrease) * 10 )/10;
		    pt.piWalk.x = originalX - deltaX * decrease;
		    pt.piWalk.y = originalY - deltaY * decrease;
		    pt.piWalk.startX = pt.piWalk.x;
			pt.piWalk.startY = pt.piWalk.y;

			pt.piWalk.numbersToDraw = pt.piWalk.numbersToDraw + pt.piWalk.drawExtra;
			if(pt.piWalk.counter%2 === 0) pt.piWalk.drawExtra += 1;

		    //Draw the line group
		    pt.piWalk.drawGroup(pt.piWalk.numbersToDraw, pt.piWalk.lineThickness);

        	setTimeout(zoomOut, pt.piWalk.newInterval);
    	} else {
    		pt.piWalk.drawTenThousand();
    	}//else

	}//zoomOut

}//zoomOutToTenThousand

pt.piWalk.drawTenThousand = function() {

	pt.piWalk.counter = 0;

	var stepSize = 0.01,
		originalSize = pt.piWalk.drawExtra,
		finalSize = 90,
		deltaSize = originalSize - finalSize;

	var maxNumDraw = pt.piWalk.numbersToDraw;

	drawInBatches();

	function drawInBatches() {

		if ( pt.piWalk.counter * stepSize <= 1 ) {
			var decrease = easeIn( pt.piWalk.counter * stepSize, 6);
			newSize = originalSize - deltaSize * decrease;
			maxNumDraw += Math.round(newSize);
			//console.log("newSize:", newSize, "maxSize: ", maxNumDraw);
		} else {
			maxNumDraw += finalSize;
		}//else

		pt.piWalk.x = pt.piWalk.startX
	    pt.piWalk.y = pt.piWalk.startY;
	    pt.piWalk.counter += 1;

		if(maxNumDraw < 1e4 && pt.piWalk.slideFragment === 2) {
			pt.piWalk.ctx.clearRect(0,0,pt.piWalk.width,pt.piWalk.height);
			pt.piWalk.drawGroup(maxNumDraw, 1);
			pt.piWalk.drawSteps = requestAnimationFrame( drawInBatches );
		} else {
			//Text styles for the legend
			pt.piWalk.ctx.textBaseline = "middle"; 
		    pt.piWalk.ctx.textAlign = "center";

		    pt.piWalk.ctx.font = "normal 300 90px Oxygen";
			pt.piWalk.ctx.fillStyle = "#7F7F7F";
			pt.piWalk.ctx.fillText("10,000", pt.piWalk.width*4/6+100, pt.piWalk.height*2/5 - 140);

			pt.piWalk.ctx.font = "normal 300 26px Oxygen";
			pt.piWalk.ctx.fillStyle = "#A8A8A8";
			pt.piWalk.ctx.fillText("digits of " + eval('"\\u03C0"'), pt.piWalk.width*4/6+100, pt.piWalk.height*2/5 - 75);
		}//else

	}//drawInBatches

}//drawTenThousand

///////////////////////////////////////////////////////////////////////////
//////////////////////////////// Fragment 3 ///////////////////////////////
///////////////////////////////////////////////////////////////////////////	

pt.piWalk.startFinishColor = function() {

	pt.piWalk.slideFragment = 3;

	var ctx = pt.piWalk.ctx;
	
	//Empty the canvas
	ctx.clearRect(0,0,pt.piWalk.width,pt.piWalk.height);

	pt.piWalk.x = pt.piWalk.startX
    pt.piWalk.y = pt.piWalk.startY;

    //Place gradient
    ctx.fillStyle = pt.piWalk.grd;
	ctx.fillRect(pt.piWalk.width/2+100, pt.piWalk.height*2/5, pt.piWalk.width/3, 14);

	//Text styles for the legend
	ctx.textBaseline = "middle"; 
    ctx.textAlign = "center";

    ctx.font = "normal 300 90px Oxygen";
	ctx.fillStyle = "#7F7F7F";
	ctx.fillText("10,000", pt.piWalk.width*4/6+100, pt.piWalk.height*2/5 - 140);

	ctx.font = "normal 300 26px Oxygen";
	ctx.fillStyle = "#A8A8A8";
	ctx.fillText("digits of " + eval('"\\u03C0"'), pt.piWalk.width*4/6+100, pt.piWalk.height*2/5 - 75);

	ctx.font = "normal 300 20px Oxygen";
	ctx.fillStyle = "#A8A8A8";
	ctx.textAlign = "end";
	ctx.fillText("start", pt.piWalk.width/2+90, pt.piWalk.height*2/5 + 6);
	ctx.textAlign = "start";
	ctx.fillText("end", pt.piWalk.width*5/6+110, pt.piWalk.height*2/5 + 6);

	//Draw the 1e4 shape
	for(var i = 1; i <= 1e4; i++) {
		var digit = parseInt(piString[i]);
		pt.piWalk.drawLine(digit, 1, i);
	}//for i

}//startFinishColor

///////////////////////////////////////////////////////////////////////////
//////////////////////////////// Fragment 3 ///////////////////////////////
///////////////////////////////////////////////////////////////////////////	

pt.piWalk.clearCanvas = function() {

	pt.piWalk.slideFragment = 4;
	
	//Empty the canvas
	pt.piWalk.ctx.clearRect(0,0,pt.piWalk.width,pt.piWalk.height);

}//clearCanvas

///////////////////////////////////////////////////////////////////////////
///////////////////////////// General functions ///////////////////////////
///////////////////////////////////////////////////////////////////////////

//Based on Shirley's block: http://bl.ocks.org/sxywu/9fc66f76d0217475f2e4 (which was again based on my static Art in Pi piece)
pt.piWalk.drawLine = function(digit, lineSize, digitLocation) {

		var ctx = pt.piWalk.ctx;

        ctx.beginPath();
	    ctx.moveTo(pt.piWalk.x, pt.piWalk.y);
	      
	    var radian = (2 * Math.PI) / 10 * digit - (Math.PI / 2);
	    pt.piWalk.x += pt.piWalk.length * Math.cos(radian);
	    pt.piWalk.y += pt.piWalk.length * Math.sin(radian);

	    if(typeof digitLocation !== "undefined") {
	    	ctx.strokeStyle = pt.piWalk.colorScale(digitLocation);
	    } else {
	    	ctx.strokeStyle = pt.piWalk.colors[digit];
	    }//else
	    ctx.lineWidth = lineSize;
	    ctx.lineTo(pt.piWalk.x, pt.piWalk.y);
	    ctx.stroke();
	    ctx.closePath();

}//drawLine


//Draw maxNum lines "at once"
pt.piWalk.drawGroup = function(maxNum, lineSize) {
	for(var i = 1; i <= maxNum; i++) {
		var digit = parseInt(piString[i]);
		//if (_.isNaN(digit)) return;
		pt.piWalk.drawLine(digit, lineSize);
	}//for i
}//drawGroup




