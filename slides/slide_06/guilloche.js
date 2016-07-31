pt.guilloche = pt.guilloche || {};

pt.guilloche.init = function() {

    //Create canvas
    pt.guilloche.canvas = document.getElementById("gCanvas");
    pt.guilloche.canvas.width = $(".slides").width();
    pt.guilloche.canvas.height = $(".slides").height();

    //Dark rainbow color palette
    pt.guilloche.colors = ["#EFB605","#EC9A0E","#E63721","#D1003D","#AE0560","#872E89","#4F53AA","#118195","#15A866","#7EB852"];

    //Nice looking shapes
	pt.guilloche.keysOneColor = [75,145,230,269,331]; //100,119,138,180,190,196,200,210,219,227,261,292,348
	pt.guilloche.keysRainbow = [75,115,216,275,285,334]; //[69,72,75,108,115,165,167,216,223,275,285,311,334,385];

	pt.guilloche.direction = "forward";
	pt.guilloche.slideFragment = -1;

	// //Figuring out which shapes look nice
	// var options = {	
	// 	colorStyle: "rainbow",
	// 	globalAlpha: 0.7,
	// 	lineWidth: 0.2
	// }
	// var counter = 70;
	// // pt.guilloche.Interval = setInterval(function() {
	// // 	//pt.guilloche.draw(canvas, options, keysRainbow[counter++]);
	// // 	pt.guilloche.draw(pt.guilloche.canvas, options, counter++);
	// // }, 1000);

}//init

///////////////////////////////////////////////////////////////////////////
////////////////////// Draw the Guilloche like shape //////////////////////
///////////////////////////////////////////////////////////////////////////	

pt.guilloche.draw = function(canvas, opts, guilloche_key){
  	var opts = opts || {};
  	var guilloche_key = guilloche_key || Math.round( Math.random() * 200 );

  	var factor = 0.426;

  	var ctx = canvas.getContext('2d'),
  		size = 								   opts.size || {x: canvas.offsetWidth, y: canvas.offsetHeight},
  		halfSize = {x: size.x / 2, y: size.y / 2},
  		majorR =                             opts.majorR || (size.x - 250),
  		minorR =                             opts.minorR || (size.x - 250)*factor,
  		angleMultiplier =           opts.angleMultiplier || guilloche_key,
  		radiusEffectConstant = opts.radiusEffectConstant || 1.35,
  		steps =                               opts.steps || 1500,
  		centerPoint =                   opts.centerPoint || halfSize,
  		colorStyle = 					 opts.colorStyle || null,
  		color =                               opts.color || 'rgb(100,100,100)',
  		globalAlpha =                   opts.globalAlpha || 1.0,
  		lineWidth = 					  opts.lineWidth || 1.0,
  		blendMode = 					  opts.blendMode || "none";

    ctx.globalAlpha = globalAlpha;
	ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
	ctx.globalCompositeOperation = blendMode;

    //console.log("chosen key:", guilloche_key);
 	//ctx.font = "normal 300 100px Oxygen";
	// ctx.fillStyle = "black";
	// ctx.fillText(guilloche_key, 100, 100);

	var	diff = majorR - minorR,
		s = diff / minorR,
		theta = 0,
		radiusEffect = radiusEffectConstant * minorR,
		oldX, oldY;

	for (var i = 0; i < steps; i++) {

		theta += Math.PI * 4 / steps;

		var new_theta = angleMultiplier * theta,
			x = diff * Math.cos(new_theta) - radiusEffect * Math.cos(new_theta * s) + (centerPoint.x)
			y = diff * Math.sin(new_theta) + radiusEffect * Math.sin(new_theta * s) + (centerPoint.y);

		if (oldX) {
      		ctx.strokeStyle = colorStyle === "rainbow" ? pt.guilloche.colors[i%pt.guilloche.colors.length] : color;
      		ctx.lineWidth = lineWidth;
      		ctx.lineCap = "butt";
			ctx.beginPath();
			ctx.moveTo(oldX, oldY);
			ctx.lineTo(x, y);
			ctx.closePath();
			ctx.stroke();
		}//if

		oldX = x;
		oldY = y;
	}//for i

}//draw

///////////////////////////////////////////////////////////////////////////
////////////////// From Spirograph to Guilloche like shape ////////////////
///////////////////////////////////////////////////////////////////////////	

