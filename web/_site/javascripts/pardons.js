$(function() {
  function populateResultsTable(data, selectedYear) {
    $("#waiting-indicator").hide();
    $('#indultos tbody').empty();
    var fragments = [];
    $.each(data, function(key, pardon) {
      if ( typeof(selectedYear)=='undefined' || selectedYear===null || selectedYear==pardon['pardon_year'] ) {
        fragments.push('<tr>');
        fragments.push('<td>'+pardon['pardon_date']+'</td>');
        fragments.push('<td>'+pardon['pardon_type']+'</td>');
        fragments.push('<td>'+pardon['crime']+'</td>');
        fragments.push('<td><a href="/indulto.html?id='+pardon['id']+'">Más &rarr;</td>');
        fragments.push('</tr>');
      }
    });
    $(fragments.join('')).appendTo('#indultos tbody');
    $('#indultos').fadeIn();
    $('.footable').footable();
  }

  function changeDisplayedYear(year) {
    if ( searchResults == null ) { // We're not filtering existing results, just browsing
      var deselecting = ( typeof(year)==='undefined' );
      if ( deselecting ) {
        $('#indultos').fadeOut();
      } else {
        $("#waiting-indicator").show();
        $.ajax({
          url: '/api/pardons/year/'+year
        }).success(function(data) {
          populateResultsTable(data);
        });
      }
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

  function populateCategories(categories) {
    $.each(categories, function(key, value) {
      if ( key.indexOf('.') == -1 ) { // We have a category...
        $('#search-form-category')
            .append($('<option>', { value : key })
            .attr('style', 'font-weight: bold')
            .text(value));
      } else {                          // ...or a subcategory
        $('#search-form-category')
            .append($('<option>', { value : key })
            .attr('style', 'margin-left: 10px')
            .text(value));
      }
    });
    $('#search-form-category').trigger("liszt:updated");
  }

  function resetState() {
    $("#search-form-query").val("");  // Clean search form
    $("#search-form-category").val('').trigger("liszt:updated");
    $("#search-form-region").val('').trigger("liszt:updated");

    $('#indultos').fadeOut();         // Hide the results table
    histogram.clearSelection();       // Clean histogram selection
    searchResults = null;

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
  $('#indultos').hide();
  summaryData = null;
  searchResults = null;
  histogram = new Histogram('#histogram', changeDisplayedYear);
  resetState();
  $(".chzn-select").chosen({ allow_single_deselect: true });

  // Populate the categories dropdown
  $.ajax({
    url: '/api/categories'
  }).success(populateCategories);

  // Implement button to clear form
  $('#clear-form-button').click(function(){ resetState(); return false; });

  // Intercept the default search form submit, and use AJAX instead
  $("#search-form").submit(function() {
    // FIXME: Check we are filtering along some criteria
    $("#waiting-indicator").show();
    histogram.clearSelection();
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
});