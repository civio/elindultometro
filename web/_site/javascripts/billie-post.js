$(function() {
  function populateResultsTable(data) {
    $('#indultos tbody').empty();
    var fragments = [];
    var displayedResults = 0;
    $.each(data, function(i, pardon) {
      fragments.push('<tr>');
      fragments.push('<td>'+pardon['pardon_date']+'</td>');
      fragments.push('<td>'+pardon['pardon_type']+'</td>');
      fragments.push('<td>'+pardon['crime']+'</td>');
      fragments.push('<td>'+pardon['diffdays']+'</td>');
      fragments.push('<td><a href="/indulto.html?id='+pardon['id']+'">Más &rarr;</td>');
      fragments.push('</tr>');
      displayedResults += 1;
    });

    $(fragments.join('')).appendTo('#indultos tbody');
    $('#results-container').fadeIn();
    $('.footable').footable();
  }

  function loadChartData() {
    // Get categories descriptions from server
    d3.json("/api/categories", function(error, data) {
      if (error) return console.warn(error);
      descriptions = data;
      loadChartData2();
    });
  }
  
  function loadChartData2() {
    // Get categories descriptions from server
    d3.json("/api/categories/percentiles", function(error, data) {
      if (error) return console.warn(error);
      $.each(data, function(key, value) { data[key].desc = descriptions[value.crime_cat] });
      percentiles = data;
      chart.draw(percentiles);
    });
  }
  
  $('#results-container').hide();
  descriptions = null;
  percentiles = null;
  chart = new HBarChart('#barchart');
  loadChartData();

  // Populate the results table
  $.ajax({
    url: '/api/pardons/timediff/20'
  }).success(populateResultsTable);
});