//Start state - normal spiro
pt.guilloche.shapeStart = function() {
	pt.guilloche.direction = "forward";
	var options = {	
		//Fixed
		centerPoint: {x: pt.guilloche.canvas.offsetWidth/2, y: pt.guilloche.canvas.offsetHeight/2},
		color: "#18ACA6",
		radiusEffectConstant: 1.5,
		//Changing
		size: {x: 600, y: 600},
		steps: 3000,
		angleMultiplier: 11.5,
		lineWidth: 2,
		globalAlpha: 0.5,
	}
	pt.guilloche.draw(pt.guilloche.canvas, options);
	pt.guilloche.slideFragment = -1;
}//shapeStart

//End state - different flower shape
pt.guilloche.shapeEnd = function() {

	pt.guilloche.slideFragment = 0;

	var center = {x: pt.guilloche.canvas.offsetWidth/2, y: pt.guilloche.canvas.offsetHeight/2},
		color = "#18ACA6",
		radiusConstant = 1.5;
    var stepSize = 0.02;
    var counter = 0,
    	counterSize = 0;

    //Size difference
    var originalSize = {x: 600, y: 600},
    	newSize = {x: pt.guilloche.canvas.offsetWidth, y: pt.guilloche.canvas.offsetHeight},
    	finalSize = {x: pt.guilloche.canvas.offsetWidth, y: pt.guilloche.canvas.offsetHeight},
    	deltaSize = {x: originalSize.x - newSize.x, y: originalSize.y - newSize.y};
    //Step number difference
    var originalSteps = 3000,
    	newSteps = 1500,
    	finalSteps = 1500,
    	deltaSteps = originalSteps - newSteps;
    //angleMultiplier difference
    var originalAngleMultiplier = 11.5,
    	newAngleMultiplier = 75,
    	finalAngleMultiplier = 75,
    	deltaAngleMultiplier = originalAngleMultiplier - newAngleMultiplier;
    //Line width difference
    var originalLineWidth = 2,
    	newLineWidth = 0.3,
    	finalLineWidth = 0.3,
    	deltaLineWidth = originalLineWidth - newLineWidth;
    //Opacity difference
    var originalAlpha = 0.5,
    	newAlpha = 0.7,
    	finalAlpha = 0.7,
    	deltaAlpha = originalAlpha - newAlpha;

    //If you go forward do the animation, otherwise go straight to the end
    if(pt.guilloche.direction === "forward") {
    	alterShape();
    } else {
    	finalShape();
	}//else

	//Slowly alter the shape from the spirograph to the flower
	function alterShape() {

    	//Find the new variables
		var decrease = easeInOut( counter++ * stepSize);
		//Start zooming in halfway
		if(counter * stepSize >= 0.5) {
			var decreaseSize = easeIn( counterSize++ * stepSize * 2) ;
		} else {
			var decreaseSize = 0;
		}//else

		//New variables for this loop
	    newSize = {x: originalSize.x - deltaSize.x * decreaseSize, y: originalSize.y - deltaSize.y * decreaseSize};
	    newSteps = originalSteps - deltaSteps * decrease;
	    newAngleMultiplier = originalAngleMultiplier - deltaAngleMultiplier * decrease;
	    newLineWidth = originalLineWidth - deltaLineWidth * decrease;
	    newAlpha = originalAlpha - deltaAlpha * decrease;

	    if ( counter * stepSize <= 1  && pt.guilloche.slideFragment === 0) {

			var options = {	
				//Fixed
				centerPoint: center,
				color: color,
				radiusEffectConstant: radiusConstant,
				//Change
				size: newSize,
				steps: newSteps,
				angleMultiplier: newAngleMultiplier,
				lineWidth: newLineWidth,
				globalAlpha: newAlpha
			}
			pt.guilloche.draw(pt.guilloche.canvas, options);

			// if(counter * stepSize === 1) {
			// 	console.log("size: ", newSize, "steps: ", newSteps, "angleMulti: ", newAngleMultiplier, "line width: ", newLineWidth);
			// }

	        setTimeout(alterShape, 100);
	    } else {
	    	//Draw the final shape with the perfect values
	    	setTimeout(finalShape, 100);
	    }//else
	}//alterShape

	//Draw the final shape at once
	function finalShape() {

		var options = {	
			//Fixed
			centerPoint: center,
			color: color,
			radiusEffectConstant: radiusConstant,
			size: finalSize,
			steps: finalSteps,
			globalAlpha: finalAlpha,
			angleMultiplier: finalAngleMultiplier,
			lineWidth: finalLineWidth
		}
		//Only actually draw it if we're still on this fragment
		if(pt.guilloche.slideFragment === 0) {
			pt.guilloche.draw(pt.guilloche.canvas, options);
		}//if
	}//finalShape

}//shapeEnd

