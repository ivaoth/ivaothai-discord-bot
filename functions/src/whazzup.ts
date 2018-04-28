import axios from 'axios';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as camelCase from 'camelcase';

const facilityTypes = {
  '0': 'Observer',
  '1': 'Flight Information',
  '2': 'Delivery',
  '3': 'Ground',
  '4': 'Tower',
  '5': 'Approach',
  '6': 'ACC',
  '7': 'Departure'
};

const atcRatings = {
  '1': 'Observer',
  '2': 'AS1',
  '3': 'AS2',
  '4': 'AS3',
  '5': 'ADC',
  '6': 'APC',
  '7': 'ACC',
  '8': 'SEC',
  '9': 'SAI',
  '10': 'CAI'
};

const pilotRatings = {
  '1': 'Observer',
  '2': 'FS1',
  '3': 'FS2',
  '4': 'FS3',
  '5': 'PP',
  '6': 'SPP',
  '7': 'CP',
  '8': 'ATP',
  '9': 'SFI',
  '10': 'CFI'
};

const parseClient = (line: string) => {
  const fields = line.split(':');
  console.log(line);
  const client: any = {};
  client.callsign = fields[0];
  client.vid = fields[1];
  client.type = fields.length === 49 ? fields[3].toLowerCase() : 'skip';
  client.connectionTime = fields[37];
  client.softwareName = fields[38];
  client.softwareVersion = fields[39];
  switch (client.type) {
    case 'atc':
      if (fields[18] === '0') {
        client.type = 'observer';
      } else {
        client.frequency = fields[4];
        client.facilityType = facilityTypes[fields[18]];
        client.rating = atcRatings[fields[41]];
      }
      break;
    case 'pilot':
      client.latitiude = parseFloat(fields[5]);
      client.longtitude = parseFloat(fields[6]);
      client.altitude = parseInt(fields[7]);
      client.groundSpeed = parseInt(fields[8]);
      client.heading = parseInt(fields[45]);
      client.onGround = fields[46] === '1';
      client.squawk = fields[17];
      client.rating = pilotRatings[fields[41]];
      if (fields[20] !== '') {
        client.fullAircraft = fields[9];
        client.aircraft = fields[9].split('/')[1];
        client.cruisingSpeed = fields[10];
        client.departure = fields[11];
        client.cruislingLevel = fields[12];
        client.destination = fields[13];
        client.flightRules = fields[21];
        client.departureTime = fields[22];
        client.enrouteTime = parseInt(fields[24]) * 60 + parseInt(fields[25]);
        client.endurace = parseInt(fields[26]) * 60 + parseInt(fields[27]);
        client.alternate = fields[28];
        client.remarks = fields[29];
        client.route = fields[30];
        client.alternate2 = fields[42];
        client.typeOfFlight = fields[43];
        client.pob = parseInt(fields[44]);
      }
  }
  console.log(client);
  return client;
};

const parseData = async (data: string) => {
  const lines = data.split('\n').map(l => l.trim());
  let mode = '';
  const status: any = {};
  const clients: any[] = [];
  for (const line of lines) {
    if (line.startsWith('!')) {
      mode = line.slice(1);
    } else {
      switch (mode) {
        case 'GENERAL':
          const [key, value] = line.split(' = ');
          status[camelCase(key)] = value;
          break;
        case 'CLIENTS':
          const client = parseClient(line);
          if (client.type !== 'skip') {
            clients.push(client);
          } else {
            console.log('Skipping');
            console.log(line);
            console.log(client);
          }
          break;
      }
    }
  }
  await admin
    .firestore()
    .collection('whazzup')
    .doc('clients')
    .set({ clients });
  await admin
    .firestore()
    .collection('whazzup')
    .doc('status')
    .set(status);
};

export const whazzup = functions.https.onRequest(async (req, resp) => {
  const paths: string[] = (await admin
    .firestore()
    .collection('whazzup')
    .doc('config')
    .get()).data().url0;
  const usePath = paths[Math.floor(Math.random() * paths.length)];
  const data = (await axios.get(usePath)).data;
  await parseData(data);
  resp
    .status(200)
    .send()
    .end();
});
