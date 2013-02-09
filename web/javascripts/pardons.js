$(function() {
  function populateResultsTable(data) {
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

  function fetchDataForYear(year) {
    $.ajax({
      url: '/api/pardons?callback=?',
      data: {year: year},
      dataType: "jsonp",
      jsonpCallback: "onLoad",
      cache: false  // FIXME: development
    }).success(populateResultsTable);
  }

  function doSearch(query) {
    $.ajax({
      url: '/api/search',
      data: {q: query}
    }).success(function(data) {
      populateResultsTable(data);
      histogram.redraw(summarizeData(data));
    });
  }

  // Given a set of items, calculate the per-year count
  function summarizeData(data) {
    count = d3.nest()
      .key(function(d) { return d.pardon_year; })
      .sortKeys(d3.ascending)
      .rollup(function (a) { return a.length; })
      .map(data);

    return $.map( count, function( value, index ) {
      return {
        'year': index,
        'count': value
      };
    });
  }

  histogram = new Histogram('#histogram', fetchDataForYear);

  // Get yearly summary from server, as a starting point
  d3.json("/api/summary", function(error, data) {
    if (error) return console.warn(error);
    histogram.setData(data);
  });

  // Select last year as the starting point
  fetchDataForYear('2013');  // TODO: Remove hardcoded year
  // Highlight selected year FIXME: Not working needs probably a delay
  // d3.select("rect#a_2013").classed("selected",true);

  // Intercept the default search
  $("#search-form").submit(function() {
    doSearch($("#search-form-query").val());
    return false;
  });
});