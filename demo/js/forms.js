import DefraMap from '../../src/index.js'
import { openMapStyles, vtsMapStyles3857 } from './mapStyles.js'
import { searchCustomDatasets } from './searchCustomDatasets.js'
import { transformGeocodeRequest, transformTileRequest, transformDataRequest } from './auth.js'
// Providers
import maplibreProvider from '/providers/maplibre/src/index.js'
import openNamesProvider from '/providers/open-names/src/index.js'
// Plugins
import zoomControlsPlugin from '/plugins/zoom-controls/src/index.js'
import useLocationPlugin from '/plugins/use-location/src/index.js'
import mapStylesPlugin from '/plugins/map-styles/src/index.js'
import dataLayersPlugin from '/plugins/data-layers-ml/src/index.js'
import createDrawPlugin from '/plugins/draw-ml/src/index.js'
import scaleBarPlugin from '/plugins/scale-bar/src/index.js'
import searchPlugin from '/plugins/search/src/index.js'
import createInteractPlugin from '/plugins/interact/src/index.js'
import framePlugin from '/plugins/frame/src/index.js'

var interactPlugin = createInteractPlugin({
	// dataLayers: [],
	markerColor: { outdoor: '#ff0000' },
	// closeOnDone: false,
	// closeOnCancel: false,
	interactionMode: 'marker', // 'auto', 'select', 'marker' // defaults to 'marker'
	multiSelect: false
})

var defraMap = new DefraMap('map', {
	behaviour: 'inline',
	mapProvider: maplibreProvider(),
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
	// center: [-2.938769, 54.893806],
	bounds: [-2.989707, 54.864555, -2.878635, 54.937635],
	containerHeight: '650px',
	transformRequest: transformTileRequest,
	// enableFullscreen: true,
	// hasExitButton: true,
	// markers: [{
	// 	id: 'location',
	// 	coords: [-2.9592267, 54.9045977],
	// 	color: { outdoor: '#ff0000', dark: '#00ff00' }
	// }],
	// mapStyle: {
	// 	url: process.env.OUTDOOR_URL,
	// 	logo: '/assets/images/os-logo.svg',
	// 	logoAltText: 'Ordnance survey logo',
	// 	attribution: `Contains OS data ${String.fromCharCode(169)} Crown copyright and database rights ${(new Date()).getFullYear()}`,
	// 	backgroundColor: '#f5f5f0'
	// },
	plugins: [
		mapStylesPlugin({
			mapStyles: vtsMapStyles3857
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
			showMarker: false,
			// isExpanded: true
		}),
		useLocationPlugin(),
		interactPlugin,
		// framePlugin(),
		// drawPlugin
	]
	// search
})

var defraMap2 = new DefraMap('map2', {
	behaviour: 'inline',
	mapProvider: maplibreProvider(),
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
	// center: [-2.938769, 54.893806],
	bounds: [-2.989707, 54.864555, -2.878635, 54.937635],
	containerHeight: '650px',
	transformRequest: transformTileRequest,
	// enableFullscreen: true,
	// hasExitButton: true,
	// markers: [{
	// 	id: 'location',
	// 	coords: [-2.9592267, 54.9045977],
	// 	color: { outdoor: '#ff0000', dark: '#00ff00' }
	// }],
	// mapStyle: {
	// 	url: process.env.OUTDOOR_URL,
	// 	logo: '/assets/images/os-logo.svg',
	// 	logoAltText: 'Ordnance survey logo',
	// 	attribution: `Contains OS data ${String.fromCharCode(169)} Crown copyright and database rights ${(new Date()).getFullYear()}`,
	// 	backgroundColor: '#f5f5f0'
	// },
	plugins: [
		mapStylesPlugin({
			mapStyles: vtsMapStyles3857
		}),
		zoomControlsPlugin(),
		scaleBarPlugin({
			units: 'metric'
		}),
		// searchPlugin({
		// 	transformRequest: transformGeocodeRequest,
		// 	osNamesURL: process.env.OS_NAMES_URL,
		// 	customDatasets: searchCustomDatasets,
		// 	width: '300px',
		// 	showMarker: false,
		// 	// isExpanded: true
		// }),
		useLocationPlugin(),
		interactPlugin
	]
	// search
})

defraMap.on('map:ready', function (e) {
	defraMap.addPanel('tooltip', {
		label: 'How to use the map',
		html: `
			<p>Help text...</p>
		`,
		mobile: {
			slot: 'bottom',
		},
		tablet: {
			slot: 'bottom'
		},
		desktop: {
			slot: 'bottom'
		}
	})
})

defraMap.on('draw:ready', function () {
	// drawPlugin.newPolygon('test')
	// drawPlugin.editFeature(featureGeoJSON)
})

defraMap.on('interact:done', function (e) {
	console.log('interact:done', e)
})

defraMap.on('interact:cancel', function (e) {
	console.log('interact:cancel', e)
})

defraMap.on('interact:selectionchange', function (e) {
	console.log('interact:selectionchange', e)
})

defraMap.on('interact:markerchange', function (e) {
	console.log('interact:markerchange', e)
})

defraMap.on('app:panelopened', function (e) {
	console.log('app:panelopened', e)
})

defraMap.on('app:panelclosed', function (e) {
	console.log('app:panelclosed', e)
})