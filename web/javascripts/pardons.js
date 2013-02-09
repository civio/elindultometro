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
    $('#indultos').show();
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
      histogram.draw(summarizeSearchResults(data));
    });
  }

  // Given a set of items, calculate the per-year count
  function summarizeSearchResults(data) {
    // Count the search results per year
    resultCount = d3.nest()
      .key(function(d) { return d.pardon_year; })
      .sortKeys(d3.ascending)
      .rollup(function (a) { return a.length; })
      .map(data);

    // We need to return an exhaustive list (with zeroes when nothing is
    // found for a year), so the histogram is updated correctly
    histogramData = [];
    d3.range(1996, 2014, 1).forEach(function(year) {
      histogramData.push({ 'year': year, 'count': resultCount[year] ? resultCount[year] : 0 });
    });
    return histogramData;
  }

  function resetState() {
    $('#indultos').hide();            // Hide the results table
    histogram.clearSelection();       // Clean histogram selection
    $("#search-form-query").val("");  // Clean search form

    // Get yearly summary from server, as a starting point
    if ( summaryData == null )
      d3.json("/api/summary", function(error, data) {
        if (error) return console.warn(error);
        summaryData = data;
        histogram.draw(data);
      });
    else
      histogram.draw(summaryData);
  }

  summaryData = null;
  histogram = new Histogram('#histogram', fetchDataForYear);

  // Init work every time tabs are displayed, and at the beginning
  $('a[data-toggle="pill"]').on('show', function (e) {
    resetState();
  });
  resetState();

  // Intercept the default search
  $("#search-form").submit(function() {
    doSearch($("#search-form-query").val());
    return false;
  });
});