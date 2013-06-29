function HBarChart(container) {
  
  var valueLabelWidth = 40; // space reserved for value labels (right)
  var barHeight = 20; // height of one bar
  var barLabelWidth = 210; // space reserved for bar labels
  var barLabelPadding = 5; // padding between bar and bar labels (left)
  var gridLabelHeight = 18; // space reserved for gridline labels
  var gridChartOffset = 3; // space between start of grid and first bar
  var maxBarWidth = 440; // width of the bar with the max value

  // accessor functions 
  var barLabel = function(d) { return d.crime_cat; };
  var barValueConvicted = function(d) { return d.convicted; };
  var barValuePardoned = function(d) { return d.pardoned; };
  var barValuePercentage = function(d) { return d.percentage;};
  
  this.draw = function(data) {
    createChart(data);
  };

  function createChart(data) {
    // scales
    var yScale = d3.scale.ordinal().domain(d3.range(0, data.length)).rangeBands([0, data.length * barHeight]);
    var y = function(d, i) { return yScale(i); };
    var yText = function(d, i) { return y(d, i) + yScale.rangeBand() / 2; };
    var x = d3.scale.linear().domain([0, d3.max(data, barValuePercentage)]).range([0, maxBarWidth]);

    // svg container element
    var chart = d3.select(container).append("svg")
      .attr('width', maxBarWidth + barLabelWidth + valueLabelWidth+barLabelPadding)
      .attr('height', gridLabelHeight + gridChartOffset + data.length * barHeight);

    // grid line labels
    var gridContainer = chart.append('g')
      .attr('transform', 'translate(' + barLabelWidth + ',' + gridLabelHeight + ')'); 
    gridContainer.selectAll("text").data(x.ticks(5)).enter().append("text")
      .attr("class","xlab")
      .attr("x", x)
      .attr("dy", -3)
      .attr("text-anchor", "middle")
      .text(String);

    gridContainer.append("text")
        .attr("class","xlab")
        .attr("x", maxBarWidth+valueLabelWidth)
        .attr("dy", -3)
        .style("text-anchor", "end")
        .text("(%)");

    // vertical grid lines
    gridContainer.selectAll("line").data(x.ticks(5)).enter().append("line")
      .attr("class","grid")
      .attr("x1", x)
      .attr("x2", x)
      .attr("y1", 0)
      .attr("y2", yScale.rangeExtent()[1] + gridChartOffset);

    // bar labels
    var labelsContainer = chart.append('g')
      .attr('transform', 'translate(' + (barLabelWidth - barLabelPadding) + ',' + (gridLabelHeight + gridChartOffset) + ')'); 

    labelsContainer.selectAll('text.category').data(data).enter().append('text')
      .attr("class","category")
      .attr('y', yText)
      .attr("dy", ".35em") // vertical-align: middle
      .attr('text-anchor', 'end')
      .text(truncateText(barLabel, function(d) { return barLabelWidth-barLabelPadding; }));

    // bars
    var barsContainer = chart.append('g')
      .attr('transform', 'translate(' + barLabelWidth + ',' + (gridLabelHeight + gridChartOffset) + ')'); 

    barsContainer.selectAll("rect").data(data).enter().append("rect")
      .attr("class", "bar")
      .attr('y', y)
      .attr('x', 0)
      .attr('height', yScale.rangeBand())
      .attr('width', function(d) { return x(d.percentage); })
      .on("mouseover", onMouseOver)
      .on("mouseout", onMouseOut);

    // start line
    barsContainer.append("line")
      .attr("class","axis")
      .attr("y1", -gridChartOffset)
      .attr("y2", yScale.rangeExtent()[1] + gridChartOffset);
  }

  function onMouseOver(d) {
    d3.select(this).classed("hovered",true);
    $("#pop-up-title").html(barLabel(d));
    $("#pop-up-content").html("Porcentaje de indultos: "+formatValue(d3.round(d.percentage, 2))+" %"+
            "<br>Condenados: "+formatValue(d3.round(d.convicted, 2))+
            " &rarr; Indultados: "+formatValue(d3.round(d.pardoned, 2))); 

    var popLeft = d3.event.pageX - $("div#pop-up").width() / 2;
    var popTop = d3.event.pageY - $("div#pop-up").height() - 230;
    $("div#pop-up").css({ "left": popLeft, "top": popTop }).show();
  }

  function onMouseOut(d) {
    d3.select(this).classed("hovered",false);
    $("div#pop-up").hide();
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

  // Given a text function and width function, truncates the text if necessary to
  // fit within the given width.
  function truncateText(text, width) {
    return function(d, i) {
      var t = this.textContent = text(d, i),
          w = width(d, i);
      if (this.getComputedTextLength() < w) return t;
      else if (w < 50) return "";
      this.textContent = "…" + t;
      var lo = 0,
          hi = t.length + 1,
          x;
      while (lo < hi) {
        var mid = lo + hi >> 1;
        if ((x = this.getSubStringLength(0, mid)) < w) lo = mid + 1;
        else hi = mid;
      }
      return lo > 1 ? t.substr(0, lo - 2) + "…" : "";
    };
  }
}