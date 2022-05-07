BrushVis = function (_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = [];
    this.parseDate = d3.timeParse("%m/%d/%Y");

    console.log("brushvis")
    console.log(this.data);
    // call method initVis
    this.initVis();
};

// init brushVis
BrushVis.prototype.initVis = function () {
    let vis = this;

    vis.margin = {top: 30, right: 50, bottom: 20, left: 50};
    vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
    vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // clip path
    vis.svg.append("defs")
        .append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", vis.width)
        .attr("height", vis.height);

    // add title
    vis.svg.append('g')
        .attr('class', 'title')
        .append('text')
        .text('Daily Positive Cases in California')
        .attr('transform', `translate(${vis.width / 2}, -15)`)
        .attr('text-anchor', 'middle');

    // init scales
    vis.x = d3.scaleTime().range([0, vis.width]);
    vis.y = d3.scaleLinear().range([vis.height, 0]);

    // init x & y axis
    vis.xAxis = vis.svg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + vis.height + ")");
    vis.yAxis = vis.svg.append("g")
        .attr("class", "axis axis--y");




    // init pathGroup
    vis.pathGroup = vis.svg.append('g').attr('class', 'pathGroup');

    // init path one (average)
    vis.pathOne = vis.pathGroup
        .append('path')
        .attr("class", "pathOne");

    // init path two (single state)
    vis.pathTwo = vis.pathGroup
        .append('path')
        .attr("class", "pathTwo");

    // init path generator
    vis.area = d3.area()
        // .curve(d3.curveMonotoneX)
        .x(function (d) {
            return vis.x(d.date);
        })
        .y0(vis.y(0))
        .y1(function (d) {
            return vis.y(d.newCases);
        });

    first_case_tooltip = vis.svg.append("g")
        .attr("class","first_case");
    this.wrangleDataStatic();
};

// init basic data processing - prepares data for brush - done only once
BrushVis.prototype.wrangleDataStatic = function () {
    let vis = this;

    // rearrange data structure and group by state
    let dataByDate = Array.from(d3.group(vis.data, d => d.Date), ([key, value]) => ({key, value}))


    console.log("parsed date")
    console.log(dataByDate);
    vis.preProcessedData = [];

    // iterate over each year
    dataByDate.forEach(year => {
        let tmpSumNewCases = 0;
        let tmpSumNewDeaths = 0;
        year.value.forEach(entry => {
            tmpSumNewCases += +entry['NewCases'];
            //tmpSumNewDeaths += +entry['new_death'];
        });

        vis.preProcessedData.push(
            {date: vis.parseDate(year.key), newCases: tmpSumNewCases, newDeaths: tmpSumNewDeaths}
        )
    });

    vis.preProcessedData.sort((a, b) => {
        return a.date - b.date;
    })


    this.wrangleDataResponsive();
};

// additional DataFiltering - only needed if we want to draw a second chart
BrushVis.prototype.wrangleDataResponsive = function () {
    let vis = this;

    vis.filteredData = [];

    // filter
    if (selectedState !== '') {
        vis.data.forEach(date => {
            if (selectedState === nameConverter.getFullName(date.state)) {
                vis.filteredData.push(date)
            }
        })
    }

    // rearrange data structure and group by state
    let dataByDate = Array.from(d3.group(vis.filteredData, d => d.submission_date), ([key, value]) => ({key, value}))

    vis.dataPathTwo = [];

    // iterate over each year
    dataByDate.forEach(year => {
        let tmpSumNewCases = 0;
        let tmpSumNewDeaths = 0;
        year.value.forEach(entry => {
            tmpSumNewCases += +entry['new_case'];
            tmpSumNewDeaths += +entry['new_death'];
        });

        vis.dataPathTwo.push(
            {date: vis.parseDate(year.key), newCases: tmpSumNewCases, newDeaths: tmpSumNewDeaths}
        )
    });
    vis.dataPathTwo.sort((a, b) => {
        return a.date - b.date;
    })


    this.wrangleData();
};

