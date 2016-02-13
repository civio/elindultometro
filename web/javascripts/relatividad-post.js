$(function() {
  function loadBarChartData(eng) {
    // Get data from server
    d3.csv("/data/rel_post_crime.csv", function(error, data) {
      if (error) return console.warn(error);
      data.forEach(function(d) {
        d.convicted = +d.convicted;
        d.pardoned = +d.pardoned;
        d.percentage = d.pardoned *100/ d.convicted
      });
      hbarchart.draw(data,eng)
      loadPieChartData(eng)
    });
  }
  
  function loadPieChartData(eng) {
    // Get data from server
    var view = $("button.pie").attr("id")
    d3.csv("/data/rel_post_gender.csv", function(error, data) {
      if (error) return console.warn(error);
      data.forEach(function(d) {
        d.convicted = +d.convicted;
        d.pardoned = +d.pardoned;
        d.percentage = d.pardoned *10000/ d.convicted
      });
      piechart.draw(data,view,eng);
    });
  }
  
  $("button.pie").click(function() {
    if (!$(this).hasClass('active')) {
      $("button.pie").removeClass("active");
      $(this).addClass("active");
      piechart.update($(this).attr("id"));
    }
  });
  
  hbarchart = new HBarChart('#hbarchart');
  piechart = new PieChart('#piechart');
  var pathname = $(location).attr('pathname');
  if (pathname.indexOf("relativity") != -1) {
    loadBarChartData(true);
  }
  else {
    loadBarChartData(false);
  }
  
});