import "./css/styles.css";
import layoutTemplate from "./hbs/layout.hbs";
import mapTemplate from "./hbs/map.hbs";

// import module from "./js/module";

const appEl = document.getElementById("app");
const siteInfo = { title: "IP Location Finder" };
window.document.title = siteInfo.title;
appEl.innerHTML = layoutTemplate(siteInfo);

const contentEl = document.getElementById("content-pane");

contentEl.innerHTML = mapTemplate();

let domain = document.getElementById("domain-value");
let btnLookup = document.getElementById("btn-lookup");
let ipText = document.getElementById("ip-address");
let ipAddress;

// console.log(mapboxgl);

mapboxgl.accessToken =
  "pk.eyJ1IjoiZS10YW8iLCJhIjoiY2wyYW43NHJoMDZ6bTNqbzJqNzd1aTF2ZCJ9.M6R7JnP6fQrQhbkLCGl2zg";

let map;

let init = function () {
  mapInit();
};

let mapInit = async function () {
  map = new mapboxgl.Map({
    container: "map", // container ID
    style: "mapbox://styles/e-tao/cl2fg7qd0000e14mmjkrnmf14", // style URL
    center: [-75.765, 45.456], // starting position [lng, lat]
    zoom: 15, // starting zoom
  });

  map.appSettings = {
    user: {
      position: [0, 0],
    },
  };

  if ("permissions" in navigator) {
    let perm = await navigator.permissions.query({ name: "geolocation" });

    if (perm.state == "granted") {
      if ("geolocation" in navigator && domain.value == "") {
        navigator.geolocation.getCurrentPosition(function (position) {
          let pos = position.coords;
          map.appSettings.user.position = [pos.longitude, pos.latitude];

          map.setCenter(map.appSettings.user.position);
          onLocateuser(map.appSettings.user.position);
        });

        // const locationWatch = navigator.geolocation.watchPosition((position) => {
        //   let pos = position.coords;
        //   map.setCenter([pos.longitude, pos.latitude]);
        // });
        // navigator.geolocation.clearWatch(locationWatch);
      } else {
        serverGeolocate();
      }
    } else {
      serverGeolocate();
    }
  } else {
    serverGeolocate();
  }
};

let serverGeolocate = async function () {
  let serverGeo = await (
    await fetch("http://127.0.0.1:3000/api/location")
  ).json();

  map.appSettings.user.position = [serverGeo.lng, serverGeo.lat];

  map.setCenter([serverGeo.lng, serverGeo.lat]);

  onLocateuser(map.appSettings.user.position);
};

let onLocateuser = function (location) {
  map.appSettings.user.position = location;
  map.appSettings.user.marker = new mapboxgl.Marker({
    color: "red",
  })
    .setLngLat(location)
    .setPopup(new mapboxgl.Popup().setHTML("<h3>You are here</h3>"))
    .addTo(map);
};

btnLookup.addEventListener("click", async function () {
  ipAddress = await (
    await fetch(`http://127.0.0.1:3000/api/ping/${domain.value}`)
  ).json();
  ipText.value = ipAddress.ip;

  let checkLoc = [ipAddress.lng, ipAddress.lat];
  console.log(ipAddress.lat, ipAddress.lng);
  map.setCenter(checkLoc);
  onLocateuser(checkLoc);
});

init();