///////////////////////////////////////////////////////////////////////////
/////////////////// Quickly flip through even more shapes /////////////////
///////////////////////////////////////////////////////////////////////////	

pt.guilloche.shape1 = function() {
	pt.guilloche.slideFragment = 1;
	var options = {	
		colorStyle: "rainbow",
		globalAlpha: 0.7,
		radiusEffectConstant: 1.14,
		lineWidth: 0.2
	}
	pt.guilloche.draw(pt.guilloche.canvas, options, pt.guilloche.keysRainbow[1]);
	if(pt.guilloche.direction === "forward") d3.select("#guilloche").attr("data-autoslide", 650);

}//shape

pt.guilloche.shape2 = function() {
	var options = {	
		color: "#18ACA6",
		globalAlpha: 0.7,
		lineWidth: 0.2
	}
	pt.guilloche.draw(pt.guilloche.canvas, options, pt.guilloche.keysOneColor[1]);

	//if(pt.guilloche.direction === "forward") d3.select("#guilloche").attr("data-autoslide", 1300);
}//shape

pt.guilloche.shape3 = function() {
	var options = {	
		colorStyle: "rainbow",
		globalAlpha: 0.7,
		radiusEffectConstant: 1.14,
		lineWidth: 0.2
	}
	pt.guilloche.draw(pt.guilloche.canvas, options, pt.guilloche.keysRainbow[0]);

	//if(pt.guilloche.direction === "forward") d3.select("#guilloche").attr("data-autoslide", 1100);
}//shape

pt.guilloche.shape4 = function() {
	var options = {	
		color: "#7F378D",
		globalAlpha: 0.7,
		lineWidth: 0.2
	}
	pt.guilloche.draw(pt.guilloche.canvas, options, pt.guilloche.keysOneColor[3]);

	//if(pt.guilloche.direction === "forward") d3.select("#guilloche").attr("data-autoslide", 900);
}//shape

pt.guilloche.shape5 = function() {
	var options = {	
		colorStyle: "rainbow",
		globalAlpha: 0.7,
		lineWidth: 0.2
	}
	pt.guilloche.draw(pt.guilloche.canvas, options, pt.guilloche.keysRainbow[1]);
}//shape

pt.guilloche.shape6 = function() {
	var options = {	
		color: "#3465A8",
		globalAlpha: 0.8,
		lineWidth: 0.2
	}
	pt.guilloche.draw(pt.guilloche.canvas, options, pt.guilloche.keysOneColor[4]);
}//shape

pt.guilloche.shape7 = function() {
	pt.guilloche.slideFragment = 7;
	var options = {	
		color: "#18ACA6",
		globalAlpha: 0.7,
		lineWidth: 0.2
	}
	pt.guilloche.draw(pt.guilloche.canvas, options, pt.guilloche.keysOneColor[2]);

	d3.select("#guilloche").attr("data-autoslide", 0);
	pt.guilloche.direction = "backward";
}//shape

// pt.guilloche.shape3 = function() {
// 	var options = {	
// 		colorStyle: "rainbow",
// 		globalAlpha: 0.5,
// 		lineWidth: 0.2
// 	}
// 	pt.guilloche.draw(pt.guilloche.canvas, options, pt.guilloche.keysRainbow[4]);
// }//shape

// pt.guilloche.shape7 = function() {
// 	var options = {	
// 		colorStyle: "rainbow",
// 		globalAlpha: 0.7,
// 		lineWidth: 0.2
// 	}
// 	pt.guilloche.draw(pt.guilloche.canvas, options, pt.guilloche.keysRainbow[2]);
// }//shape

// pt.guilloche.shape3 = function() {
// 	var options = {	
// 		colorStyle: "rainbow",
// 		globalAlpha: 0.7,
// 		lineWidth: 0.2
// 	}
// 	pt.guilloche.draw(pt.guilloche.canvas, options, pt.guilloche.keysRainbow[3]);
// }//shape

// pt.guilloche.shape7 = function() {
// 	var options = {	
// 		colorStyle: "rainbow",
// 		globalAlpha: 0.6,
// 		lineWidth: 0.2
// 	}
// 	pt.guilloche.draw(pt.guilloche.canvas, options, pt.guilloche.keysRainbow[5]);
// }//shape
