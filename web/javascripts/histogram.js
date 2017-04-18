function Histogram(container, onClickCallback, isCorruption) {

  var $container = $(container);
  
  var margin = {top: 20, right: 5, bottom: 20, left: 55};

  var totalWidth, width, height, extraMargin;

  var x = d3.scale.ordinal();

  var y = d3.scale.linear();

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");

  var svg = d3.select(container).append("svg")
      .attr("width", '100%');

  var svgContainer = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var data = null;

  var totalCount;


  this.draw = function(data) {
    getDimensions();
    if ( this.data == null )
      createBars(data);
    else
      updateBars(data);
    this.data = data;  // Save for later
    // Send ready event
    $container.trigger('ready');
  };

  this.clearSelection = function() {
    d3.selectAll("rect").classed("selected",false);
  };

  this.resize = function() {
    getDimensions();
    redrawBars();
  }

  function getDimensions() {
    totalWidth = Math.min(800, $container.width()); // 800: max width
    width = totalWidth - margin.left - margin.right;
    height = Math.max(180, (width / 2) - margin.top - margin.bottom);
    // Set svg height
    svg.attr("height", height + margin.top + margin.bottom);
    // Set scale dimensions
    x.rangeRoundBands([0, width], 0.1);
    y.range([height, 0]);
    // Make sure the container is centered if we're not using the whole width
    extraMargin = Math.max(0, $container.width() - totalWidth) / 2;
    $container.css('margin-left', extraMargin);
  }

  function createBars(data) {
    totalCount = 0;
    x.domain(data.map(function(d) { return d.year; }));
    y.domain([0, d3.max(data, function(d) { totalCount += d.count; return d.count; })]);

    svgContainer.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svgContainer.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(-10," + 0 + ")")
        .call(yAxis)
      .append("text")
        //.attr("transform", "rotate(-90)")
        .attr("y", -10)
        //.attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Indultos");

    svgContainer.selectAll(".bar")
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

    svgContainer.append("text")
        .attr("y", -5)
        .attr("transform", "translate("+width+",0)")
        .style("text-anchor", "end")
        .attr("class", "total-count")
        .text(getTotalCountLabel());
  }

  function updateBars(data) {
    totalCount = 0;
    y.domain([0, d3.max(data, function(d) { totalCount += d.count; return d.count; })]);
    svgContainer.select("g.y")
        .call(yAxis);
    
    svgContainer.selectAll("rect")
        .data(data)
        .transition()
        .duration(1000)
        .attr("y", function(d) { return y(d.count); })
        .attr("height", function(d) { return height - y(d.count); });

    svgContainer.selectAll(".total-count")
        .text(getTotalCountLabel());
  }

  function redrawBars() {

    svgContainer.select(".x.axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svgContainer.select(".y.axis")
        .call(yAxis)

    svgContainer.selectAll(".bar")
        .attr("x", function(d) { return x(d.year); })
        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y(d.count); })
        .attr("height", function(d) { return height - y(d.count); });

    svgContainer.select(".total-count")
        .attr("transform", "translate("+width+",0)");
  }

  function onMouseOver(d) {
    if (!d3.select(this).classed("selected"))
      d3.select(this).classed("hovered",true);

    $("#pop-up-title").html(d.year + ": " + d.count + " Indultos");
    var popLeft = d3.event.pageX - $("div#pop-up").width() / 2;
    var popTop = d3.event.pageY - $("div#pop-up").height() - 30;
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

  function getTotalCountLabel() {
    return (isCorruption) ? "Total: "+totalCount+" indultos a delitos de corrupción" : "Total: "+totalCount+" indultos";;
  }
}