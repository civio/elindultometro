$(function() {
  function populateResultsTable(data, selectedYear) {
    $("#waiting-indicator").hide();
    $('#indultos tbody').empty();
    var fragments = [];
    $.each(data, function(key, pardon) {
      if ( typeof(selectedYear)=='undefined' || selectedYear===null || selectedYear==pardon['pardon_year'] ) {
        fragments.push('<tr>');
        fragments.push('<td><a href="/indulto.html?id='+pardon['id']+'">&rarr;</td>');
        fragments.push('<td>'+pardon['pardon_date']+'</td>');
        fragments.push('<td>'+pardon['pardon_type']+'</td>');
        fragments.push('<td>'+pardon['crime']+'</td>');
        fragments.push('<td><a target="_blank" href="http://www.boe.es/diario_boe/txt.php?id='+pardon['id']+'">'+pardon['id']+'</td>');
        fragments.push('</tr>');
      }
    });
    $(fragments.join('')).appendTo('#indultos tbody');
    $('#indultos').fadeIn();
    $('.footable').footable();
  }

  function changeDisplayedYear(year) {
    var currentPill = $('.tab-pane.active').first().attr('id');
    if ( currentPill == 'by_year' ) { // Fetch new data
      $("#waiting-indicator").show();
      $.ajax({
        url: '/api/pardons/year/'+year
      }).success(function(data) {
        populateResultsTable(data);
      });
    } else {
      populateResultsTable(searchResults, year);
    }
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
    // TODO: Remove hardcoded year range
    histogramData = [];
    d3.range(1996, 2014, 1).forEach(function(year) {
      histogramData.push({ 'year': year, 'count': resultCount[year] ? resultCount[year] : 0 });
    });
    return histogramData;
  }

  function resetState() {
    $('#indultos').fadeOut();         // Hide the results table
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

  $("#waiting-indicator").hide();
  summaryData = null;
  searchResults = null;
  histogram = new Histogram('#histogram', changeDisplayedYear);

  // Init work every time tabs are displayed, and at the beginning
  $('a[data-toggle="pill"]').on('show', function (e) {
    resetState();
  });
  $('#indultos').hide();
  resetState();

  // Clear form
  $('#clear-form-button').click(function(){ return false; });

  // Intercept the default search form submit, and use AJAX instead
  $("#search-form").submit(function() {
    // FIXME: Check we are filtering along some criteria
    $("#waiting-indicator").show();
    $.ajax({
      url: '/api/search',
      data: $("#search-form").serialize()
    }).success(function(data) {
      searchResults = data; // Save for later, when filtering by year
      populateResultsTable(data);
      histogram.draw(summarizeSearchResults(data));
    });
    return false;
  });

  $(".chzn-select").chosen();
});