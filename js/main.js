var champions;
var picked_champions = [];
// Gold value for each stat per point/percentage
var HP = 2.67;
var HP_REGEN = 36;
var MANA = 1.4;
var MANA_REGEN = 60;
var ATTACK_DAMAGE = 35;
var ATTACK_SPEED = 25; //per %
var ARMOR = 20;
var MAGIC_RESIST = 18;

var isCheckedHP = true;
var isCheckedHPregen = true;
var isCheckedMP = true;
var isCheckedMPregen = true;
var isCheckedAD = true;
var isCheckedAS = true;
var isCheckedArmor = true;
var isCheckedMagicResist = true;

// List of champions with bonus attack speed at level 1 (for precise calculation)
var champs_with_bonus_as_lvl1 = {
  'Amumu': 15.3,
  'Caitlyn': 10,
  'DrMundo': 15.3,
  'Ekko': 10,
  'Gnar': 5.5,
  'Gragas': 8,
  'Kayle': 10,
  'Lux': 7,
  'Malphite': 15,
  'Maokai': 15.3,
  'MasterYi': 8,
  'Nautilus': 15,
  'Nocturne': 8,
  'Pantheon': 8,
  'Shen': 15,
  'Wukong': 8,
  'Yasuo': 4,
  'Zac': 15
};

window.chartColors = [
	{value: 'rgb(252, 92, 101)', picked: false},
	{value: 'rgb(253, 150, 68)', picked: false},
	{value: 'rgb(38, 222, 129)', picked: false},
  {value: 'rgb(15, 185, 177)', picked: false},
	{value: 'rgb(69, 170, 242)', picked: false},
  {value: 'rgb(75, 123, 236)', picked: false},
	{value: 'rgb(153, 102, 255)', picked: false},
  {value: 'rgb(113, 128, 147)', picked: false}
];

function getChampionStats(latest_version){
  var static_data_url = 'https://ddragon.leagueoflegends.com/cdn/' + latest_version + '/data/en_US/champion.json';
  $.ajax({
      url: static_data_url,
      type: "GET",
      dataType: "json",
      error: function(jqXHR, textStatus, errorThrown) {
          alert('Unable to get latest champion details.');
          console.log('jqXHR:');
          console.log(jqXHR);
          console.log('textStatus:');
          console.log(textStatus);
          console.log('errorThrown:');
          console.log(errorThrown);
      },
      success: function(data, textStatus, jqXHR) {
          champions = data.data;
          // Populate dropdown with champion names
          var sel = document.getElementById('ChampionList');
          var fragment = document.createDocumentFragment();
          for(var key in champions){
            var opt = document.createElement('option');
            opt.innerHTML = champions[key].name;
            opt.value = key;
            fragment.appendChild(opt);
          }
          sel.appendChild(fragment);
      },
      complete: function(data){
        $("#ChampionList").chosen({width:"100%"});
      }
  });
}

function championSelected(){
  var sel = document.getElementById('ChampionList');
  var champ_selected = sel.value;
  addToChart(champ_selected);
}

function addToChart(champ_selected){
  var alert = document.getElementById('ChampionListAlert');
  if(picked_champions.indexOf(champ_selected) > -1){
    alert.innerHTML = champions[champ_selected].name + " has already been added.";
  }
  else if(picked_champions.length >= 8){
    alert.innerHTML = "Only 8 champions can be compared at a time.";
  }
  else{
    alert.innerHTML = "";
    document.getElementById('clearbutton').disabled = false;
    generateChart(champ_selected);
    picked_champions.push(champ_selected);
  }
}

