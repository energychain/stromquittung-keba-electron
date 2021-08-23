// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})

const udp = require('dgram');
const buffer = require('buffer');
const axios = require("axios");

window._getLastFinishedSession = function(DEVICE_IP) {
  const storage = {get:function(a) {
                          return window.localStorage.getItem(a)
                      },
                   set:function(key,value) {
                     window.localStorage.setItem(key,value);
                   }
                  };
  return new Promise( async function (resolve, reject)  {
      let prep = {};
      let retrier = -1;
      const client = udp.createSocket('udp4');

      client.on('message',async   function(msg,info){
        try {
        let json = JSON.parse(msg.toString());
          if(json.ID == '101') {
            if(json["Session ID"]+"" !== storage.get("lastSessionId")+"") {
              console.log("Last was",storage.get("lastSessionId"),json["Session ID"]);
              prep.tx_energy=(json["E pres"]/10000);
              prep.tx_duration = Math.round((json['ended[s]']-json['started[s]'])/60);
              prep.tx_date = new Date(json["ended[s]"]*1000).toISOString().substring(0,16);
              prep.tx_meter = json["tx_meter"];
              storage.set("tx_energy",prep.tx_energy);
              storage.set("tx_date",prep.tx_date);
              storage.set("tx_duration",prep.tx_duration);

              let resp = await axios.post("https://api.corrently.io/v2.0/quittung/prepare",prep);
              storage.set("lastSessionId",json["Session ID"]);
              storage.set("lastPreperation","https://corrently.de/service/quittung.html?prep="+resp.data.account);
              resolve("https://corrently.de/service/quittung.html?prep="+resp.data.account);
            } else {
              resolve(storage.get("lastPreperation"));
            }
            client.close();
            client.unref();
            clearInterval(retrier);
          }
        } catch(e) {console.log(e);}
      });
      client.on('error',function(error){
          client.close();
      });
      client.bind(7090);
      const sendREQ = function() {
        try {
        client.send(Buffer.from("report 101"),7090,DEVICE_IP,function(error){
          if(error){
            client.close();
            resolve({});
          }else{
          }
        });
        } catch(e) {}
      }
      sendREQ();
      retrier = setInterval(sendREQ,5000);
  });
}
