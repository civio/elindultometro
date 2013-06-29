function PieChart(container) {
  
  var width = 600,
      height = 300,
      radius = Math.min(width, height) / 2;
  var path = null;

  // accessor functions 
  var color = d3.scale.ordinal()
              .range(["#41B7D8", "#E9A3C9"]);

  var pie = d3.layout.pie()
            .value(function(d) { return d.pardoned; })
            .sort(null);

  var arc = d3.svg.arc()
            .outerRadius(radius - 10)
            .innerRadius(0);
  
  this.draw = function(data,view) {
    createChart(data,view);
  };
  
  this.update = function(view) {
    var value = view == "abs" ? "pardoned" : "percentage";
    pie.value(function(d) { return d[value]; }); // change the value function
    path = path.data(pie); // compute the new angles
    path.transition().duration(1000).attrTween("d", arcTween); // redraw the arcs
  }

  function createChart(data,view) {
    var chart = d3.select(container).append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
      
    var value = view == "abs" ? "pardoned" : "percentage";
    pie.value(function(d) { return d[value]; }); // change the value function

    path = chart.datum(data).selectAll("path")
        .data(pie)
        .enter().append("path")
        .attr("fill", function(d, i) { return color(i); })
        .attr("d", arc)
        .on("mouseover",onMouseOver)
        .on("mouseout",onMouseOut)
        .each(function(d) { this._current = d; }); // store the initial angles
  }

  function onMouseOver(d) {
    d3.select(this).classed("hovered",true);
    $("#pop-up-title").html(d.data.gender);
    $("#pop-up-content").html(popupContent(d.data)); 

    var popLeft = d3.event.pageX - $("div#pop-up").width() / 2;
    var popTop = d3.event.pageY - $("div#pop-up").height() - 220;
    $("div#pop-up").css({ "left": popLeft, "top": popTop }).show();
  }

  function onMouseOut(d) {
    d3.select(this).classed("hovered",false);
    $("div#pop-up").hide();
  }
  
  function popupContent(d) {
    var view = $("button.pie.active").attr('id')
    if (view == "abs") {
      return "Indultados: "+d.pardoned;
    }
    else {
      return  formatValue(d3.round(d.percentage, 2))+" indultos por cada 10.000 condenados"+
              "<br>Condenados: "+formatValue(d3.round(d.convicted, 2))+
              " &rarr; Indultados: "+formatValue(d3.round(d.pardoned, 2));
    }
  }

  // Store the displayed angles in _current.
  // Then, interpolate from _current to the new angles.
  // During the transition, _current is updated in-place by d3.interpolate.
  function arcTween(a) {
    var i = d3.interpolate(this._current, a);
    this._current = i(0);
    return function(t) {
      return arc(i(t));
    };
  }
  
  /***************Formatting functions**********************************************/
  function formatValue(a) {
  var s = a.toString(),
    i = a.toString().indexOf(".");

    i > -1 && (s = Math.round(a).toString());
    if (s.length > 9) {
      v = s.substring(0, s.length - 9) + "." + s.substring(s.length - 9, s.length - 6) + 
      "." + s.substring(s.length - 6, s.length - 3) + "." + s.substring(s.length - 3, s.length);
    }
    else if (s.length > 6) { 
      v = s.substring(0, s.length - 6) + "." + s.substring(s.length - 6, s.length - 3) + "." + s.substring(s.length - 3, s.length);
    }
    else if (s.length > 3) { 
      v = s.substring(0, s.length - 3) + "." + s.substring(s.length - 3, s.length);
    }
    else {
      i > -1 ? v = a.toString().substring(0, i) + "," + a.toString().substring(i + 1, i + 3): v = s;
    }
    return v
  }
}