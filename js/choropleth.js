// --> CREATE SVG DRAWING AREA

var margin_map = {top: 40, right: 100, bottom: 90, left: 100};

var width_map = 1000 + margin_map.right + margin_map.left,
    height_map = 700 + margin_map.top + margin_map.bottom;


var choropleth = d3.select("#choropleth").append("svg")
    .attr("width", width_map)
    .attr("height", height_map);

var projection = d3.geoIdentity();

var path = d3.geoPath()
    .projection(projection);

var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
    // .style("fill", "rgb(255,102,102)");


var data1, data2;
// Use the Queue.js library to read two files
queue()
    .defer(d3.json, "data/usa.topo.json")
    .defer(d3.csv, "data/enrollmentbystate.csv")
    .await(function(error, mapTopJson, enrollmentCsv) {

        enrollmentCsv.forEach(function(d) {
            d.yr1970 = +d.yr1970;
            d.yr1980 = +d.yr1980;
            d.yr1990 = +d.yr1990;
            d.yr2000 = +d.yr2000;
            d.yr2010 = +d.yr2010;
            d.yr2012 = +d.yr2012;
            d.yr2014 = +d.yr2014;
            d.yr2015 = +d.yr2015;
            d.yr2016 = +d.yr2016;
            d.yr2017 = +d.yr2017;
        });

        data1 = mapTopJson;
        data2 = enrollmentCsv;
        // console.log(data1);
        // console.log(data2);

        // Convert the TopoJson to GeoJSON (target object = 'states')
        var usamap = topojson.feature(data1, data1.objects.states).features;
        // console.log(data1);
        // console.log(usamap);


        for (var i = 0; i < data2.length; i++) {
            //Grab state name
            var dataState = data2[i].State;
            //Grab data value, and convert from string to float
            var dataValue = parseFloat(data2[i].yr1970);
            var dataValue2 = parseFloat(data2[i].yr1980);
            var dataValue3 = parseFloat(data2[i].yr1990);
            var dataValue4 = parseFloat(data2[i].yr2000);
            var dataValue5 = parseFloat(data2[i].yr2010);
            var dataValue6 = parseFloat(data2[i].yr2012);
            var dataValue7 = parseFloat(data2[i].yr2014);
            var dataValue8 = parseFloat(data2[i].yr2015);
            var dataValue9 = parseFloat(data2[i].yr2016);
            var dataValue10 = parseFloat(data2[i].yr2017);
            for (var j = 0; j < usamap.length; j++) {
                var jsonState = usamap[j].properties.name;
                if (dataState === jsonState) {
                    usamap[j].properties.yr1970 = dataValue;
                    usamap[j].properties.yr1980 = dataValue2;
                    usamap[j].properties.yr1990 = dataValue3;
                    usamap[j].properties.yr2000 = dataValue4;
                    usamap[j].properties.yr2010 = dataValue5;
                    usamap[j].properties.yr2012 = dataValue6;
                    usamap[j].properties.yr2014 = dataValue7;
                    usamap[j].properties.yr2015 = dataValue8;
                    usamap[j].properties.yr2016 = dataValue9;
                    usamap[j].properties.yr2017 = dataValue10;
                    break;
                }
            }
        }
        // console.log(usamap);

        // Event Listener (select-box)
        var selectMapType = d3.select("#selected-map").on("change", updateChoropleth);

        updateChoropleth();
    // });
//
//
function updateChoropleth() { //this serves as the "enter" part; update to follow
//

    var selectedMap = selectMapType.property("value");
    // console.log(selectedMap);

    var color = d3.scaleQuantize()
        .range(["rgb(255,247,236)", "rgb(254,232,200)",
            "rgb(253,212,158)", "rgb(253,187,132)", "rgb(252,141,89)",
            "rgb(239,101,72)", "rgb(215,48,31)","rgb(179,0,0)", "rgb(127,0,0)"]);

    color.domain([
        0,
        d3.max(usamap, function(d) {
            return d.properties[selectedMap];
        })
    ]);
    // console.log(usamap[3].properties[selectedMap]);



    choropleth.selectAll("path")
        .remove();

    choropleth.selectAll("path")
        .data(usamap)
        .enter()
        .append("path")
        // .attr("class", "maps")
        .attr("d", path)
        .attr("stroke", "#4d0000")
        .attr("stroke-width", .25)
        .style("fill", function (d) {
            var value = d.properties[selectedMap];
            // console.log(d.properties);
            // console.log(selectedMap);
            if(value) {
                return color(value);
            } else {
                return "#ccc";
            }
    })
        .on("mouseover", function(d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
                // .style("fill", "#fd4567");
            tooltip.html(d.properties.name + "<br>" + "Students: " + d.properties[selectedMap])
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY) + "px");
        })
        .on("mouseout", function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });


    choropleth.append("g")
        .attr("class", "legendQuant")
        .attr("transform", "translate(1000,200)");

    var legend = d3.legendColor()
        .labelFormat(d3.format(",.0f"))
        .scale(color)
        .title("Number of Students");

    choropleth.select(".legendQuant")
        .call(legend);
    }
});