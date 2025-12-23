import DefraMap from '../../src/index.js'
import { vtsMapStyles27700 } from './mapStyles.js'
import { searchCustomDatasets } from './searchCustomDatasets.js'
import { transformGeocodeRequest, transformTileRequest, transformDataRequest, setupEsriConfig } from './auth.js'
// Providers
import maplibreProvider from '/providers/maplibre/src/index.js'
import openNamesProvider from '/providers/open-names/src/index.js'
import esriProvider from '/providers/esri/src/index.js'
// Plugins
import zoomControlsPlugin from '/plugins/zoom-controls/src/index.js'
import useLocationPlugin from '/plugins/use-location/src/index.js'
import mapStylesPlugin from '/plugins/map-styles/src/index.js'
import menuDataLayersPlugin from '/plugins/menu-data-layers/src/index.js'
import createDrawPlugin from '/plugins/draw-es/src/index.js'
import scaleBarPlugin from '/plugins/scale-bar/src/index.js'
import searchPlugin from '/plugins/search/src/index.js'
import createInteractPlugin from '/plugins/interact/src/index.js'

var featureGeoJSON = {id: 'test', type: 'feature', geometry: {type: 'polygon', coordinates: [[[324667,537194],[325298,537194],[325298,536563],[324667,536563],[324667, 537194]]]}}

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
	interactionMode: 'marker', // 'auto', 'select', 'marker' // defaults to 'marker'
	// multiSelect: true
})

var drawPlugin = createDrawPlugin({
	// includeModes: ['draw']
})

var defraMap = new DefraMap('map', {
	behaviour: 'hybrid',
	mapProvider: esriProvider({
		setupConfig: setupEsriConfig
	}),
	reverseGeocodeProvider: openNamesProvider({
		url: process.env.OS_NEAREST_URL,
		// url: '/api/os-nearest-proxy?query={query}',
		transformRequest: transformGeocodeRequest
		// showMarker: true
	}),
	// maxMobileWidth: 700,
	// minDesktopWidth: 960,
	mapLabel: 'Ambleside',
	// zoom: 14,
	minZoom: 2,
	maxZoom: 15,
	autoColorScheme: true,
	// center: [337672, 504580],
	extent: [337047, 503795, 338120, 505281],
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
		url: process.env.VTS_OUTDOOR_URL_27700,
		logo: '/assets/images/os-logo.svg',
		logoAltText: 'Ordnance survey logo',
		attribution: `Contains OS data ${String.fromCharCode(169)} Crown copyright and database rights ${(new Date()).getFullYear()}`,
		backgroundColor: '#f5f5f0'
	},
	plugins: [
		mapStylesPlugin({
			mapStyles: vtsMapStyles27700
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
	// defraMap.setMode('draw')
})

defraMap.on('draw:ready', function () {
	drawPlugin.newPolygon('test')
	// drawPlugin.editFeature(featureGeoJSON)
})

defraMap.on('draw:create', function (e) {
	console.log(e)
	// drawPlugin.editFeature(featureGeoJSON)
})