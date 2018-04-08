$(function() {

  // Setup pym in order to embed parons graph
  var pymChild = new pym.Child();

  // Search for is_corruption parameter in url
  var isCorruption = window.location.search.indexOf('is_corruption=') != -1;

  function populateResultsTable(data, selectedYear) {
    $("#waiting-indicator").hide();
    $("#too-many-results-alert").hide();
    $('#indultos tbody').empty();
    var fragments = [];
    var displayedResults = 0;
    $.each(data, function(i, pardon) {
      // Limit maximum number of records in table, otherwise Safari crashes
      // TODO: Could do this browser-dependent, but low priority
      if ( displayedResults < 500 ) {
        if ( typeof(selectedYear)=='undefined' || selectedYear===null || selectedYear==pardon['pardon_year'] ) {
          fragments.push('<tr>');
          fragments.push('<td>'+pardon['pardon_date']+'</td>');
          fragments.push('<td>'+pardon['pardon_type']+'</td>');
          fragments.push('<td>'+pardon['crime']+'</td>');
          fragments.push('<td><a href="/indulto.html?id='+pardon['id']+'">Más &rarr;</td>');
          fragments.push('</tr>');
          displayedResults += 1;
        }
      }
    });

    if ( displayedResults == 500 )
      $('#too-many-results-alert').show();

    $(fragments.join('')).appendTo('#indultos tbody');
    $('#search-results-container').fadeIn();
    $('.footable').footable();
    // send updated height to parent
    pymChild.sendHeight();
  }

  function changeDisplayedYear(year) {
    if ( searchResults == null ) { // We're not filtering existing results, just browsing
      var deselecting = ( typeof(year)==='undefined' );
      if ( deselecting ) {
        $('#search-results-container').fadeOut();
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
    d3.range(1996, 2018, 1).forEach(function(year) {
      histogramData.push({ 'year': year, 'count': resultCount[year] ? resultCount[year] : 0 });
    });
    return histogramData;
  }

  function populateCategories(categories) {
    // Chrome will not respect the order of the JSON object, so we have to sort ourselves
    var keys = [];
    $.each(categories, function(key, value) { keys.push(key+''); });

    // And now we do populate the select
    $.each(keys.sort(), function(i, key) {
      if ( key.indexOf('.') == -1 ) { // We have a category...
        $('#search-form-category')
            .append($('<option>', { value : key })
            .attr('style', 'font-weight: bold')
            .text(categories[key]));
      } else {                          // ...or a subcategory
        $('#search-form-category')
            .append($('<option>', { value : key })
            .attr('style', 'margin-left: 10px')
            .text(categories[key]));
      }
    });
    $('#search-form-category').trigger("liszt:updated");
  }

  function resetState() {
    $("#search-form-query").val("");            // Clean search form
    $("#search-form-category").val('').trigger("liszt:updated");
    $("#search-form-region").val('').trigger("liszt:updated");

    $('#search-results-container').hide();      // Hide the results table
    histogram.clearSelection();                 // Clean histogram selection
    searchResults = null;

    // Get yearly summary from server, as a starting point
    if ( summaryData == null ) {
      // Show corruption data if url has is_corruption parameter
      if (isCorruption) {
        $.ajax({
          url: '/api/search',
          data: 'q=&category=&region=&is_corruption=on' //$("#search-form").serialize()
        }).success(function(data) {
          searchResults = data; // Save for later, when filtering by year
          histogram.draw(summarizeSearchResults(data));
        });
      } 
      // Show all data
      else {
        d3.json("/api/summary", function(error, data) {
          if (error) return console.warn(error);
          summaryData = data;
          histogram.draw(data);
        });
      }
    }
    else {
      histogram.draw(summaryData);
    }
  }

  $("#waiting-indicator").hide();
  $('#search-results-container').hide();
  summaryData = null;
  searchResults = null;
  histogram = new Histogram('#histogram', changeDisplayedYear, isCorruption);
  $('#histogram').bind('ready', function(){
    // send updated height to parent
    pymChild.sendHeight();
  });
  // Check corruption checkbox if isCorruption
  if (isCorruption) {
    $("#search-form-corruption").attr('value', 'on');
  }
  resetState();
  $(".chzn-select").chosen({ allow_single_deselect: true });

  // Populate the categories dropdown
  $.ajax({
    url: (isCorruption) ? '/files/categories-corruption.json' : '/api/categories'
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

  $(window).resize(function(){
    histogram.resize();
  });
});