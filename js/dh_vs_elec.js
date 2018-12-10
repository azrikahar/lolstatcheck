var bonus_ad = 0;
var ap = 0;
var souls = 0;

var runes = {
  DarkHarvest:{
    name:'Dark Harvest',
    base:17.646,
    gain:2.353,
    adratio:0.25,
    apratio:0.15
  },
  Electrocute:{
    name:'Electrocute',
    base:21.176,
    gain:8.824,
    adratio:0.4,
    apratio:0.25
  }
};

window.chartColors = [
	{value: 'rgb(252, 92, 101)'},
	{value: 'rgb(253, 150, 68)'}
];


function updateGraph(){
  window.myLine.data.datasets.splice(0, window.myLine.data.datasets.length);
  generateChart(runes.DarkHarvest);
  generateChart(runes.Electrocute);
  window.myLine.update();
}

function getRuneStats(){
  var static_data_url = 'http://ddragon.leagueoflegends.com/cdn/8.24.1/data/en_US/runesReforged.json';
  $.ajax({
      url: static_data_url,
      type: "GET",
      dataType: "json",
      error: function(jqXHR, textStatus, errorThrown) {
          alert('Unable to get latest rune details.');
          console.log('jqXHR:');
          console.log(jqXHR);
          console.log('textStatus:');
          console.log(textStatus);
          console.log('errorThrown:');
          console.log(errorThrown);
      },
      success: function(data, textStatus, jqXHR) {
          rune_trees = data;
          // for(var tree in rune_trees){
          //   opt.innerHTML = champions[key].name;
          //   opt.value = key;
          //   generateChart(key);
          // }
          console.log(rune_trees);
          console.log(runes);
      },
      complete: function(data){

      }
  });
}

function updateAD(sender){
  bonus_ad = sender;
  updateGraph();
}

function updateAP(sender){
  ap = sender;
  updateGraph();
}

function updateSouls(sender){
  souls = sender;
  updateGraph();
}

function generateChart(rune){
  var available_color_index = (rune.name == 'Dark Harvest') ? 0 : 1;
  var newColor = window.chartColors[available_color_index].value;
  var newDataset = {
    label: rune.name,
    backgroundColor: newColor,
    borderColor: newColor,
    data: [],
    fill: false,
    pointBackgroundColor: '#2f3940',
    pointBorderColor: newColor,
    pointRadius: 4,
    pointBorderWidth:3
  };
  config.data.datasets.push(newDataset);
  for (var index = 1; index <= 18; index++) {
    var total_damage = 0;
    total_damage += (rune.base + (rune.gain * index));
    if(bonus_ad > 0) total_damage += bonus_ad * rune.adratio;
    if(ap > 0) total_damage += ap * rune.apratio;
    if(rune.name == 'Dark Harvest' && souls > 0) total_damage += souls * 5;
    newDataset.data.push(total_damage.toFixed(2));
  }
  window.myLine.update();
}

var config = {
  type: 'line',
  data: {
    labels: ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18']
  },
  options: {
    responsive: true,
    title: {
      display: true,
      text: 'Dark Harvest vs Electrocute Damage Comparison',
      fontColor: 'rgb(245, 246, 250)'
    },
    tooltips: {
      mode: 'index',
      intersect: false,
      backgroundColor: 'rgba(30, 39, 46,0.9)',
      titleMarginBottom: 10,
      xPadding: 10,
      yPadding: 10,
      itemSort: function(a, b, data){
        return a.yLabel - b.yLabel
      },
      callbacks: {
        title: function(tooltipItems, data) {
            return 'Level ' + tooltipItems[0].xLabel;
        },
        labelColor: function(tooltipItem, chart) {
          return {
            backgroundColor: chart.legend.legendItems[tooltipItem.datasetIndex].fillStyle,
            borderColor: chart.legend.legendItems[tooltipItem.datasetIndex].fillStyle
          }
        },
      }
    },
    hover: {
      mode: 'nearest',
      intersect: true,
      onHover: function(e) {
        var point = this.getElementAtEvent(e);
        if (point.length) e.target.style.cursor = 'pointer';
        else e.target.style.cursor = 'default';
      }
    },
    legend:{
      labels:{
        fontColor: 'rgb(245, 246, 250)',
        backgroundColor: '#FFFF00',
        boxWidth: 30
      },
      onHover: function(e) {
        e.target.style.cursor = 'pointer';
      }
    },
    scales: {
      xAxes: [{
        display: true,
        gridLines:{
          zeroLineColor: '#666',
          color: 'rgb(53, 59, 72)'
        },
        ticks:{
          fontColor: 'rgb(245, 246, 250)'
        },
        scaleLabel: {
          display: true,
          labelString: 'Level',
          fontColor: 'rgb(245, 246, 250)',
          fontSize: 14
        }
      }],
      yAxes: [{
        display: true,
        gridLines:{
          zeroLineColor: '#666',
          color: 'rgb(53, 59, 72)'
        },
        ticks:{
          fontColor: 'rgb(245, 246, 250)',
          min: 0
        },
        scaleLabel: {
          display: true,
          labelString: 'Damage',
          fontColor: 'rgb(245, 246, 250)',
          fontSize: 14
        }
      }]
    },
    layout: {
      padding: {
          left: 20,
          right: 40,
          top: 30,
          bottom: 30
      }
    },
    maintainAspectRatio: false
  }
};

window.onload = function() {
  var ctx = document.getElementById('canvas').getContext('2d');
  window.myLine = new Chart(ctx, config);
  //getRuneStats();
  generateChart(runes.DarkHarvest);
  generateChart(runes.Electrocute);
};
