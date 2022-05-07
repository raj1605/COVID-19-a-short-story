/* * * * * * * * * * * * * *
*      class BarVis        *
* * * * * * * * * * * * * */


class CombineTimelines {

    constructor(parentElement){

        this.parentElement = parentElement;

        this.initVis()
    }

    initVis(){
        let vis = this;

        vis.margin = {top: 20, right: 0, bottom: 20, left: 0};


        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);


        vis.svg.append("text")
            .attr("x",10)
            .attr("y",100)
            .text("100 years of Coronavirus research before the first COVID case in 2020");

        vis.svg.append("text")
            .attr("x",10)
            .attr("y",vis.height-20)
            .text("100 years of Coronavirus research before the first COVID case in 2020");



        milestones('#' + vis.parentElement)
            .mapping({
                'category':"category",
                'entries': "entries",
                'timestamp': 'year',
                'text': 'title'
            })
            .parseTime('%Y')
            .aggregateBy('year')
            .orientation("horizontal")
            .optimize(false)
            .render([
                {"category" : "CORONA Virus",
                 "entries" : [
                     {
                         "year": 1920,
                         "title" : "First report of respiratory infection"
                     },
                     {
                         "year": 1931,
                         "title" : "Detailed reports obtained"
                     },
                     {
                         "year": 1933,
                         "title" : "Virus Isolated"
                     },
                     {
                         "year": 1937,
                         "title" : "Virus Cultivated"
                     },
                     {
                         "year": 1960,
                         "title" : "Human coronaviruses discovered"
                     },
                     {
                         "year": 1965,
                         "title" : "Novel coronaviruses cultivated"
                     },

                     {
                         "year": 2003,
                         "title" : "SARS outbreak"
                     },
                     {
                         "year": 2012,
                         "title" : "MERS outbreak"
                     },
                     {
                         "year": 2020,
                         "title" : "SARS COV-2 outbreak"
                     },

                 ]
                },

                {"category" : "mRNA Technology",
                    "entries" : [
                        {
                            "year": 1961,
                            "title" : "mRNA Technology discovered"
                        },
                        {
                            "year": 1984,
                            "title" : "mRNA synthesized in lab"
                        },
                        {
                            "year": 1992,
                            "title" : "mRNA tested as a treatment (in rats)"
                        },

                        {
                            "year": 2013,
                            "title" : "Clinical trial of mRNA vaccine for rabies"
                        },
                        {
                            "year": 2020,
                            "title" : "mRNA based COVID-19 vaccines win emergency authorization"
                        },

                    ]
                }
            ]);
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

                    return;
                }
            }
        )


        vis.rect1.attr("width", vis.x(vis.vaccine_number));
        vis.rect2.attr("x", vis.x(vis.vaccine_number))
        vis.rect2.attr("width", vis.width - vis.x(vis.vaccine_number));


    }
}