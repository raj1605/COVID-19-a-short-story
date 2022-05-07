/* * * * * * * * * * * * * *
*          MapVis          *
* * * * * * * * * * * * * */


class MapVis {

    constructor(parentElement, covidData, usaData, geoStatesData){
        this.parentElement = parentElement;
        this.covidData = covidData;
        this.usaData = usaData;
        this.geoStatesData = geoStatesData;
        this.displayData = [];

        // parse date method
        this.parseDate = d3.timeParse("%m/%d/%Y");

        this.initTable()
    }

    initTable()
    {
        let vis = this;

        vis.margin = {top: 0, right: 50, bottom: 20, left: 50};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.svg.append('g')
            .attr('class', 'title')
            .append('text')
            .attr('transform', `translate(${vis.width / 2}, 20)`)
            .attr('text-anchor', 'middle');

        // adjust map position
        vis.map = vis.svg.append("g") // group will contain all state paths
            .attr("class", "states");

        vis.states = topojson.feature(vis.geoStatesData, vis.geoStatesData.objects.states);

        vis.projection = d3.geoIdentity()
            .fitSize([vis.width , vis.height-150], vis.states);

        vis.statePath = d3.geoPath()
            .projection(vis.projection);


        vis.mapPaths = vis.map.selectAll(".statePath")
            .data(vis.states.features)
            .enter()
            .append("path")
            .attr("class", "statePath")
            .attr("d", vis.statePath)
            .attr("transform", "translate(0,0)")
            .attr("fill", "white")
            .attr("stroke", "black");

        vis.colors = ["rgba(220,216,216,0.85)" ,"#075457"];
        vis.scale = d3.scaleLinear()
            .range(vis.colors);

        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'barTooltip');

        vis.defs = vis.svg.append("defs");
        vis.linearGradient =  vis.defs.append("linearGradient")
            .attr("id", "linear-gradient");
        vis.linearGradient
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0%");


        vis.linearGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "rgba(220,216,216,0.85)");


        vis.linearGradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#075457");

        vis.legend = vis.svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${vis.width * 0.2}, ${vis.height*0.80})`);


        vis.legend.append("rect")
            .attr("width", 200)
            .attr("height", 20)
            .style("fill", "url(#linear-gradient)");

        vis.legend.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + 20 + ")")
            .style("font","10px times");

        vis.x = d3.scaleLinear()
            .range([0,200]);


        vis.xAxis = d3.axisBottom()
            .scale(vis.x)
            .ticks(4);

        vis.wrangleData()

    }

    wrangleData()
    {
        let vis = this;


        let filteredData = [];

        // if there is a region selected
        if (selectedTimeRange.length !== 0) {
            //console.log('region selected', vis.selectedTimeRange, vis.selectedTimeRange[0].getTime() )

            // iterate over all rows the csv (dataFill)
            vis.covidData.forEach(row => {
                // and push rows with proper dates into filteredData
                if (selectedTimeRange[0].getTime() <= vis.parseDate(row.submission_date).getTime() && vis.parseDate(row.submission_date).getTime() <= selectedTimeRange[1].getTime()) {
                    filteredData.push(row);
                }
            });
        } else {
            filteredData = vis.covidData;
        }

        // prepare covid data by grouping all rows by state
        let covidDataByState = Array.from(d3.group(filteredData, d => d.state), ([key, value]) => ({key, value}))

        // have a look
        // console.log(covidDataByState)

        // init final data structure in which both data sets will be merged into
        vis.stateInfo = []

        // merge
        covidDataByState.forEach(state => {

            // get full state name
            let stateName = nameConverter.getFullName(state.key)

            // init counters
            let newCasesSum = 0;
            let newDeathsSum = 0;
            let population = 0;

            // look up population for the state in the census data set
            vis.usaData.forEach(row => {
                if (row.state === stateName) {
                    population += +row["2020"].replaceAll(',', '');
                }
            })

            // calculate new cases by summing up all the entries for each state
            state.value.forEach(entry => {
                newCasesSum += +entry['new_case'];
                newDeathsSum += +entry['new_death'];
            });

            //console.log(newCasesSum, population);
            /*if (population == 0)
            {
                population = 1000;
            }*/
            //console.log(newCasesSum, population);

            // populate the final data structure
            if(population!=0)
            {
                vis.stateInfo.push(
                    {
                        state: stateName,
                        population: population,
                        absCases: newCasesSum,
                        absDeaths: newDeathsSum,
                        relCases: ((newCasesSum / population) * 100),
                        relDeaths: ((newDeathsSum / population) * 100)
                    }
                )
            }
        })

        //console.log('final data structure for myDataTable', vis.stateInfo);
        vis.updateVis()

    }

    updateVis()
    {
        let vis = this;

        vis.selectedColumn = vis.stateInfo.map(d=>d["population"]);
        vis.x.domain([d3.min(vis.selectedColumn) ,d3.max(vis.selectedColumn)]);
        vis.svg.select(".x-axis").call(vis.xAxis);

        console.log(vis.selectedColumn);

        //console.log(vis.selectedColumn);

        vis.scale.domain([d3.min(vis.selectedColumn) ,d3.max(vis.selectedColumn)]);

        vis.mapPaths
            .attr("fill", d=>
            {
                let selected_color = "#ffffff";
                vis.stateInfo.forEach(entry =>
                {
                    //console.log(entry["absCases"]);
                    if (entry["state"] == d.properties.name)
                    {
                        //console.log(vis.scale(entry[selectedCategory]));
                        //return vis.scale(entry["absCases"]);
                        selected_color = vis.scale(entry["population"]);
                    }
                });
                return selected_color;

            })
            .attr("stroke","black")
            .on('mouseover', function(event, d){
                d3.select(this)
                    .attr('stroke', 'black')
                    .attr('fill', '#450000');


                let population = 0;
                let cases_abs = 0;
                let cases_rel = 0;
                let death_abs = 0;
                let death_rel = 0;


                vis.stateInfo.forEach(entry =>
                {
                    //console.log(entry["absCases"]);
                    if (entry["state"] == d.properties.name)
                    {
                        population = entry["population"];
                        cases_abs = entry['absCases'];
                        cases_rel = entry['relCases'];
                        death_abs = entry['absDeaths'];
                        death_rel = entry['relDeaths'];

                    }
                });


                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
             <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
                 <h6> State: ${d.properties.name}</h6> 
                 Population : ${population} <br>                     
             </div>`)
            })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .attr("fill", d =>
                        {
                            let selected_color = "#cdf4f6";
                            vis.stateInfo.forEach(entry =>
                            {
                                //console.log(entry["absCases"]);
                                if (entry["state"] == d.properties.name)
                                {
                                    //console.log(vis.scale(entry[selectedCategory]));
                                    //return vis.scale(entry["absCases"]);
                                    selected_color = vis.scale(entry["population"]);
                                }
                            });
                            return selected_color;
                        }
                    );

                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            });


    }
}