export const displayMap = (locations) => {
  mapboxgl.accessToken =
    "pk.eyJ1Ijoic3RpY2t0cmljazMxODEiLCJhIjoiY2t4ZGdvc3R0NGJzODJ5cHpxdzFrdHRlMSJ9.APwO475y1HQ8gWFWMknEUg";
  const map = new mapboxgl.Map({
    container: "map", // container ID
    style: "mapbox://styles/sticktrick3181/ckxdhwr8o1d9i15pherq73lx8", // style URL
    //   center: [-74.5, 40], // starting position [lng, lat]
    scrollZoom: false,
    //   zoom: 10, // starting zoom
    //   interactive: false,
  });

  const bounds = new mapboxgl.LngLatBounds();
  locations.forEach((loc) => {
    const [a, b] = loc.coordinates;
    loc.coordinates = [b, a];
    //Adding a marker
    const el = document.createElement("div");
    el.classList = "marker";
    new mapboxgl.Marker({
      element: el,
      anchor: "bottom",
    })
      .setLngLat(loc.coordinates)
      .addTo(map);
    new mapboxgl.Popup({
      offset: 30,
      closeButton: false,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p> Day ${loc.day} : ${loc.description}`)
      .addTo(map);

    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds);
};
// mapboxgl.accessToken =
//   "pk.eyJ1Ijoic3RpY2t0cmljazMxODEiLCJhIjoiY2t4ZGdvc3R0NGJzODJ5cHpxdzFrdHRlMSJ9.APwO475y1HQ8gWFWMknEUg";
// const map = new mapboxgl.Map({
//   container: "map", // container ID
//   style: "mapbox://styles/sticktrick3181/ckxdhwr8o1d9i15pherq73lx8", // style URL
//   //   center: [-74.5, 40], // starting position [lng, lat]
//   scrollZoom: false,
//   //   zoom: 10, // starting zoom
//   //   interactive: false,
// });

// const bounds = new mapboxgl.LngLatBounds();
// locations.forEach((loc) => {
//   const [a, b] = loc.coordinates;
//   loc.coordinates = [b, a];
//   //Adding a marker
//   const el = document.createElement("div");
//   el.classList = "marker";
//   new mapboxgl.Marker({
//     element: el,
//     anchor: "bottom",
//   })
//     .setLngLat(loc.coordinates)
//     .addTo(map);
//   new mapboxgl.Popup({
//     offset: 30,
//     closeButton: false,
//   })
//     .setLngLat(loc.coordinates)
//     .setHTML(`<p> Day ${loc.day} : ${loc.description}`)
//     .addTo(map);

//   bounds.extend(loc.coordinates);
// });

// map.fitBounds(bounds);
