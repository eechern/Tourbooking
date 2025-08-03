/* eslint-disable */
import mapboxgl from 'mapbox-gl';

export const displayMap = (locations) => {
  if (!locations || !Array.isArray(locations)) return;

  mapboxgl.accessToken =
    'pk.eyJ1IjoiZWVjaGVybiIsImEiOiJjbWRhZTZ0cDcwaDdmMmtxemFxemljbXAyIn0.zXEEvxjT0M05YCNsAinaqg';

  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/eechern/cmdaeduxj01kz01sb2xuy4s59',
    scrollZoom: false
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    const el = document.createElement('div');
    el.className = 'marker';

    new mapboxgl.Marker({ element: el, anchor: 'bottom' })
      .setLngLat(loc.coordinates)
      .addTo(map);

    new mapboxgl.Popup({ offset: 30 })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100
    }
  });
};
