import DefraMap from '../../src/index.js'
import { openMapStyles, psMapStyles } from './mapStyles.js'
import { dataLayers } from './dataLayers.js'
import { searchCustomDatasets } from './searchCustomDatasets.js'
import { transformGeocodeRequest, transformTileRequest, transformDataRequest } from './request.js'
// Providers
import maplibreProvider from '/providers/maplibre/src/index.js'
import openNamesProvider from '/providers/open-names/src/index.js'
// Plugins
import zoomControlsPlugin from '/plugins/zoom-controls/src/index.js'
import useLocationPlugin from '/plugins/use-location/src/index.js'
import mapStylesPlugin from '/plugins/map-styles/src/index.js'
import menuDataLayersPlugin from '/plugins/menu-data-layers/src/index.js'
import dataLayersPlugin from '/plugins/data-layers-ml/src/index.js'
import createDrawPlugin from '/plugins/draw-ml/src/index.js'
import scaleBarPlugin from '/plugins/scale-bar/src/index.js'
import searchPlugin from '/plugins/search/src/index.js'
import createInteractPlugin from '/plugins/interact/src/index.js'

var featureGeoJSON = { id: 'test1234', type: 'Feature', geometry: { coordinates: [[[-2.9406643378873127,54.918060570259456],[-2.9092219779267054,54.91564249172612],[-2.904350626383433,54.90329530000005],[-2.909664828067463,54.89540129642464],[-2.9225074821353587,54.88979816151294],[-2.937121536764323,54.88826989853317],[-2.95682836800691,54.88916139231736],[-2.965463945742613,54.898966521920045],[-2.966349646023133,54.910805898763385],[-2.9406643378873127,54.918060570259456]]], type: 'Polygon' }}

var interactPlugin = createInteractPlugin({
	dataLayers: [{
		layerId: 'field-parcels',
		idProperty: 'ID',
		selectedFeatureStyle: { stroke: { outdoor: '#ff0000', dark: '#00ff00' }, strokeWidth: 2, fill: 'rgba(255, 0, 0, 0.1)' }
	},{
		layerId: 'linked-parcels',
		idProperty: 'ID',
		selectedFeatureStyle: { stroke: { outdoor: '#ff0000', dark: '#00ff00' }, strokeWidth: 2, fill: 'rgba(255, 0, 0, 0.1)' }
	}],
	markerColor: { outdoor: '#ff0000' },
	interactionMode: 'select', // 'auto', 'select', 'marker' // defaults to 'marker'
	multiSelect: true,
	excludeModes: ['draw']
})

var drawPlugin = createDrawPlugin({
	includeModes: ['draw']
})

var defraMap = new DefraMap('map', {
	behaviour: 'hybrid',
	mapProvider: maplibreProvider,
	reverseGeocodeProvider: openNamesProvider({
		url: process.env.OS_NEAREST_URL,
		// url: '/api/os-nearest-proxy?query={query}',
		transformRequest: transformGeocodeRequest
		// showMarker: true
	}),
	// maxMobileWidth: 700,
	// minDesktopWidth: 960,
	mapLabel: 'Map showing Carlisle',
	// zoom: 14,
	minZoom: 6,
	maxZoom: 20,
	autoColorScheme: true,
	// centre: [-2.938769, 54.893806],
	bounds: [-2.989707, 54.864555, -2.878635, 54.937635],
	containerHeight: '650px',
	transformRequest: transformTileRequest,
	// enableFullscreen: true,
	hasExitButton: true,
	// markers: [{
	// 	id: 'location',
	// 	coords: [-2.9592267, 54.9045977],
	// 	color: { outdoor: '#ff0000', dark: '#00ff00' }
	// }],
	mapStyle: {
		url: process.env.OUTDOOR_URL,
		logo: '/assets/images/os-logo.svg',
		logoAltText: 'Ordnance survey logo',
		attribution: `Contains OS data ${String.fromCharCode(169)} Crown copyright and database rights ${(new Date()).getFullYear()}`,
		backgroundColor: '#f5f5f0'
	},
	plugins: [
		mapStylesPlugin({
			mapStyles: psMapStyles
		}),
		zoomControlsPlugin(),
		scaleBarPlugin({
			units: 'metric'
		}),
		searchPlugin({
			transformRequest: transformGeocodeRequest,
			osNamesURL: process.env.OS_NAMES_URL,
			customDatasets: searchCustomDatasets,
			width: '300px',
			showMarker: false
		}),
		useLocationPlugin(),
		dataLayersPlugin({
			transformRequest: transformDataRequest,
			layers: dataLayers
		}),
		// interactPlugin,
		drawPlugin,
		// menuDataLayersPlugin({
		// 	dataLayers: [],
		// 	excludeModes: ['circle', 'square', 'polygon']
		// })
	]
	// search
})

defraMap.on('map:ready', function (e) {
	defraMap.setMode('draw')
})

defraMap.on('draw:ready', function () {
	drawPlugin.newPolygon('test')
	// drawPlugin.editFeature(featureGeoJSON)
})

defraMap.on('interact:done', function (e) {
	console.log(e)
})

// Update selected feature
defraMap.on('search:match', function (e) {
	if (e.type !== 'parcel') {
		return
	}
	interactPlugin.selectFeatures({
		idProperty: 'ID',
		featureId: e.id,
		layerId: 'field-parcels'
	})
})

// Hide selected feature
defraMap.on('search:clear', function (e) {
	// console.log('Search clear')
})