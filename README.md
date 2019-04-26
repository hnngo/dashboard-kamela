## Description
Kamela is a stock website presented in dashboard view. Kamela allows user to get the Stock Market Overview, look up for real-life Stock Symbol, access to some Technical Indicators such as CCI, CMO, APO, etc... Besides, Kamela also let user have the latest information about Forex Exchange and Crypto Currencies Exchange also.

All of the latest information are retrieved from [Alpha Vantage](https://www.alphavantage.co) and are used non-commercialized. Due to using free API of [Alpha Vantage](https://www.alphavantage.co), website may or may not have a small latency in loading the latest data. Thanks for your patience!

The website URL: `https://dbkamela.firebaseapp.com/`

## Technology
The project is initiated by [create-react-app](https://github.com/facebook/create-react-app).

[Firebase Hosting](https://firebase.google.com/) is used as a hosting service for this project.

The responsive, mobile-first feature and other css prototype I used for this project is [Bootstrap](https://getbootstrap.com/).

I used [d3.js](https://d3js.org) as a tool for visualizing almost stock data. The types of chart  are varied such as as line graph, circle point, bar chart, area and pie chart.

For the limitation of information about real company, I generated fake company data by using [Mockaroo](https://www.mockaroo.com/).

The side bar is created for only making the dashboard be like the real stock website dashbord. Therefore it has no functionality.

## Dependencies
```
  "axios": "^0.18.0",
  "d3": "^5.9.2",
  "lodash": "^4.17.11",
  "prop-types": "^15.7.2",
  "react": "^16.8.6",
  "react-dom": "^16.8.6",
  "react-scripts": "2.1.8"
```

## How to use
Clone the project to your local storage and run script 
```
  npm install
  npm start
```

If the ```npm install``` get error, please delete all the files in ```node_modules``` and re-install by running ```npm install``` again.
