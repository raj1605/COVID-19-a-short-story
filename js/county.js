/* * * * * * * * * * * * * *
*          MapVis          *
* * * * * * * * * * * * * */


class CountyVis {

    constructor(parentElement, geoStatesData, mandate_data){
        this.parentElement = parentElement;
        this.geoStatesData = geoStatesData;
        this.mandateData = mandate_data;
        this.displayData = [];

        // parse date method
        this.parseDate = d3.timeParse("%m/%d/%Y");

        this.initTable()
    }

    initTable()
    {
        let vis = this;

        vis.margin = {top: 150, right: 60, bottom: 20, left: 20};
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
            .attr('transform', `translate(${vis.width / 2}, 0)`)
            .attr('text-anchor', 'middle');

        // adjust map position

        console.log("paths");

        var projection = d3.geoMercator()
            .center([ -120, 37 ])
            .translate([ vis.width/2.2, vis.height/2.4 ])
            .scale([ vis.width*4 ]);

        //Define path generator
        var path = d3.geoPath()
            .projection(projection);

        vis.color = "white";

        vis.map = vis.svg.selectAll("path")
            .data(vis.geoStatesData.features);

        vis.map.enter()
            .append("path")
            .attr("d", path)
            .attr("fill", vis.color)
            .attr("stroke", "black");
         vis.colors = ["#fcfbf9" ,"#fd3c02"];
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
            .attr("stop-color", "#fcfbf9");


        vis.linearGradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#fd3c02");

        vis.legend = vis.svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${vis.width * 0.6}, ${vis.height*0.01 })`);

        vis.legend.append("rect")
            .attr("width", 20)
            .attr("height",20)
            .attr("x", 0)
            .attr("y", 0)
            .attr("fill", "green")
            .attr("stroke", "black");

        vis.legend.append("text")
            .attr("x", 25)
            .attr("y", 15)
            .text("Mandatory - all people");


        vis.legend.append("rect")
            .attr("width", 20)
            .attr("height",20)
            .attr("x", 0)
            .attr("y", 30)
            .attr("fill", "yellow")
            .attr("stroke", "black");

        vis.legend.append("text")
            .attr("x", 25)
            .attr("y", 45)
            .text("Advisory/Recommendation");



        vis.legend.append("rect")
            .attr("width", 20)
            .attr("height",20)
            .attr("x", 0)
            .attr("y", 60)
            .attr("fill", "red")
            .attr("stroke", "black");

        vis.legend.append("text")
            .attr("x", 25)
            .attr("y", 75)
            .text("No order found");

        vis.newUpdateVis();

    }

    newUpdateVis()
    {
        let vis = this;

        if (selectedDate == "")
        {
            selectedDate = vis.mandateData[0].Date;
        }

        vis.mandateData.forEach(entry=>

            {
                if(entry.Date == selectedDate)
                {
                    if(entry["Stay at Home Orders"] == "No order found") {
                        vis.color = "red";
                    }

                    else if (entry["Stay at Home Orders"] == "Mandatory - all people")
                    {
                        vis.color = "green";
                    }

                    else
                    {
                        vis.color = "yellow";
                    }

                    console.log("Inside new update vis");
                    console.log(vis.color);

                    vis.svg.selectAll("path")
                        .data(vis.geoStatesData.features)
                        .attr("fill", vis.color);

                    return;

                }
            }
        )
    }
}