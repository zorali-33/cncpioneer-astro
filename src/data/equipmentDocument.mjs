// User-supplied originals, grouped by machining service.
export const equipmentDocuments = [
  {
    id:'machining-equipment',
    service:'cnc-turning-and-milling',
    label:'Machining Equipment List',
    title:'CNC Turning & Milling Equipment List',
    description:'Machine names, brands, models, control systems, travel, spindle speeds and tool capacities recorded in the equipment register.',
    url:'/assets/documents/cncpioneer-cnc-turning-milling-equipment-list.pdf',
    filename:'cncpioneer-cnc-turning-milling-equipment-list.pdf',
    pages:3,
    bytes:17070,
    sha256:'7395a21017a83d9dcf93901eba44389739c2256d44404e0ff991c9762b046612',
  },
  {
    id:'measurement-equipment',
    service:'cnc-turning-and-milling',
    label:'Measurement Equipment List',
    title:'Measurement Equipment List',
    description:'Measurement and inspection instruments for CNC turning and milling, including specifications, instrument identifiers and recorded calibration details.',
    url:'/assets/documents/cncpioneer-cnc-turning-milling-measurement-equipment-list.pdf',
    filename:'cncpioneer-cnc-turning-milling-measurement-equipment-list.pdf',
    pages:4,
    bytes:19992,
    sha256:'895929acf34d1a4934724ff334ba14195e90cd8669602518ea7acdac0a03b977',
  },
  {
    id:'swiss-equipment',
    service:'swiss-machining',
    label:'Equipment & Inspection List',
    title:'Swiss-Type CNC Lathe Machines List',
    description:'Machining, inspection and auxiliary equipment for Swiss machining operations.',
    url:'/assets/documents/cncpioneer-swiss-type-cnc-lathe-machines-list.pdf',
    filename:'cncpioneer-swiss-type-cnc-lathe-machines-list.pdf',
    pages:1,
    bytes:15508,
    sha256:'ff4952cdf3a46c6591e8ae103cbba8060e2a4a191e6a82f5205862c261c69f1d',
  },
];

export const equipmentServices = [
  {
    id:'cnc-turning-and-milling',
    title:'CNC Turning & Milling',
    description:'Machine specifications and measurement equipment for our CNC turning and milling operations, together in one place.',
  },
  {
    id:'swiss-machining',
    title:'Swiss Machining',
    description:'Swiss-type lathe equipment, supporting machines and inspection instruments in one downloadable list.',
  },
];
