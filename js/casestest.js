// implement sewage time line here
CasesTest = function (_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = [];
    this.parseDate = d3.timeParse("%m/%d/%Y");

    console.log("CasesTest")
    //console.log(this.data);
    // call method initVis
    this.initVis();
};

// init CasesTest
CasesTest.prototype.initVis = function () {
    let vis = this;


    console.log(vis.data);

    vis.margin = {top: 20, right: 80, bottom: 20, left: 50};
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
    /*
    vis.svg.append('g')
        .attr('class', 'title')
        .append('text')
        .text('California State - Daily Positive Cases ')
        .attr('transform', `translate(${vis.width / 2}, -5)`)
        .attr('text-anchor', 'middle');
*/


    vis.bisectDate = d3.bisector(d=>d.Date).left;

    // init scales
    vis.x = d3.scaleTime()
        .domain([
            d3.min(vis.data, function(d) { return d.Date; }),
            d3.max(vis.data, function(d) { return d.Date; })
        ])
        .range([0, vis.width]);


    vis.y = d3.scaleLinear().range([vis.height, 0]);

    // init x & y axis
    vis.xAxis = vis.svg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + vis.height + ")");
    vis.yAxis = vis.svg.append("g")
        .attr("class", "axis axis--y");




    vis.area1 = d3.area()
        // .curve(d3.curveMonotoneX)
        .x(function (d) {
            return vis.x(d["Date"]);
        })
        .y0(vis.y(0))
        .y1(function (d) {
            return vis.y(d["New Cases"]);
        });


    vis.area2 = d3.area()
        // .curve(d3.curveMonotoneX)
        .x(function (d) {
            return vis.x(d["Date"]);
        })
       .y0(vis.y(0))
        .y1(function (d) {
            return vis.y(d["Daily Test"]);
        });

    vis.y.domain([0, d3.max(vis.data, function (d) {
        return d["Daily Test"];
    })]);



    vis.svg.append("path")
        .datum(vis.data)
        .attr("fill","rgba(220,216,216,0.85)")
        .attr("d",vis.area2)
        .style("opacity",1)
        .attr("stroke", "rgba(129,128,128,0.85)");

    vis.svg.append("path")
        .datum(vis.data)
        .attr("fill","#075457")
        .attr("d",vis.area1)
        .style("opacity", 1)
        .attr("stroke", "black");


    vis.svg.append("rect")
        .attr("width", 20)
        .attr("height",20)
        .attr("x", 10)
        .attr("y", 40)
        .attr("fill", "rgba(220,216,216,0.85)")
        .attr("stroke", "black")
        .style("opacity",1);

    vis.svg.append("text")
        .attr("x", 35)
        .attr("y", 55)
        .text("Daily Tests");


    vis.svg.append("rect")
        .attr("width", 20)
        .attr("height",20)
        .attr("x", 10)
        .attr("y", 70)
        .attr("fill", "#075457")
        .attr("stroke", "black")
        .style("opacity",1);

    vis.svg.append("text")
        .attr("x", 35)
        .attr("y", 85)
        .text("Daily Positive Cases");






    function mousemove(event){
        //console.log("inside mouse moved")
        let x_inverted = d3.pointer(event)[0];

        //console.log("x_inverted"+x_inverted);
        let date_x = vis.x.invert(x_inverted);

        //console.log("date x"+date_x);
        let closest_index = vis.bisectDate(vis.data,date_x);

        //console.log("closest index"+closest_index);
        let actual_data = vis.data[closest_index]






        //console.log("actual_data", actual_data);
        let x_value = vis.x(actual_data.Date);
        //console.log("x_value",x_value);

        var formatTimeToolTip = d3.timeFormat("%m/%d/%Y");


        d3.select(".tooltipPopulation")
            .text(formatTimeToolTip(actual_data.Date))
            .attr("font-weight","bold")
            .style("opacity",0.5);

        vis.g_tooltip
            .attr("transform", "translate("+x_value+",0)");

        selectedDate = actual_data.Date;
        vaccine.newUpdateVis();
        county.newUpdateVis();
    }




    vis.g_tooltip = vis.svg.append("g")
        .attr("class", "tooltip1")
        .attr("display","none");

    vis.g_tooltip.append("line")
        .attr("x1",0)
        .attr("y1",vis.height)
        .attr("x2",0)
        .attr("y2",0)
        .attr("stroke", "#075457")
        .attr("stroke-width", "2px")
        .style("opacity",0.5);

    vis.g_tooltip.append("text")
        .attr("x", 10)
        .attr("y",vis.height*0.5)
        .attr("class","tooltipPopulation");


    vis.tooltipRect = vis.svg.append("rect")
        .attr("x","0")
        .attr("y","0")
        .attr("height",vis.height)
        .attr("width",vis.width)
        .attr("opacity","0");

    console.log("above all");

    vis.tooltipRect.on("mouseover", function(event, d){
        console.log("mouseover");
        d3.select(".tooltip1")
            .attr("display","null");
    });

    vis.tooltipRect.on("mouseout", function(event, d){
        console.log("mouseout");
        d3.select(".tooltip1")
            .attr("display","none");
    });

    vis.tooltipRect.on("mousemove", function(event, d){
        console.log("mousemoved");
        mousemove(event);
    });

    vis.all_tooltips = vis.svg.append("g")
        .attr("class","mandates_testing_tooltips");
    vis.newUpdateVis();

};

