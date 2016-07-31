/* global d3 */

var pt = pt || {};

pt.slideIdToFunctions = {
  'hexagon-showcase': {
    'init': function() {
      pt.hexagonShowcase.init();
    },
    '-1': function() {
      pt.hexagonShowcase.gradient();
    },
    0: function() {
      pt.hexagonShowcase.gooey();
    },
    1: function() {
      pt.hexagonShowcase.animated();
    },
    2: function() {
      pt.hexagonShowcase.slider();
    },
    3: function() {
      pt.hexagonShowcase.planet();
    },
    4: function() {
      pt.hexagonShowcase.glow();
    },
    5: function() {
      pt.hexagonShowcase.colorBlend();
    }
  },
  'exo-planets': {
    'init': function() {
      pt.exoplanets.init(planets);
    },
    '-1': function() {
      pt.exoplanets.rotatePlanets();
    },
    0: function() {
      pt.exoplanets.draw0();
    },
    1: function() {
      pt.exoplanets.draw1();
    },
    2: function() {
      pt.exoplanets.draw2();
    },
    3: function() {
      pt.exoplanets.draw3();
    },
    4: function() {
      pt.exoplanets.draw4();
    },
    5: function() {
      pt.exoplanets.draw5();
    },
    6: function() {
      pt.exoplanets.draw6();
    }
  },
  'spiro-graph-formula': {
    'init': function() {
      pt.spiroGraphFormula.init();
    },
    '-1': function() {
      pt.spiroGraphFormula.resetOpacity();
    },
    0: function() {
      pt.spiroGraphFormula.showSpiros();
    }
  },
  'spiro-graph': {
    'init': function() {
      pt.spiroGraph.init();
    },
    '-1': function() {
      pt.spiroGraph.spiro1();
    },
    0: function() {
      pt.spiroGraph.spiro2();
    },
    1: function() {
      pt.spiroGraph.spiro3();
    },
    2: function() {
      pt.spiroGraph.spiro4();
    },
    3: function() {
      pt.spiroGraph.spiro5();
    },
    4: function() {
      pt.spiroGraph.spiro6();
    },
    5: function() {
      pt.spiroGraph.spiro7();
    },
    6: function() {
      pt.spiroGraph.spiro8();
    }
    // 7: function() {
    //   pt.spiroGraph.spiro9();
    // }
  },
  'guilloche': {
    'init': function() {
      pt.guilloche.init();
    },
    '-1': function() {
      pt.guilloche.shapeStart();
    },
    0: function() {
      pt.guilloche.shapeEnd();
    },
    1: function() {
      pt.guilloche.shape1();
    },
    2: function() {
      pt.guilloche.shape2();
    },
    3: function() {
      pt.guilloche.shape3();
    },
    4: function() {
      pt.guilloche.shape4();
    },
    5: function() {
      pt.guilloche.shape5();
    },
    6: function() {
      pt.guilloche.shape6();
    },
    7: function() {
      pt.guilloche.shape7();
    }
  },
  'pi-walk': {
    'init': function() {
      pt.piWalk.init();
    },
    '-1': function() {
      pt.piWalk.drawLegend();
    },
    0: function() {
      pt.piWalk.fadeLegend();
    },
    1: function() {
      pt.piWalk.zoomOutToThousand();
    },
    2: function() {
      pt.piWalk.zoomOutToTenThousand();
    },
    3: function() {
      pt.piWalk.startFinishColor();
    },
    4: function() {
      pt.piWalk.clearCanvas();
    }
  }
};

function removeSVGs() {

  //Remove (heavy) all existing svgs currently running
  d3.select('#hexagon-showcase #hexagonShowcase svg').remove();

  clearInterval(pt.guilloche.Interval);

  //Make the planet d3 timer stop
  pt.exoplanets.keepPlanetsRotating = true;
  pt.exoplanets.stopTooltip = true;



}