function generateChart(champ_selected){
  var champ_selected_stats = champions[champ_selected].stats;
  var available_color_index = window.chartColors.map(function(e){return e.picked;}).indexOf(false);
  var newColor = window.chartColors[available_color_index].value;
  window.chartColors[available_color_index].picked = true;
  var newDataset = {
    label: champions[champ_selected].name,
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
  var current_bonus_as = (champs_with_bonus_as_lvl1.hasOwnProperty(champ_selected)) ? champs_with_bonus_as_lvl1[champ_selected] : 0;
  for (var index = 0; index < 18; index++) {
    var total_gold = 0;
    if(isCheckedHP) total_gold += (champ_selected_stats.hp + (champ_selected_stats.hpperlevel * index))  * HP;
    if(isCheckedHPregen) total_gold += (champ_selected_stats.hpregen + (champ_selected_stats.hpregenperlevel * index)) * HP_REGEN;
    if(isCheckedMP) total_gold += (champ_selected_stats.mp + (champ_selected_stats.mpperlevel * index)) * MANA;
    if(isCheckedMPregen) total_gold += (champ_selected_stats.mpregen + (champ_selected_stats.mpregenperlevel * index)) * MANA_REGEN;
    if(isCheckedAD) total_gold += (champ_selected_stats.attackdamage + (champ_selected_stats.attackdamageperlevel * index)) * ATTACK_DAMAGE;
    if(isCheckedAS) total_gold += (current_bonus_as + (champ_selected_stats.attackspeedperlevel * index)) * ATTACK_SPEED;
    if(isCheckedArmor) total_gold += (champ_selected_stats.armor + (champ_selected_stats.armorperlevel * index)) * ARMOR;
    if(isCheckedMagicResist) total_gold += (champ_selected_stats.spellblock + (champ_selected_stats.spellblockperlevel * index)) * MAGIC_RESIST;
    newDataset.data.push(Math.round(total_gold));
  }
  window.myLine.update();
}

function checkboxOnChange(checkbox){
  if(checkbox.checked){
    updateChecked(checkbox.id, true);
  }else{
    updateChecked(checkbox.id, false);
  }
}

function updateChecked(checkboxid, checkboxstate){
  switch(checkboxid){
    case "customCheckHP": isCheckedHP = checkboxstate; break;
    case "customCheckHPRegen": isCheckedHPregen = checkboxstate; break;
    case "customCheckMP": isCheckedMP = checkboxstate; break;
    case "customCheckMPRegen": isCheckedMPregen = checkboxstate; break;
    case "customCheckAD": isCheckedAD = checkboxstate; break;
    case "customCheckAS": isCheckedAS = checkboxstate; break;
    case "customCheckArmor": isCheckedArmor = checkboxstate; break;
    case "customCheckMagicResist": isCheckedMagicResist = checkboxstate; break;
  }
  clearGraph();
  for(var c in picked_champions){
    generateChart(picked_champions[c]);
  }
}

function clearButton(){
  clearGraph();
  picked_champions.splice(0, picked_champions.length);
  document.getElementById('clearbutton').disabled = true;
}

function clearGraph(){
  window.myLine.data.datasets.splice(0, window.myLine.data.datasets.length);
  window.myLine.update();
  window.chartColors.forEach(function (arrayItem) {
    arrayItem.picked = false;
  });
}

// Helper for truncating patch versions
function nthIndex(str, pat, n){
    var L= str.length, i= -1;
    while(n-- && i++<L){
        i= str.indexOf(pat, i);
        if (i < 0) break;
    }
    return i;
}

// Get latest version of LoL before retrieving champion stats
var version_url = 'https://ddragon.leagueoflegends.com/api/versions.json';
$.ajax({
    url: version_url,
    type: "GET",
    dataType: "json",
    error: function(jqXHR, textStatus, errorThrown) {
        alert('Unable to get the latest LoL patch version. ');
        console.log('jqXHR:');
        console.log(jqXHR);
        console.log('textStatus:');
        console.log(textStatus);
        console.log('errorThrown:');
        console.log(errorThrown);
    },
    success: function(data, textStatus, jqXHR) {
        var latest_version = data[0];
        var pv = document.getElementById('patchversion');
        var dot2 = nthIndex(latest_version,'.',2);
        pv.innerHTML = "Patch " + latest_version.substring(0,dot2);
        getChampionStats(latest_version);
    }
});

var config = {
  type: 'line',
  data: {
    labels: ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18']
  },
  options: {
    responsive: true,
    title: {
      display: true,
      text: 'Champion Stat\'s Gold Value Per Level',
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
        return b.yLabel - a.yLabel
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
      onClick: function(e, legendItem) {
        var champ_full_name = legendItem.text;
        if(champ_full_name.indexOf("'") > -1){
          var splitted_str = champ_full_name.split("'");
          splitted_str[1] = splitted_str[1].toLowerCase();
          champ_full_name = splitted_str.join();
        }
        champ_full_name = champ_full_name.replace(/[\s|,|.]+/g, '');
        var champ_index = picked_champions.indexOf(champ_full_name);
        picked_champions.splice(champ_index,1);
        if(picked_champions.length == 0) document.getElementById('clearbutton').disabled = true;
        var remove_color_index = window.chartColors.map(function(e){return e.value;}).indexOf(legendItem.fillStyle);
        window.chartColors[remove_color_index].picked = false;
        var index = legendItem.datasetIndex;
        var ci = this.chart;
        ci.data.datasets.splice(index,1);
        ci.update();
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
          labelString: 'Gold Value',
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
};
