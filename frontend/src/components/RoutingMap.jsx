import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

function RoutingMap({ pickupCoords, dropCoords, setDistance }) {
  const map = useMap();
  const routingRef = useRef(null);

  useEffect(() => {
    if (!pickupCoords || !dropCoords) return;

    try {
      if (routingRef.current) {
        map.removeControl(routingRef.current);
      }
    } catch (err) {
      console.log("Old route cleanup skipped");
    }

    routingRef.current = L.Routing.control({
      waypoints: [
        L.latLng(pickupCoords[0], pickupCoords[1]),
        L.latLng(dropCoords[0], dropCoords[1])
      ],

      lineOptions: {
        styles: [
          {
            color: "#facc15",
            weight: 6,
            opacity: 0.9
          }
        ]
      },

      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      createMarker: () => null,
      show: false,

      router: L.Routing.osrmv1({
        serviceUrl:
          "https://router.project-osrm.org/route/v1"
      })
    }).addTo(map);

    routingRef.current.on("routesfound", (e) => {
      const route = e.routes[0];

      if (route?.summary) {
        const distanceKm = (
          route.summary.totalDistance / 1000
        ).toFixed(2);

        setDistance(Number(distanceKm));
      }
    });

    routingRef.current.on("routingerror", () => {
      console.log("Routing failed");
    });

    setTimeout(() => {
      const panel = document.querySelector(
        ".leaflet-routing-container"
      );

      if (panel) {
        panel.style.display = "none";
      }
    }, 300);

    return () => {
      try {
        if (routingRef.current) {
          map.removeControl(routingRef.current);
        }
      } catch {
        console.log("Cleanup skipped");
      }
    };

  }, [pickupCoords, dropCoords]);

  return null;
}

export default RoutingMap;