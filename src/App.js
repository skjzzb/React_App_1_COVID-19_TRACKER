import React, { useState, useEffect } from "react";
import {
  MenuItem,
  FormControl,
  Select,
  Card,
  CardContent,
} from "@material-ui/core";
import InfoBox from "./InfoBox";
import Map from "./Map";
import Table from "./Table";
import LineGraph from "./LineGraph"

import "./App.css";
import { prettyPrintStat, sortData } from "./util";
import "leaflet/dist/leaflet.css"

function App() {
  const [countries, setCountries] = useState([]);
  const [country, setCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [tableData,setTableData]= useState([]);
  const [mapCenter, setMapCenter] = useState({lat:34.80746,lng:-40.4796})
  const [mapZoom,setMapZoom]=useState(3);
  const [mapCountries,setMapCountries]=useState([]);
  const [casesType,setCasesType]=useState("cases");

  useEffect(() => {
    document.title="COVID-19 Tracker";
    fetch("https://disease.sh/v3/covid-19/all")
      .then((response) => response.json())
      .then((data) => {
        setCountryInfo(data);
      });
  }, []);
  //STATE = How to write a variable in REACT <<<<

  //https://disease.sh/v3/covid-19/countries

  //USE Effect = Run poce of code based on given conditaion
  useEffect(() => {
    //The code inside will run once
    //When the component loads and not again loadds

    //async --> seand request wait for it do somthing with IP

    const getCountriesData = async () => {
      await fetch("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => ({
            name: country.country,
            value: country.countryInfo.iso2,
            //IND UK USA
          }));

          const sortedData=sortData(data);
          setTableData(sortedData);
          setCountries(countries);
          setMapCountries(data);
        });
    };
    getCountriesData();
  }, []);
  //when ever the countries changes it will re fire the getCountries fubnction
  const onCountryChange = async (event) => {
    const countryCode = event.target.value;
    // console.log(countryCode);
    setCountry(countryCode);

    const url =
      countryCode === "worldwide"
        ? "https://disease.sh/v3/covid-19/all"
        : `https://disease.sh/v3/covid-19/countries/${countryCode}`;

    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setCountry(countryCode);
        setCountryInfo(data);

        setMapCenter([data.countryInfo.lat,data.countryInfo.long]);
          setMapZoom(4);
      });
  };
  console.log(countryInfo);
  return (
    //BEM naming conventions
    <div className="app">
      <div className="app__left">
        <div className="app__header">
          <h1>COVID-19 TRACKER</h1>
          <FormControl className="app__dropdown">
            <Select
              variant="outlined"
              onChange={onCountryChange}
              value={country}
            >
              {/* Loop through country */}
              <MenuItem value="worldwide">WorldWide</MenuItem>
              {countries.map((country) => (
                <MenuItem value={country.value}>{country.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        {/* {Header} */}
        {/* {Titel + Select input dropdown fileld} */}

        <div className="app__stats">
          <InfoBox
            isRed
            active={casesType==="cases"}
            onClick={e=>setCasesType('cases')}
            title="Caronavirus Cases"
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={prettyPrintStat(countryInfo.cases)}
          />
          <InfoBox
            active={casesType==="recovered"}
            onClick={e=>setCasesType('recovered')}
            title="Recovered"
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={prettyPrintStat(countryInfo.recovered)}
          />
          <InfoBox
            isRed
            active={casesType==="deaths"}
            onClick={e=>setCasesType('deaths')}
            title="Deths"
            cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={prettyPrintStat(countryInfo.deaths)}
          />
        </div>
        {/* Map */}
        <Map caseType={casesType} countries={mapCountries} center={mapCenter} zoom={mapZoom}/>
      </div>
      <Card className="app__right">
        <CardContent>
          
          <h3>Live Cases by Country</h3>
          <Table countries={tableData}/>
          {/* Table */}
          <h3>Worldwide new {casesType}</h3>
          <LineGraph className="app__graph" caseType={casesType} />

          {/* Graph */}
       
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
