/************************************************************
 DEÜ Tınaztepe Kampüsü
 Fakülte bazlı NDVI + NDBI piksel çıkarımı
************************************************************/

// ==========================================================
// 1) FAKÜLTE GEOMETRİLERİ
// ==========================================================

var gsf_geom = ee.Geometry.Polygon(
  [[[27.20388155229232, 38.36737592939943],
    [27.205045631004783, 38.36703104019241],
    [27.206215074135276, 38.36774184663926],
    [27.20637064225814, 38.36787223049606],
    [27.204444816185447, 38.368444234317835],
    [27.20388155229232, 38.36737592939943]]]
);

var fenedebiyat_geom = ee.Geometry.Polygon(
  [[27.20234196431777, 38.367615668489684],
   [27.20160703904769, 38.36655155734461],
   [27.202164938522788, 38.366332844815226],
   [27.20309834725997, 38.36600898081744],
   [27.203318288399192, 38.365996362710256],
   [27.204707672668906, 38.366850183000125],
   [27.202669193817588, 38.367573609057594],
   [27.2024009729161, 38.3676661397759],
   [27.20234196431777, 38.367615668489684]]
);

var isletme_geom = ee.Geometry.Polygon(
  [[27.201448244582632, 38.3693462494797],
   [27.20071868373058, 38.3680003677132],
   [27.20151261759899, 38.367773247696874],
   [27.202188534270743, 38.36913595710358],
   [27.201448244582632, 38.3693462494797]]
);

var deniz_geom = ee.Geometry.Polygon(
  [[27.20130340529583, 38.36949765961211],
   [27.201603812705496, 38.37009909117649],
   [27.202633780967215, 38.369779449848515],
   [27.202338737975577, 38.36919063318015],
   [27.20130340529583, 38.36949765961211]]
);

var hukuk_geom = ee.Geometry.Polygon(
  [[27.19577269030712, 38.37218934242423],
   [27.19599799586437, 38.37168045381765],
   [27.19727472735546, 38.371011743513364],
   [27.19773606730602, 38.37077201567312],
   [27.19855145884655, 38.37232392393668],
   [27.197387380134085, 38.372664582271405],
   [27.197060150634268, 38.372744489549795],
   [27.196899218093375, 38.37270663874471],
   [27.195853156577567, 38.372273455898835],
   [27.19577269030712, 38.37218934242423]]
);

var muhendis_geom = ee.Geometry.Polygon(
  [[27.207338375579337, 38.37102646361802],
   [27.206812662612418, 38.36991613874707],
   [27.21046046687267, 38.3687469145968],
   [27.21103982401989, 38.36991613874707],
   [27.207359833251456, 38.3710853440067],
   [27.207338375579337, 38.37102646361802]]
);

var mimar_geom = ee.Geometry.Polygon(
  [[27.20727400256298, 38.36947032169498],
   [27.20673756076, 38.368275854924555],
   [27.20847563220165, 38.36768702602253],
   [27.210331720839957, 38.36736737404089],
   [27.210846704970816, 38.36833473755127],
   [27.20727400256298, 38.36947032169498]]
);

var turizm_geom = ee.Geometry.Polygon(
  [[27.221564812194327, 38.38198580183243],
   [27.223345798980215, 38.38052240988501],
   [27.224804920684317, 38.3808924658177],
   [27.224332851897696, 38.3827258968324],
   [27.22347454501293, 38.38311276165961],
   [27.22272352648876, 38.38306230114733],
   [27.221564812194327, 38.38198580183243]]
);

// ==========================================================
// 2) FAKÜLTELERİ FEATURE COLLECTION HALİNE GETİR
// ==========================================================
var fakulteler = ee.FeatureCollection([
  ee.Feature(gsf_geom, {fakulte: 'Guzel Sanatlar'}),
  ee.Feature(fenedebiyat_geom, {fakulte: 'Fen Edebiyat'}),
  ee.Feature(isletme_geom, {fakulte: 'Isletme'}),
  ee.Feature(deniz_geom, {fakulte: 'Denizcilik'}),
  ee.Feature(hukuk_geom, {fakulte: 'Hukuk'}),
  ee.Feature(muhendis_geom, {fakulte: 'Muhendislik'}),
  ee.Feature(mimar_geom, {fakulte: 'Mimarlik'}),
  ee.Feature(turizm_geom, {fakulte: 'Turizm'})
]);

var kampus = fakulteler.geometry().dissolve();