CasesTest.prototype.newUpdateVis = function () {
    let vis = this;



    vis.y.domain([0, d3.max(vis.data, function (d) {
        return d["Daily Test"];
    })]);

    console.log(d3.max(vis.data, function (d) {
        return d["Daily Test"];
    }));

    console.log("prabhas");
    console.log(vis.data[150]);
    console.log(vis.data[287]);
    console.log(vis.data[439]);

    vis.all_tooltips.append("line")
        .attr("x1" , vis.x(vis.data[150].Date))
        .attr("x2", vis.x(vis.data[150].Date))
        .attr("y1", vis.height)
        .attr("y2",0)
        .attr("stroke","#075457")
        .attr("stroke-width","3px")
        .style("stroke-dasharray", ("4,2"));

    vis.all_tooltips.append("text")
        .attr("x" , vis.x(vis.data[150].Date)+10)
        .attr("y", 30)
        .text("Reduced cases due")
        .style("font-size","small")
        .attr("font-weight","bold");

    vis.all_tooltips.append("text")
        .attr("x" , vis.x(vis.data[150].Date)+10)
        .attr("y", 45)
        .text("strict mandates")
        .style("font-size","small")
        .attr("font-weight","bold");


    vis.all_tooltips.append("line")
        .attr("x1" , vis.x(vis.data[287].Date))
        .attr("x2", vis.x(vis.data[287].Date))
        .attr("y1", vis.height)
        .attr("y2",0)
        .attr("stroke","#075457")
        .attr("stroke-width","3px")
        .style("stroke-dasharray", ("3, 3"));

    vis.all_tooltips.append("text")
        .attr("x" , vis.x(vis.data[287].Date)+10)
        .attr("y", 30)
        .text("Increased cases due to")
        .style("font-size","small")
        .attr("font-weight","bold");

    vis.all_tooltips.append("text")
        .attr("x" , vis.x(vis.data[287].Date)+10)
        .attr("y", 45)
        .text("reduced mandates &")
        .style("font-size","small")
        .attr("font-weight","bold");

    vis.all_tooltips.append("text")
        .attr("x" , vis.x(vis.data[287].Date)+10)
        .attr("y", 60)
        .text("increased testing")
        .style("font-size","small")
        .attr("font-weight","bold");



    vis.all_tooltips.append("line")
        .attr("x1" , vis.x(vis.data[439].Date))
        .attr("x2", vis.x(vis.data[439].Date))
        .attr("y1", vis.height)
        .attr("y2",0)
        .attr("stroke","#075457")
        .attr("stroke-width","3px")
        .style("stroke-dasharray", ("3, 3"));

    vis.all_tooltips.append("text")
        .attr("x" , vis.x(vis.data[439].Date)+10)
        .attr("y", 30)
        .text("Reduced cases due to vaccine" )
        .style("font-size","small")
        .attr("font-weight","bold");

    vis.all_tooltips.append("text")
        .attr("x" , vis.x(vis.data[439].Date)+10)
        .attr("y", 45)
        .text("administration, high testing &" )
        .style("font-size","small")
        .attr("font-weight","bold");

    vis.all_tooltips.append("text")
        .attr("x" , vis.x(vis.data[439].Date)+10)
        .attr("y", 60)
        .text(" relaxed mandates")
        .style("font-size","small")
        .attr("font-weight","bold");








    // draw x & y axis
    vis.xAxis.call(d3.axisBottom(vis.x));
    vis.yAxis.call(d3.axisLeft(vis.y).ticks(5));

}
