const margin = { top: 50, right: 30, bottom: 60, left: 70},
    width = 800 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

const svgBar = d3.select("#barChart")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

d3.csv("greenhouse-emissions.csv").then(function(data) {
    const filteredData = data.filter(d => d.Unit === "Tonnes of CO2 equivalent");
    filteredData.forEach(d => {
        d.country = shortenCountryName(d.Country);
        d.emissions = +d.Value;  
    });
    const cleanData = filteredData.filter(d => d.country != null && d.emissions != null);

    const validCountries = cleanData.filter(d => {
        return !d.country.includes("OECD") && !d.country.includes("European Union")
    });

    const barMapData = d3.rollup(validCountries, 
        v => d3.sum(v, d => d.emissions),
        d => d.country
    );

    const barData = Array.from(barMapData, 
        ([country, emissions]) => ([country, emissions])
    )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

    const xCountry = d3.scaleBand()
        .domain(barData.map(d => d[0]))
        .range([0, width])
        .padding(0.1);

    const yEmissions = d3.scaleLinear()
        .domain([0, d3.max(barData, d => d[1])])
        .range([height, 0]);

    svgBar.selectAll("rect")
        .data(barData)
        .enter()
        .append("rect")
        .attr("x", d => xCountry(d[0]))
        .attr("y", d => yEmissions(d[1]))
        .attr("width", xCountry.bandwidth())
        .attr("height", d => height - yEmissions(d[1]))
        .attr("fill", "steelblue");

    svgBar.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xCountry));

    svgBar.append("g")
        .call(d3.axisLeft(yEmissions)
            .tickFormat (d => d/1000000 + "M")
        );

    svgBar.append("text")
        .attr("class", "title")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .text("Top 5 Countries by CO2 Emissions (1990-2018)")

    svgBar.append("text")
        .attr("class", "axis-label")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + (margin.bottom / 1.5))
        .text("Country")

    svgBar.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left / 1.5)
        .attr("x", -height / 2)
        .text("CO2 Emissions (Tonnes)")

    function shortenCountryName(name) {
        if (name === "China (People's Republic of)") {
            return "China";
        }
        return name;
    }
})



