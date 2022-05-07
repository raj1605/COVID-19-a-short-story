class GraphVis{
    constructor(parentElement, timelineData){
        this.parentElement = parentElement;
        this.vaccineData = timelineData;

        //for legend
        this.appendix = [{key: "Traditional Vaccines", value: "rgba(185,180,180,0.85)"}, {key: "Covid Vaccine", value: "#075457"}];

        this.tooltipText = {
            "Development": ["Traditional Vaccine: 2 Years\n",
                "COVID Vaccine: 4 months"],
            "Phase 1": ["Traditional Vaccine: 2 Years\n",
                "COVID Vaccine: 4 months"],
            "Phase 2": ["Traditional Vaccine: 2-3 Years\n",
                "COVID Vaccine: 7 Months"],
            "Phase 3": ["Traditional Vaccine: 2-3 Years\n",
                "COVID Vaccine: 1 Year"]};
        console.log("testing dict")
        console.log(this.tooltipText["Phase 1"])
        this.initGraph()
    }

    initGraph(){
        let vis = this;

        vis.margin = {top: 10, right: 30, bottom: 30, left: 50};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom-100;

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom+100)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + (vis.margin.top +100 )+ ")");

        //create axis
        console.log(vis.vaccineData);
        vis.minDate = d3.min(vis.vaccineData, function(d) { return d.StartDate; });
        vis.maxDate = d3.max(vis.vaccineData, function(d) { return d.EndDate; });

        vis.phasesByVaccines = d3.group(vis.vaccineData, d=>d.Phase)
        console.log("data by type of phase");
        console.log(vis.phasesByVaccines);

        vis.covidVaccineRelease = d3.min(vis.phasesByVaccines.get("Phase 3"), function(d){ return d.EndDate;});
        console.log("covid release date - "+vis.covidVaccineRelease);

        vis.x = d3.scaleTime()
            .range([0,vis.width-vis.margin.left-vis.margin.right])
            .domain([vis.minDate, vis.maxDate]);

        //vis.x.domain(d3.extent(localData, function (d) { return d.Year; }));



        //console.log(vis.phasesByVaccines);
        vis.phases = [];
        vis.phasesByVaccines.forEach(entry=>{
            vis.phases.push(entry[0].Phase);
        })
        console.log("phases are");
        console.log(vis.phases);
        //vis.phases = ["Development","Phase 1","Phase 2", "Phase 3"]

        vis.y = d3.scaleBand()
            .range([0,vis.height-vis.margin.top])
            .domain(vis.phases);

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x)
            .ticks(4)
            .tickFormat(d3.timeFormat("%Y"));

        vis.colorScheme = ["#4de0c4", "#43f5a5", "#08fa81", "#2dff00", "#f80f0f"];

        vis.colorScale = d3.scaleOrdinal()
            .domain(vis.phases)
            .range(vis.colorScheme);

        vis.yAxisGroup = vis.svg.append("g")
            .attr("class", "y-axis axis")
            .style("font-size", "70.em")
            .attr("transform", "translate(" + (vis.margin.left-15) + ","+(-vis.margin.bottom-20)+")")
            //.attr("stroke","white")
            //.attr("fill","white")
            .attr("stroke-opacity","1");
        //.style("font-family","Brush Script MT");

        vis.xAxisGroup = vis.svg.append("g")
            .attr("class", "x-axis axis")
            .style("font-size", "0.8em")
            .attr("transform", "translate(" + (vis.margin.left-15) + ","+(vis.height-vis.margin.bottom - vis.margin.top-20)+")");

        vis.yAxisGroup.call(vis.yAxis);

        vis.xAxisGroup.call(vis.xAxis);



        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'pieTooltip');




        //vaccine bars
        vis.bar =vis.svg.selectAll(".bar")
            .data(vis.vaccineData, d=>d.Phase);



        vis.bar.enter().append("rect")
            .attr("class","bar")
            .attr("x", (d)=>{return vis.margin.left-15+vis.x(d.StartDate);})
            .attr("height", 25)
            .attr("rx", 1)
            .attr("y", (d)=>{
                if(d.Vaccine == "Covid"){
                    return vis.y(d.Phase);
                }
                else{
                    return vis.y(d.Phase)-30;
                }

            })
            .attr("width",(d)=>{return vis.x(d.EndDate)-vis.x(d.StartDate);})
            .attr("fill",(d)=>{
                if(d.Vaccine == "Covid"){
                    return "#075457";
                }
                else{
                    return "rgba(185,180,180,0.85)";
                }x``
            })
            .attr("fill-opacity", "0.75")
            .attr("stroke",(d)=>{
                if(d.Vaccine == "Covid"){
                    return "#075457";
                }
                else{
                    return "rgba(68,67,67,0.85)";
                }
            })
            .attr("stroke-width","1px")
            .on('mouseover', function(event, d){
                d3.select(this)
                    .attr('stroke-width', '1px')
                    .attr("fill-opacity", "1")
            })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .attr('stroke-width', '1px')
                    .attr("fill-opacity", "0.75")
            })



        //color bands for each phase
        vis.colorBars =vis.svg.selectAll(".colorbar")
            .data(vis.phases);
        vis.colorBars.enter().append("rect")
            .attr("class","colorbar")
            .attr("x", vis.margin.left-15)
            .attr("height", (vis.height/vis.phases.length))
            .attr("y", (d)=>{console.log(d); return -20-vis.margin.bottom+vis.y(d);})
            .attr("width",vis.width-vis.margin.left-vis.margin.right)
            //.attr("fill",(d)=>{console.log(vis.colorScale(d)); return vis.colorScale(d)})
            .attr("opacity","0")
            .on('mouseover', function(event, d){
                d3.select(this)
                    .attr("stroke","black")
                    .attr('stroke-width', '3px')
                    .attr("fill-opacity", "0.5")
                vis.tooltip
                    .style("opacity", 0.90)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .style("width","40vh")
                    .html(`<div style="border: thin solid grey; border-radius: 5px; background: whitesmoke; padding: 20px">
                                 <h3>${d}</h3>
                                 <p style="font-size: medium; font-weight: bold; color: black">${vis.tooltipText[d][0]}<p>    
                                 <p style="font-size: medium; font-weight: bold; color: black">${vis.tooltipText[d][1]}<p>    
                                                  
                             </div>`)
            })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .attr('stroke-width', '0px')
                    .attr("fill-opacity", "1")
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(``)
            });




        //line on vaccine releaase
        vis.svg.append("line")
            .attr("x1", vis.margin.left-15+vis.x(vis.covidVaccineRelease))  //<<== change your code here
            .attr("y1", 0)
            .attr("x2", vis.margin.left-15+vis.x(vis.covidVaccineRelease))  //<<== and here
            .attr("y2", vis.height - vis.margin.top - vis.margin.bottom - 20)
            .style("stroke-width", 2)
            .style("stroke", "black")
            .style("fill", "none");

        vis.svg.append("line")
            .attr("x1", vis.margin.left-13)  //<<== change your code here
            .attr("y1", 0.15*vis.height)
            .attr("x2", vis.width-vis.margin.right)  //<<== and here
            .attr("y2", 0.15*vis.height)
            .style("stroke-width", 2)
            .style("stroke", "black")
            .style("fill", "none")
            .style("stroke-dasharray",(3,3));

        vis.svg.append("line")
            .attr("x1", vis.margin.left-13)  //<<== change your code here
            .attr("y1", 0.15*vis.height+(vis.height/vis.phases.length))
            .attr("x2", vis.width-vis.margin.right)  //<<== and here
            .attr("y2", 0.15*vis.height+(vis.height/vis.phases.length))
            .style("stroke-width", 2)
            .style("stroke", "black")
            .style("fill", "none")
            .style("stroke-dasharray",(3,3));

        vis.svg.append("line")
            .attr("x1", vis.margin.left-13)  //<<== change your code here
            .attr("y1", 0.15*vis.height+2*(vis.height/vis.phases.length))
            .attr("x2", vis.width-vis.margin.right)  //<<== and here
            .attr("y2", 0.15*vis.height+2*(vis.height/vis.phases.length))
            .style("stroke-width", 2)
            .style("stroke", "black")
            .style("fill", "none")
            .style("stroke-dasharray",(3,3));

        vis.svg.append("text")
            .attr("x", 3+vis.margin.left-15+vis.x(vis.covidVaccineRelease))
            .attr("y", vis.margin.top)
            .text("Dec 14, 2020");

        vis.svg.append("text")
            .attr("x", 3+vis.margin.left-15+vis.x(vis.covidVaccineRelease))
            .attr("y",  20 + vis.margin.top)
            .text("First Covid Vaccine Released.")

        //legend
        vis.legend = vis.svg.selectAll(".legend")
            .data(vis.appendix, d=>d.key);
        vis.legend.enter().append("rect")
            .attr("x", (d,i)=>{return 500 + (180*i);})
            .attr("y", -100)
            .attr("height", 20)
            .attr("width", 20)
            .attr("fill",(d)=>{return d.value;})
            .attr("stroke","rgba(44,40,40,0.85)");
        vis.legend.enter().append("text")
            .attr("x", (d,i)=>{return 522 + (180*i);})
            .attr("y", -85)
            .text((d)=>{return d.key})


        //domain band for y linear for x
        //plot
    }
}