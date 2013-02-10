function Histogram(container, onClickCallback) {

  var totalWidth = Math.min(800, $(container).width()); // 800: max width
  var margin = {top: 20, right: 20, bottom: 30, left: 60};
  var width = totalWidth - margin.left - margin.right;
  var height = (width / 2) - margin.top - margin.bottom;

  var x = d3.scale.ordinal()
      .rangeRoundBands([0, width], 0.1);

  var y = d3.scale.linear()
      .range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");

  var svg = d3.select(container).append("svg")
      .attr("width", '100%')
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Make sure the container is centered if we're not using the whole width
  var extraMargin = Math.max(0, $(container).width() - totalWidth) / 2;
  $(container).css('margin-left', extraMargin);

  var data = null;

  this.draw = function(data) {
    if ( this.data == null )
      createBars(data);
    else
      updateBars(data);
    this.data = data;  // Save for later
  };

  this.clearSelection = function() {
    d3.selectAll("rect").classed("selected",false);
  };

  function createBars(data) {
    x.domain(data.map(function(d) { return d.year; }));
    y.domain([0, d3.max(data, function(d) { return d.count; })]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(-10," + 0 + ")")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Indultos");

    svg.selectAll(".bar")
        .data(data)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("id", function(d) { return "a_"+d.year; })
        .attr("x", function(d) { return x(d.year); })
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y(d.count); })
        .attr("height", function(d) { return height - y(d.count); })
        .on("mouseover", onMouseOver)
        .on("mouseout", onMouseOut)
        .on("click", onMouseClick);
  }

  function updateBars(data) {
    y.domain([0, d3.max(data, function(d) { return d.count; })]);
    svg.select("g.y")
        .call(yAxis);
    
    svg.selectAll("rect")
         .data(data)
         .transition()
         .duration(1000)
         .attr("y", function(d) { return y(d.count); })
         .attr("height", function(d) { return height - y(d.count); });
  }

  function onMouseOver(d) {
    if (!d3.select(this).classed("selected"))
      d3.select(this).classed("hovered",true);

    $("#pop-up-title").html(d.year + ": " + d.count + " Indultos");
    var popLeft = d3.event.pageX - $("div#pop-up").width() / 2;
    var popTop = d3.event.pageY - $("div#pop-up").height() - 350;
    $("div#pop-up").css({ "left": popLeft, "top": popTop }).show();
  }
  
  function onMouseOut(d) {
    d3.select(this).classed("hovered",false);
    $("div#pop-up").hide();
  }

  function onMouseClick(d) {
    if (d3.select(this).classed("selected")) {
      d3.select(this).classed("selected",false);
      onClickCallback();
    } else {
      d3.selectAll("rect").classed("selected",false);
      d3.select(this).classed("selected",true);
      onClickCallback(d.year);
    }
  }
}