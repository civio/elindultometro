$(function() {
  function renderSearchResults(data) {
    renderResults(data);
    updateData = summarizeData(data);
    redraw(updateData);
  }
  
  function renderResults(data) {
    $('#indultos tbody').empty();
    var fragments = [];
    $.each(data, function(key, pardon) {
      fragments.push('<tr>');
      fragments.push('<td><a href="/indulto.html?id='+pardon['id']+'">&rarr;</td>');
      fragments.push('<td>'+pardon['pardon_date']+'</td>');
      fragments.push('<td>'+pardon['pardon_type']+'</td>');
      fragments.push('<td>'+pardon['crime']+'</td>');
      fragments.push('<td><a target="_blank" href="http://www.boe.es/diario_boe/txt.php?id='+pardon['id']+'">'+pardon['id']+'</td>');
      fragments.push('</tr>');
    });
    $(fragments.join('')).appendTo('#indultos tbody');
    $('.footable').footable();
  }

  function displayYear(year) {
    $.ajax({
      url: '/api/pardons?callback=?',
      data: {year: year},
      dataType: "jsonp",
      jsonpCallback: "onLoad",
      cache: false  // FIXME: development
    }).success(renderResults);
  }

  function doSearch(query) {
    $.ajax({
      url: '/api/search',
      data: {q: query}
    }).success(renderSearchResults);
  }
  
  function summarizeData(data) {
    auxData = d3.nest()
      .key(function(d) { return d.pardon_year; })
      .sortKeys(d3.ascending)
      .rollup(function (a) { return a.length; })
      .map(data);
    newData = [];
    years = d3.range(1996,2014,1);
    years.forEach(function(el) {
      o = {};
      o.year = el;
      o.count = auxData[el] ? auxData[el] : 0;
      newData.push(o);
    });
    return newData;
  }
  
  function redraw(data) {
    // Update...
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
    } else {
      d3.selectAll("rect").classed("selected",false);
      d3.select(this).classed("selected",true);
    }
    $("#search-form-query").val();
    displayYear(d.year);
  }

  // FIXME: hardcoded size
  var margin = {top: 20, right: 20, bottom: 30, left: 60},
      width = 800 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;

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

  var svg = d3.select("#summary-viz").append("svg")
      .attr("width", '100%')
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  d3.json("/api/summary", function(error, data) {
    if (error) return console.warn(error);

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
  });

  displayYear('2013');
  //FIXME: Not working needs probably a delay
  prueba = d3.select("rect#a_2013").classed("selected",true);

  $("#search-form").submit(function() {
    doSearch($("#search-form-query").val());
    return false;
  });
});