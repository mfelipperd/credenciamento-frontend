import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { GeoJsonCollection } from "@/service/prospects.service";

const BRAZIL_BOUNDS: [number, number, number, number] = [-73.98, -33.75, -28.84, 5.27];

function maxCount(geojson: GeoJsonCollection): number {
  return Math.max(...geojson.features.map((f) => f.properties.count), 1);
}

interface FairCenter {
  longitude: number;
  latitude: number;
  city?: string | null;
  state?: string | null;
  zoom?: number;
}

interface ProspectMapProps {
  statesGeoJson: GeoJsonCollection;
  citiesGeoJson: GeoJsonCollection;
  neighborhoodsGeoJson?: GeoJsonCollection;
  fairCenter?: FairCenter | null;
  height?: number;
}

export function ProspectMap({
  statesGeoJson,
  citiesGeoJson,
  neighborhoodsGeoJson,
  fairCenter,
  height = 420,
}: ProspectMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const cityMax = maxCount(citiesGeoJson);
    const stateMax = maxCount(statesGeoJson);
    const hoodMax = neighborhoodsGeoJson ? maxCount(neighborhoodsGeoJson) : 1;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
      bounds: BRAZIL_BOUNDS,
      fitBoundsOptions: { padding: 32 },
      attributionControl: false,
    });

    mapRef.current = map;

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "top-right"
    );
    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      "bottom-right"
    );

    map.on("load", () => {
      // ── Fly to fair center (exact coords from Fair entity) ──────────────────
      if (fairCenter?.longitude && fairCenter?.latitude) {
        map.flyTo({
          center: [fairCenter.longitude, fairCenter.latitude],
          zoom: fairCenter.zoom ?? 10,
          duration: 1200,
        });
      }

      // ── State bubbles (low zoom only) ──────────────────────────────────────
      map.addSource("states", { type: "geojson", data: statesGeoJson });

      map.addLayer({
        id: "states-glow",
        type: "circle",
        source: "states",
        maxzoom: 8,
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["get", "count"], 0, 14, stateMax, 52],
          "circle-color": "#EB2970",
          "circle-opacity": ["interpolate", ["linear"], ["zoom"], 4, 0.12, 8, 0],
          "circle-blur": 1,
        },
      });

      map.addLayer({
        id: "states-circle",
        type: "circle",
        source: "states",
        maxzoom: 8,
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["get", "count"], 0, 8, stateMax, 40],
          "circle-color": "#EB2970",
          "circle-opacity": ["interpolate", ["linear"], ["zoom"], 4, 0.85, 8, 0],
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "rgba(255,255,255,0.2)",
        },
      });

      map.addLayer({
        id: "states-label",
        type: "symbol",
        source: "states",
        maxzoom: 8,
        layout: {
          "text-field": ["concat", ["get", "state"], "\n", ["to-string", ["get", "count"]]],
          "text-size": 10,
          "text-font": ["Noto Sans Bold"],
          "text-allow-overlap": true,
        },
        paint: {
          "text-color": "#ffffff",
          "text-opacity": ["interpolate", ["linear"], ["zoom"], 4, 0.9, 8, 0],
          "text-halo-color": "rgba(0,0,0,0.6)",
          "text-halo-width": 1,
        },
      });

      // ── City bubbles (mid zoom) ────────────────────────────────────────────
      map.addSource("cities", { type: "geojson", data: citiesGeoJson });

      map.addLayer({
        id: "cities-glow",
        type: "circle",
        source: "cities",
        minzoom: 4,
        maxzoom: 12,
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["get", "count"], 0, 10, cityMax, 38],
          "circle-color": "#00aacd",
          "circle-opacity": ["interpolate", ["linear"], ["zoom"], 4, 0.08, 8, 0.18, 12, 0],
          "circle-blur": 1.5,
        },
      });

      map.addLayer({
        id: "cities-circle",
        type: "circle",
        source: "cities",
        minzoom: 4,
        maxzoom: 12,
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["get", "count"], 0, 6, cityMax, 28],
          "circle-color": "#00aacd",
          "circle-opacity": ["interpolate", ["linear"], ["zoom"], 4, 0.5, 8, 0.85, 12, 0],
          "circle-stroke-width": 1.5,
          "circle-stroke-color": "rgba(255,255,255,0.25)",
        },
      });

      map.addLayer({
        id: "cities-label",
        type: "symbol",
        source: "cities",
        minzoom: 6,
        maxzoom: 12,
        layout: {
          "text-field": ["to-string", ["get", "count"]],
          "text-size": 10,
          "text-font": ["Noto Sans Bold"],
          "text-allow-overlap": false,
        },
        paint: {
          "text-color": "#ffffff",
          "text-opacity": ["interpolate", ["linear"], ["zoom"], 6, 0.7, 12, 0],
          "text-halo-color": "rgba(0,0,0,0.5)",
          "text-halo-width": 1,
        },
      });

      // ── Neighborhood bubbles (high zoom — the focus layer) ─────────────────
      if (neighborhoodsGeoJson) {
        map.addSource("neighborhoods", { type: "geojson", data: neighborhoodsGeoJson });

        map.addLayer({
          id: "neighborhoods-glow",
          type: "circle",
          source: "neighborhoods",
          minzoom: 9,
          paint: {
            "circle-radius": ["interpolate", ["linear"], ["get", "count"], 0, 10, hoodMax, 30],
            "circle-color": "#f59e0b",
            "circle-opacity": ["interpolate", ["linear"], ["zoom"], 9, 0.06, 11, 0.2],
            "circle-blur": 1.5,
          },
        });

        map.addLayer({
          id: "neighborhoods-circle",
          type: "circle",
          source: "neighborhoods",
          minzoom: 9,
          paint: {
            "circle-radius": ["interpolate", ["linear"], ["get", "count"], 0, 5, hoodMax, 22],
            "circle-color": "#f59e0b",
            "circle-opacity": ["interpolate", ["linear"], ["zoom"], 9, 0.55, 12, 0.9],
            "circle-stroke-width": 1.5,
            "circle-stroke-color": "rgba(255,255,255,0.3)",
          },
        });

        map.addLayer({
          id: "neighborhoods-label",
          type: "symbol",
          source: "neighborhoods",
          minzoom: 11,
          layout: {
            "text-field": ["to-string", ["get", "count"]],
            "text-size": 9,
            "text-font": ["Noto Sans Bold"],
            "text-allow-overlap": false,
          },
          paint: {
            "text-color": "#fff",
            "text-halo-color": "rgba(0,0,0,0.6)",
            "text-halo-width": 1,
          },
        });
      }

      // ── Popup ─────────────────────────────────────────────────────────────
      const popup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        maxWidth: "260px",
      });
      popupRef.current = popup;

      // State hover
      map.on(
        "mouseenter",
        "states-circle",
        (e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
          map.getCanvas().style.cursor = "pointer";
          const f = e.features?.[0];
          if (!f) return;
          const coords = (f.geometry as GeoJSON.Point).coordinates as [number, number];
          const p = f.properties as { state?: string; count: number; percentage: number };
          popup
            .setLngLat(coords)
            .setHTML(
              `<div style="font-family:sans-serif">
                <strong style="color:#fff;font-size:13px">${p.state}</strong>
                <div style="color:rgba(255,255,255,0.5);font-size:12px;margin-top:4px">
                  ${p.count.toLocaleString("pt-BR")} prospects · ${p.percentage?.toFixed(1) ?? 0}%
                </div>
                <div style="color:rgba(255,255,255,0.25);font-size:10px;margin-top:4px">
                  Aproxime para ver cidades e bairros
                </div>
              </div>`
            )
            .addTo(map);
        }
      );
      map.on("mouseleave", "states-circle", () => {
        map.getCanvas().style.cursor = "";
        popup.remove();
      });

      // City hover
      map.on(
        "mouseenter",
        "cities-circle",
        (e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
          map.getCanvas().style.cursor = "pointer";
          const f = e.features?.[0];
          if (!f) return;
          const coords = (f.geometry as GeoJSON.Point).coordinates as [number, number];
          const p = f.properties as { city?: string; state?: string; count: number; percentage: number };
          const pct = p.percentage?.toFixed(1) ?? "0";

          popup
            .setLngLat(coords)
            .setHTML(
              `<div style="font-family:sans-serif;padding:2px 0">
                <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px">
                  <strong style="color:#fff;font-size:13px">${p.city ?? ""}/${p.state ?? ""}</strong>
                  <span style="color:#00aacd;font-size:12px;font-weight:700;margin-left:10px">${p.count.toLocaleString("pt-BR")}</span>
                </div>
                <div style="color:rgba(255,255,255,0.3);font-size:10px">
                  ${pct}% dos prospects · aproxime para ver bairros
                </div>
              </div>`
            )
            .addTo(map);
        }
      );
      map.on("mouseleave", "cities-circle", () => {
        map.getCanvas().style.cursor = "";
        popup.remove();
      });

      // Neighborhood hover
      if (neighborhoodsGeoJson) {
        map.on(
          "mouseenter",
          "neighborhoods-circle",
          (e: maplibregl.MapMouseEvent & { features?: maplibregl.MapGeoJSONFeature[] }) => {
            map.getCanvas().style.cursor = "pointer";
            const f = e.features?.[0];
            if (!f) return;
            const coords = (f.geometry as GeoJSON.Point).coordinates as [number, number];
            const p = f.properties as { neighborhood?: string; city?: string; state?: string; count: number };

            popup
              .setLngLat(coords)
              .setHTML(
                `<div style="font-family:sans-serif;padding:2px 0">
                  <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px">
                    <strong style="color:#f59e0b;font-size:13px">${p.neighborhood ?? ""}</strong>
                    <span style="color:#f59e0b;font-size:12px;font-weight:700;margin-left:10px">${p.count.toLocaleString("pt-BR")}</span>
                  </div>
                  <div style="color:rgba(255,255,255,0.35);font-size:11px">
                    ${p.city ?? ""}/${p.state ?? ""}
                  </div>
                </div>`
              )
              .addTo(map);
          }
        );
        map.on("mouseleave", "neighborhoods-circle", () => {
          map.getCanvas().style.cursor = "";
          popup.remove();
        });
      }
    });

    return () => {
      popupRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update sources when data changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    (map.getSource("states") as maplibregl.GeoJSONSource | undefined)?.setData(statesGeoJson);
    (map.getSource("cities") as maplibregl.GeoJSONSource | undefined)?.setData(citiesGeoJson);
    if (neighborhoodsGeoJson) {
      (map.getSource("neighborhoods") as maplibregl.GeoJSONSource | undefined)?.setData(neighborhoodsGeoJson);
    }
  }, [statesGeoJson, citiesGeoJson, neighborhoodsGeoJson]);

  return (
    <div
      ref={containerRef}
      style={{ height }}
      className="w-full rounded-2xl overflow-hidden"
    />
  );
}
