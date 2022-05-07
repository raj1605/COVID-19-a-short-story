/* * * * * * * * * * * * * *
*      class BarVis        *
* * * * * * * * * * * * * */


class Vaccine {

    constructor(parentElement, data){

        this.parentElement = parentElement;
        this.data = data;
        this.parseDate = d3.timeParse("%m/%d/%Y");
        console.log("inside");
        console.log(this.data);
        this.initVis()
    }

    initVis(){
        let vis = this;

        vis.margin = {top: 20, right: 60, bottom: 20, left: 40};


        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // add title
        vis.svg.append('g')
            .attr('class', 'title bar-title')
            .append('text')
            .text('Vaccinated Population')
            .attr('transform', `translate(${vis.width / 2}, 10)`)
            .attr('text-anchor', 'middle');


        // Scales
        vis.total_population = 39368078;
        vis.x = d3.scaleLinear()
            .domain([0, vis.total_population])
            .range([0, vis.width]);

        //    .paddingInner(0.3);


        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x)
            .ticks(4);

        vis.legend = vis.svg.append("g")
            .attr("class","legend")
            .attr("transform", "translate("+ vis.width*0.2 +","+ vis.height*0.1+ ")");

        vis.legend.append("rect")
            .attr("width", 20)
            .attr("height",20)
            .attr("x", 0)
            .attr("y", 0)
            .attr("fill", "#075457")
            .attr("stroke", "black");

        vis.legend.append("text")
            .attr("x", 25)
            .attr("y", 15)
            .text("Vaccinated Population");

        vis.legend.append("rect")
            .attr("width", 20)
            .attr("height",20)
            .attr("x", 250)
            .attr("y", 0)
            .attr("fill", "rgba(220,216,216,0.85)")
            .attr("stroke", "black");

        vis.legend.append("text")
            .attr("x", 275)
            .attr("y", 15)
            .text("Non-Vaccinated Population");






        vis.yAxisGroup = vis.svg.append("g")
            .attr("class", "y-axis axis");

        vis.xAxisGroup = vis.svg.append("g")
            .attr("class", "x-axis axis")
            .style("font-size", "0.6em")
            .attr("transform", "translate(0,"+vis.height/2+")")
            .attr("font-weight", "bold");

        vis.barchart = vis.svg.append("g")
            .attr("class","bar-chart");

        vis.line = vis.svg.append("line")

            .style("stroke", "green");

        //vis.x.domain([0, vis.total_population]);
        vis.rect1 = vis.barchart.append("rect")
            .attr("x",vis.x(0))
            .attr("y",vis.height/2-20)
            .attr("width",20)
            .attr("height",20)
            .attr("fill","#075457");

        vis.rect2 = vis.barchart.append("rect")
            .attr("x",vis.x(0))
            .attr("y",vis.height/2-20)
            .attr("width",20)
            .attr("height",20)
            .attr("fill","rgba(220,216,216,0.85)");



        vis.xAxisGroup.call(vis.xAxis);

        vis.colors = ["#cdf4f6" ,"#136D70"];
        vis.scale = d3.scaleLinear()
            .range(vis.colors);

        console.log(vis.data);

        console.log(vis.x(0));



        vis.newUpdateVis()

    }

    newUpdateVis()
    {
        let vis = this;


        if (selectedDate == "")
        {
          selectedDate = vis.data[0].Date;
        }

        vis.data.forEach(entry=>

            {
                if(entry.Date == selectedDate)
                {
                    vis.vaccine_number = entry["cummulativeVaccine"];
                    //console.log(vis.vaccine_number);

                    return;
                    //console.log("inside 2");
                    //console.log(vis.vaccine_number);
                    //break;
                }
            }
        )

        //console.log(vis.x(vis.vaccine_number));

        vis.rect1.attr("width", vis.x(vis.vaccine_number));
        vis.rect2.attr("x", vis.x(vis.vaccine_number))
        vis.rect2.attr("width", vis.width - vis.x(vis.vaccine_number));
        //console.log(vis.x(0));

    }

}