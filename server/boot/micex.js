import micexService from '../services/micexService';

export default (app) => {
  micexService.getConstansts()
    .then(regularRequestData)

  function regularRequestData(){
    requestAndSaveData().then(() => {
      let delayMinutes = 1;
      setTimeout(regularRequestData, delayMinutes * 60 * 1000);
    })
  }

  function requestAndSaveData() {
    return micexService.requestLastMarketdata()
      .then((data) => {
        let LastData = app.models.LastData;
        let values = Object.values(data);
        console.log('Micex data received, length: ', values.length);
        let lastDatas = values.map((security) => {
          return new LastData({
            dataId: security.node.id,
            value: security.node.last,
            data: security
          });
        })
        console.log('starting saving Micex data');
        let promises = lastDatas.map(lastData => LastData.upsert(lastData));
        return Promise.all(promises);
      })
      .then(() => {
        console.log('Micex data saved');
      })
      .catch((error) => {
        console.log('error occured');
        console.error(error);
      });
  }
}
