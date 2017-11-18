const axios = require('axios');
const moment = require('moment');
const apikey = 'KI78KUFM7Q20XVC9';
// const apikey = 'C49QRYKSIS57EN7V';

function getSymbol(request, reply) {
  const { symbol } = request.query;
  axios.get(`http://dev.markitondemand.com/MODApis/Api/v2/Lookup/json?input=${symbol}`)
  .then(res => reply.json({success: true, data: res.data}))
  .catch(err => reply.json({success: false, error: err}));
}

function getStockTable(request, reply) {
  const { symbol } = request.query;
  // console.log('symbol:', symbol);
  axios.get(`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&interval=1min&apikey=${apikey}&symbol=${symbol}`)
  .then(res => {
    if (res.data["Information"]) {
      reply.json({success: false, data: res.data});  
    }
    reply.json({ success: true, data: processTable(symbol, res.data) })
  })
  .catch(err => {
    console.log(err);
    reply.json({ success: false, error: err });
  });
}

function getStockChart(request, reply) {
  const { symbol, type } = request.query;
  // console.log(symbol, type);
  const url = processURL(symbol, type);
  axios.get(url)
  .then(res => {
    if (res.data["Information"]) {
      reply.json({success: false, data: res.data});  
    }
    reply.json({ success: true, data: res.data });
  })
  .catch(err => {
    console.log(err);
    reply.json({ success: false, error: err });
  });
}

function getHistoricalChart(request, reply) {
  const { symbol } = request.query;
  // console.log('chart, symbol');
  axios.get(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&outputsize=full&apikey=${apikey}&symbol=${symbol}`)
  .then(res => {
    if (res.data["Information"]) {
      reply.json({success: false, data: res.data});  
    }
    reply.json({ success: true, data: res.data })
  })
  .catch(err => {
    console.log(err);
    reply.json({ success: false, error: err });
  });
}

function getNewsFeed(request, reply) {
  const { symbol } = request.query;
  axios.get(`https://seekingalpha.com/api/sa/combined/${symbol}.xml`)
  .then(res => reply.send(res.data))
  .catch(err => {
    console.log(err);
    reply.json({ success: false, error: err });
  });
}

function getChartshot(request, reply) {
  const { chartOption } = request.body;
  axios.post(`http://export.highcharts.com/`, {
    options: JSON.stringify(chartOption),
    type: 'image/png',
    async: true
  })
  .then(res => reply.json({ success: true, data: `http://export.highcharts.com/${res.data}` }))
  .catch(err => {
    console.log(err);
    reply.json({ success: false, error: err });
  });
}

function processTable(symbol, data) {
  const timeSeries = data["Time Series (1min)"];
  if (!timeSeries || Object.keys(timeSeries).length === 0) {
    return {};
  }
  const ts = Object.keys(timeSeries);

  const lastPrice = timeSeries[ts[0]]["4. close"];
  const open = timeSeries[ts[0]]["1. open"];
  const close = timeSeries[ts[0]]["4. close"];
  const change = (Number(close) - Number(open)).toFixed(2);
  const changePercent = `${(100 * change / Number(open)).toFixed(2)}`;
  const volumn = timeSeries[ts[0]]["5. volume"];
  const timestamp = data["Meta Data"]["3. Last Refreshed"];
  const daysRange = `${timeSeries[ts[0]]["3. low"]} - ${timeSeries[ts[0]]["2. high"]}`;
  const increased = (change >= 0);

  // console.log({ symbol, open, close, change, changePercent, volumn, daysRange, timestamp });
  return { symbol, open, close, change, changePercent, volumn, daysRange, timestamp, increased };
}

function processURL(symbol, type) {
  switch (type) {
    case "SMA":
      return `https://www.alphavantage.co/query?function=SMA&interval=daily&time_period=10&series_type=close&apikey=${apikey}&symbol=${symbol}`;
    case "EMA":
      return `https://www.alphavantage.co/query?function=EMA&interval=daily&time_period=10&series_type=close&apikey=${apikey}&symbol=${symbol}`;
    case "STOCH":
      return `https://www.alphavantage.co/query?function=STOCH&interval=daily&series_type=close&apikey=${apikey}&symbol=${symbol}`;
    case "RSI":
      return `https://www.alphavantage.co/query?function=RSI&interval=daily&time_period=10&series_type=close&apikey=${apikey}&symbol=${symbol}`;
    case "ADX":
      return `https://www.alphavantage.co/query?function=ADX&interval=daily&time_period=10&series_type=close&apikey=${apikey}&symbol=${symbol}`;
    case "CCI":
      return `https://www.alphavantage.co/query?function=CCI&interval=daily&time_period=10&series_type=close&apikey=${apikey}&symbol=${symbol}`;
    case "BBANDS":
      return `https://www.alphavantage.co/query?function=BBANDS&interval=daily&time_period=10&series_type=close&apikey=${apikey}&symbol=${symbol}`;
    case "MACD":
      return `https://www.alphavantage.co/query?function=MACD&interval=daily&time_period=10&series_type=close&apikey=${apikey}&symbol=${symbol}`;
    default:
      return `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&apikey=${apikey}&symbol=${symbol}`;
  }
}


const routes = function(app) {
  app.get('/api/autocomplete', getSymbol);
  app.get('/api/stocktable', getStockTable);
  app.get('/api/stockchart', getStockChart);
  app.get('/api/historicalchart', getHistoricalChart);
  app.get('/api/newsfeed', getNewsFeed);
  app.post('/api/chartshot', getChartshot);
}

module.exports = routes;