// wrangleData - gets called whenever a state is selected
BrushVis.prototype.wrangleData = function () {
    let vis = this;

    // Update the visualization
    this.updateVis();
};

// updateVis
BrushVis.prototype.updateVis = function () {
    let vis = this;

    console.log(d3.extent(vis.preProcessedData, function (d) {
        return d.date
    }));


    vis.first_date = new Date('2021-06-23');

    vis.new_preprocessed_data = [];
    vis.preProcessedData.forEach(entry=>
    {
        //console.log(entry);
        if(entry.date < vis.first_date)
        {
            vis.new_preprocessed_data.push(entry);
        }
     //   if(entry.data <= )
    });

    vis.preProcessedData = vis.new_preprocessed_data;

    // update domains
    vis.x.domain(d3.extent(vis.preProcessedData, function (d) {
        return d.date
    }));
    vis.y.domain(d3.extent(vis.preProcessedData, function (d) {
        return d.newCases
    }));

    // draw x & y axis
    vis.xAxis.transition().duration(400).call(d3.axisBottom(vis.x).ticks(5));
    vis.yAxis.transition().duration(400).call(d3.axisLeft(vis.y).ticks(5));


    // draw pathOne
    vis.pathOne.datum(vis.preProcessedData)
        .transition().duration(400)
        .attr("d", vis.area)
        .attr("fill", "rgba(220,216,216,0.85)")
        .attr("stroke", "#000000")
        .attr("clip-path", "url(#clip)")
        .style("opacity",1);


    // draw pathOne
    vis.pathTwo.datum(vis.dataPathTwo)
        .transition().duration(400)
        .attr("d", vis.area)
        .attr('fill', 'rgba(255,0,0,0.47)')
        .attr("stroke", "#darkred")
        .attr("clip-path", "url(#clip)");

    first_case_tooltip.append("line")
        .attr("x1" , vis.x(vis.preProcessedData[20].date))
        .attr("y1", 0)
        .attr("y2", vis.height)
        .attr("x2", vis.x(vis.preProcessedData[20].date))
        .attr("stroke", "#075457")
        .attr("stroke-width", "2px");

    first_case_tooltip.append("text")
        .attr("x" , vis.x(vis.preProcessedData[20].date) + 10)
        .attr("y", 20)
        .text("First Covid Case Reported")
        .style("font-size", "small")
        .attr("font-weight","bold");

    first_case_tooltip.append("text")
        .attr("x" , vis.x(vis.preProcessedData[20].date) + 10)
        .attr("y", 40)
        .text("12th Feb 2020")
        .style("font-size", "small")
        .attr("font-weight","bold");


    first_case_tooltip.append("line")
        .attr("x1" , vis.x(vis.preProcessedData[326].date))
        .attr("y1", 0)
        .attr("y2", vis.height)
        .attr("x2", vis.x(vis.preProcessedData[326].date))
        .attr("stroke", "#075457")
        .attr("stroke-width", "2px");



    first_case_tooltip.append("text")
        .attr("x" , vis.x(vis.preProcessedData[326].date) + 10)
        .attr("y", 20)
        .text("First Vaccine Administered")
        .style("font-size","small")
        .attr("font-weight","bold");

    first_case_tooltip.append("text")
        .attr("x" , vis.x(vis.preProcessedData[326].date) + 10)
        .attr("y", 40)
        .text("14th Dec 2020")
        .style("font-size","small")
        .attr("font-weight","bold");


    first_case_tooltip.append("line")
        .attr("x1" , vis.x(vis.preProcessedData[20].date))
        .attr("y1", 50)
        .attr("y2", 50)
        .attr("x2", vis.x(vis.preProcessedData[326].date))
        .attr("stroke", "#075457")
        .attr("stroke-width", "2px")
        .style("stroke-dasharray", ("3, 3"));

    first_case_tooltip.append("text")
        .attr("x" , vis.x(vis.preProcessedData[110].date) + 10)
        .attr("y", 80)
        .text("Vaccine Delivery < 1 year")
        .style("font-size","small")
        .style("font-weight","bold")
        .style("background-color", "#075457")
        .style("color", "#075457");









};