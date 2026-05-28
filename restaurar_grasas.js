const fs = require('fs');
const path = '/data/data/com.termux/files/home/Dt-app/data/alimentacion.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const originales = {
  '1778216541791': 1.2, '1778377380425': 1.2, '1778379484797': 1.0,
  '1778377049231': 1.2, '1778687454932': 1.5, '1778377616786': 0.9,
  '1779311725122': 1.0, '1778354312296': 0.8, '1778376855974': 0.8,
  '1778389775722': 1.0, '1778377208321': 0.8, '1778378152347': 1.0,
  '1778379130440': 1.0, '1778379342983': 1.0, '1778379762356': 1.0,
  'test_001': 1.0, 'test_002': 0.8, 'test_003': 1.0, 'test_004': 1.2,
  'test_005': 1.0, 'test_006': 1.0, 'test_007': 1.2, 'test_008': 1.0,
  'test_009': 1.0, 'test_010': 0.8
};

Object.entries(originales).forEach(([id, val]) => {
  if (data[id]) { data[id].grasas = val; console.log(id, '→', val); }
});

fs.writeFileSync(path, JSON.stringify(data, null, 2));
console.log('OK');