// ==========================================================
// 3) HARİTA
// ==========================================================
Map.setCenter(27.197, 38.3716, 15);
Map.addLayer(fakulteler.style({color: 'white', fillColor: '00000000', width: 2}), {}, 'Fakulte Sinirlari');

// ==========================================================
// 4) BULUT MASKESİ
// ==========================================================
function maskS2(image) {
  var scl = image.select('SCL');
  var mask = scl.neq(3)
    .and(scl.neq(8))
    .and(scl.neq(9))
    .and(scl.neq(10))
    .and(scl.neq(11));
  return image.updateMask(mask);
}

// ==========================================================
// 5) SENTINEL-2 KOLEKSİYONU
// ==========================================================
var koleksiyon = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
  .filterBounds(kampus)
  .filterDate('2024-06-01', '2024-08-31')
  .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 20))
  .map(maskS2)
  .sort('CLOUDY_PIXEL_PERCENTAGE');

var goruntu = ee.Image(koleksiyon.first());

print('Secilen goruntu:', goruntu);
print('Tarih:', goruntu.date().format('YYYY-MM-dd'));
print('Bulut orani:', goruntu.get('CLOUDY_PIXEL_PERCENTAGE'));

// ==========================================================
// 6) NDVI ve NDBI
// ==========================================================
var ndvi = goruntu.normalizedDifference(['B8', 'B4']).rename('ndvi');
var ndbi = goruntu.normalizedDifference(['B11', 'B8']).rename('ndbi');
var indeksler = ndvi.addBands(ndbi).clip(kampus);

// ==========================================================
// 7) HARİTADA NDVI GÖSTER
// ==========================================================
var ndviViz = {
  min: -0.2,
  max: 0.8,
  palette: ['#8c510a', '#bf812d', '#dfc27d', '#80cdc1', '#35978f', '#01665e']
};

Map.addLayer(indeksler.select('ndvi'), ndviViz, 'NDVI');

// ==========================================================
// 8) HER FAKÜLTE İÇİN PİKSEL ÖRNEKLEME
// ==========================================================
var samples = indeksler.sampleRegions({
  collection: fakulteler,
  properties: ['fakulte'],
  scale: 10,
  geometries: true
});

// ==========================================================
// 9) LONGITUDE / LATITUDE / FAKULTE TABLOSU
// ==========================================================
var piksel_tablo = samples.map(function(f) {
  var xy = f.geometry().coordinates();
  return ee.Feature(null, {
    longitude: xy.get(0),
    latitude: xy.get(1),
    ndvi: f.get('ndvi'),
    ndbi: f.get('ndbi'),
    fakulte: f.get('fakulte')
  });
});

print('Piksel tablosu ilk 10 satir:', piksel_tablo.limit(10));

// ==========================================================
// 10) FAKÜLTE ORTALAMALARI
// ==========================================================
var fakulte_ozet = fakulteler.map(function(f) {
  var stats = indeksler.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: f.geometry(),
    scale: 10,
    maxPixels: 1e13
  });

  return ee.Feature(null, {
    fakulte_adi: f.get('fakulte'),
    ortalama_ndvi: stats.get('ndvi'),
    ortalama_ndbi: stats.get('ndbi')
  });
});

print('Fakulte ozet:', fakulte_ozet);

// ==========================================================
// 11) CSV EXPORTLARI
// ==========================================================
Export.table.toDrive({
  collection: piksel_tablo,
  description: 'DEU_Fakulte_Piksel_Verisi_2024',
  folder: 'GEE_Exports',
  fileNamePrefix: 'piksel_veri',
  fileFormat: 'CSV',
  selectors: ['longitude', 'latitude', 'ndvi', 'ndbi', 'fakulte']
});

Export.table.toDrive({
  collection: fakulte_ozet,
  description: 'DEU_Fakulte_Ozet_2024',
  folder: 'GEE_Exports',
  fileNamePrefix: 'fakulte_ozet',
  fileFormat: 'CSV',
  selectors: ['fakulte_adi', 'ortalama_ndvi', 'ortalama_ndbi']
});

// ==========================================================
// 12) NDVI RASTER EXPORT
// ==========================================================
Export.image.toDrive({
  image: indeksler.select('ndvi'),
  description: 'DEU_Fakulte_NDVI_Raster_2024',
  folder: 'GEE_Exports',
  fileNamePrefix: 'deu_fakulte_ndvi_raster_2024',
  region: kampus,
  scale: 10,
  maxPixels: 1e13
});
