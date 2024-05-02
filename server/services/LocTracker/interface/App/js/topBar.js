function formatDate(_date){
  console.log(_date);
  let month = (_date.getMonth() + 1).toString();
  let day = _date.getDate().toString();
  const year = _date.getFullYear();
  let hours = _date.getHours();
  let minutes = _date.getMinutes();
  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day
  if (hours < 10) hours = '0' + hours
  if (minutes < 10) minutes = '0' + minutes
  return hours + ':' + minutes + ' ' + [ day, month, year ].join('-');
}


const TopBar = new class {
  #HTML = {
    topBar: $('#topBar')[0],
    tileInfoHolder: $('#topBar .infoHolder.tileCountHolder')[0],
    bottomOverlay: $('#bottomOverlay')[0]
  }


  update() {
    let lastPoint = DataManager.data[DataManager.data.length - 1];
    setTextToElement(this.#HTML.tileInfoHolder, DataManager.tileList.length + (DataManager.tileList.length != 1 ? ' Tiles' : ' Tile'));
    setTextToElement(this.#HTML.bottomOverlay, DataManager.data.length + ' Points' + (lastPoint ? ' (' + formatDate(lastPoint.date) + ')' : ''));
  }
}

