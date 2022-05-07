console.log("Manoj eeee")
let promisesForVaccine = [

    // d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json"),  // not projected -> you need to do it
    //d3.json("https://cdn.jsdelivr.net/npm/us-atlas@3/states-albers-10m.json"), // already projected -> you can just scale it to ft your browser window
    d3.csv("data/Book1.csv"),
    //d3.csv("data/census_usa.csv"),
    //d3.csv("data/dailyCases2edited.csv"),
    //d3.csv("data/sewage_concentration.csv"),
    //d3.csv("data/vaccine_mandate_dailycases.csv")
];

parseDate = d3.timeParse("%m/%d/%Y");
let graphvis;

Promise.all(promisesForVaccine)
    .then(function (data) {
        console.log("Manoj")
        console.log(data)
        vacinitMainPage(data)
    })
    .catch(function (err) {
        console.log(err)
    });

function vacinitMainPage(dataArray) {
    console.log(dataArray);
    dataArray[0].forEach(entry=>{
        entry.StartDate = parseDate(entry.StartDate);
        entry.EndDate = parseDate(entry.EndDate);
    });
    graphvis = new GraphVis("vaccineTimeline", dataArray[0]);

}