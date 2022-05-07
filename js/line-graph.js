// SVG Area

var margin_line = {
    top: 30,
    right: 80,
    bottom: 100,
    left: 80
  },
  width_line = 1200 - margin_line.left - margin_line.right,
  height_line = 755 - margin_line.top - margin_line.bottom;

var myVis = d3.select("#line-graph").append("svg")
  .attr("width", width_line + margin_line.left + margin_line.right)
  .attr("height", height_line + margin_line.top + margin_line.bottom)
  .append("g")
  .attr("transform", "translate(" + margin_line.left + "," + margin_line.top + ")");


// scales
var colorscale = d3.scaleOrdinal(d3.schemeCategory20b);
var x = d3.scaleBand()
  .range([0, width_line]);
var y = d3.scaleLinear()
  .range([height_line, 0]);


queue()
  .defer(d3.csv, "data/data2.csv")
  .defer(d3.csv, "data/degree-data.csv")
  .await(dataHandler);

//initialize

function dataHandler(error, data2, degreeData) {
  //nest data by year - used hw 6 and some stack overflow for help
  // console.log(fundingCsv);
  var dataNest = d3.nest()
    .key(function(d) {
      return d.FieldOfStudy;
    })
    .entries(degreeData);
  dataNest.forEach(function(d) {
    d.values.forEach(function(e) {
      var storage = [];
      for (var key in e) {
        if (e[key] !== d.key) {
          storage.push({
            "year": key,
            "value": e[key]
          });
        }
      }
      d.values = storage;
    });
  });

  dataNest.forEach(function(d) {
    d.values.forEach(function(e) {
        e.value = e.value.replace(/,/g, "");
        e.value = parseInt(e.value,10);
    })
  });

// console.log(dataNest);


  x.domain(["1970-71","1975-76","1980-81","1985-86","1990-91","1995-96","2000-01","2005-06","2006-07","2008-09","2009-10","2010-11","2011-12","2012-13","2013-14","2014-15","2015-16","2016-17"])
  y.domain([
    0,
    d3.max(dataNest, function(d) {
      return d3.max(d.values, function(e) {
        return e.value;
      });
    })
  ]);

  // axes
  var xAxis = d3.axisBottom()
    .scale(x);
  var yAxis = d3.axisLeft()
    .scale(y);
  myVis.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height_line + ")")
    .call(xAxis)
    .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-30)");
  // Set the Y axis
  myVis.append("g")
    .attr("class", "y axis")
    .call(yAxis);

  // line function
  var line = d3.line()
    .x(function(d) {
      return x(d.year) + 18;
    })
    .y(function(d) {
      return y(d.value);
    });


    var label = myVis.append("text")
        .attr("x", 50)
        .attr("y", 500);

  // Draw the lines
  var drawnLine = myVis.selectAll(".line")
    .data(dataNest)
    .enter()
    .append("g")
    .attr("class", "lines");
  drawnLine.append("path")
    .attr("class", "line")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
    .attr("d", d => line(d.values))
    .style("stroke", function(d) {
      return colorscale(d.key)
    })
    .style("opacity", .5)
    .style('stroke-width', 2)
    // hover effects
      // http://jsfiddle.net/pnavarrc/4fgv4/2
      // sample code for changes in line thickness on hover
      .on('mouseover', function(d){
          drawnLine.append("text")
              .text(d.key)
              .attr("class", "mousetext")
              .attr("x", 400)
              .attr("y", 225)
              .style("fill", colorscale(d.key));
          d3.select(this)
              .transition()
              .duration(0)
              .style("opacity",1)
              .style('stroke-width', 7);
      })
      .on('mouseout', function(d){
          drawnLine.selectAll(".mousetext").remove();
          d3.select(this)
              .transition()
              .duration(100)
              .style('stroke-width', d.w)
              .style("opacity",.5);
       });




  myVis.append("text")
    .attr("class", "axislabel")
    .attr("x", (width_line / 2 + 10))
    .attr("y", height_line + 60)
    .attr("dy", ".1em")
    .style("text-anchor", "end")
      .style("font", "Helvetica")
    .text("School Year");
  myVis.append("text")
    .attr("class", "axislabel")
    .attr("x", -200)
    .attr("y", -67)
    .attr("dy", ".1em")
    .attr("transform", "rotate(-90)")
    .style("text-anchor", "end")
      .style("font", "Helvetica")
    .text("Number of Students");

    myVis.append("text")
        .attr("class", "title_line")
        .attr("x", 675)
        .attr("y", 1)
        .attr("dy", ".1em")
        .style("text-anchor", "end")
        .style("font", "Helvetica")
        .style("text-decoration", "underline")
        .text("What Students Have Studied Over Time");

}
