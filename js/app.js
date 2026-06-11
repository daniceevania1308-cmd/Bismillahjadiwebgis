// ======================= DATA WILAYAH (berdasarkan screenshot yang diberikan) =======================
// Data gabungan dari tabel 1,2,3,4,5 (8 wilayah utama)
const wilayahData = [
    {
        id: 0,
        name: "MENDALANWANGI",
        kecamatan: "WAGIR",
        luas_ha: 6897.003,
        total_carbon: 1137505.135,
        total_co2: 4174643.845,
        agb_mean: 0.707545357938642,
        ndvi_mean: 0.837166173111531,
        kelas_ctpi: "BERPOTENSI",       // dari tabel5
        ctpi_hitung: 78.8,              // berdasarkan AGBmean relatif (0-100)
        warna: "#2c7a47"
    },
    {
        id: 1,
        name: "KARANGKATES",
        kecamatan: "SUMBERPUCUNG",
        luas_ha: 5994.617,
        total_carbon: 869418.818,
        total_co2: 3190767.062,
        agb_mean: 0.534334518126505,
        ndvi_mean: 0.732428779255601,
        kelas_ctpi: "SANGAT TIDAK",
        ctpi_hitung: 59.5,
        warna: "#d9534f"
    },
    {
        id: 2,
        name: "SUKOANYAR",
        kecamatan: "WAJAK",
        luas_ha: 4221.275,
        total_carbon: 368622.968,
        total_co2: 1352846.293,
        agb_mean: 0.6693785111478609,
        ndvi_mean: 0.816677246433516,
        kelas_ctpi: "BERPOTENSI",
        ctpi_hitung: 74.5,
        warna: "#2c7a47"
    },
    {
        id: 3,
        name: "PESANGGRAHAN",
        kecamatan: "BATU",
        luas_ha: 9959.285,
        total_carbon: 1484850.289,
        total_co2: 5449400.561,
        agb_mean: 0.89830418579451,
        ndvi_mean: 0.939644434524856,
        kelas_ctpi: "CUKUP",
        ctpi_hitung: 100,
        warna: "#ffc107"
    },
    {
        id: 4,
        name: "DADAPREJO",
        kecamatan: "JUNREJO",
        luas_ha: 320.374,
        total_carbon: 2084.995,
        total_co2: 7651.932,
        agb_mean: 0.645092575086488,
        ndvi_mean: 0.803633242183261,
        kelas_ctpi: "BERPOTENSI",
        ctpi_hitung: 71.8,
        warna: "#2c7a47"
    },
    {
        id: 5,
        name: "SUMBERSUKO",
        kecamatan: "TAJINAN",
        luas_ha: 5.923,
        total_carbon: 369.082,
        total_co2: 1354.531,
        agb_mean: 0.678449118895321,
        ndvi_mean: 0.82155000704447,
        kelas_ctpi: "SANGAT BERPOTENSI",
        ctpi_hitung: 75.5,
        warna: "#fd7e14"
    },
    {
        id: 6,
        name: "SLOROK",
        kecamatan: "KROMENGAN",
        luas_ha: 4100.202,
        total_carbon: 533498.948,
        total_co2: 1957941.139,
        agb_mean: 0.667094428053919,
        ndvi_mean: 0.814011876080998,
        kelas_ctpi: "BERPOTENSI",
        ctpi_hitung: 74.3,
        warna: "#2c7a47"
    },
    {
        id: 7,
        name: "AREA KEHUTANAN",
        kecamatan: "DAU",
        luas_ha: 4384.218,
        total_carbon: 592181.097,
        total_co2: 2173304.626,
        agb_mean: 0.73760910690508,
        ndvi_mean: 0.853325676288557,
        kelas_ctpi: "SANGAT TIDAK",
        ctpi_hitung: 82.1,
        warna: "#d9534f"
    }
];

// ======================= MEMBUAT GEOJSON SEDERHANA (POLYGON PERKIRAAN) =======================
// Koordinat pusat kecamatan (approximasi Kabupaten Malang)
const koordinatPusat = {
    "WAGIR": [112.58, -8.03],
    "SUMBERPUCUNG": [112.54, -8.15],
    "WAJAK": [112.70, -8.12],
    "BATU": [112.53, -7.87],
    "JUNREJO": [112.58, -7.92],
    "TAJINAN": [112.68, -8.05],
    "KROMENGAN": [112.50, -8.10],
    "DAU": [112.58, -7.95]
};

// Fungsi bikin polygon kecil (kotak) sekitar 0.02 derajat
function createPolygonFromCenter(lng, lat, offset = 0.02) {
    return [
        [lng - offset, lat - offset],
        [lng + offset, lat - offset],
        [lng + offset, lat + offset],
        [lng - offset, lat + offset],
        [lng - offset, lat - offset]
    ];
}

// Generate GeoJSON features
const geojsonFeatures = wilayahData.map(wil => {
    const center = koordinatPusat[wil.kecamatan];
    if (!center) return null;
    const polygonCoords = createPolygonFromCenter(center[0], center[1], 0.018);
    return {
        type: "Feature",
        properties: {
            name: wil.name,
            kecamatan: wil.kecamatan,
            luas_ha: wil.luas_ha,
            total_carbon: wil.total_carbon,
            total_co2: wil.total_co2,
            agb_mean: wil.agb_mean,
            ndvi_mean: wil.ndvi_mean,
            kelas_ctpi: wil.kelas_ctpi,
            ctpi_score: wil.ctpi_hitung,
            warna: wil.warna
        },
        geometry: {
            type: "Polygon",
            coordinates: [polygonCoords]
        }
    };
}).filter(f => f !== null);

const geoJsonData = {
    type: "FeatureCollection",
    features: geojsonFeatures
};

// ======================= INISIALISASI PETA =======================
const map = L.map('map').setView([-8.05, 112.62], 10);

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; CartoDB',
    subdomains: 'abcd',
    maxZoom: 19,
    minZoom: 8
}).addTo(map);

// Style function untuk polygon berdasarkan kelas CTPI
function styleFeature(feature) {
    let color = "#cccccc";
    const kelas = feature.properties.kelas_ctpi;
    if (kelas === "BERPOTENSI") color = "#2c7a47";
    else if (kelas === "CUKUP") color = "#ffc107";
    else if (kelas === "SANGAT TIDAK") color = "#d9534f";
    else if (kelas === "SANGAT BERPOTENSI") color = "#fd7e14";
    else if (kelas === "KURANG") color = "#8a6d3b";
    return {
        fillColor: color,
        weight: 2,
        opacity: 1,
        color: "#ffffff",
        fillOpacity: 0.7,
        dashArray: '3'
    };
}

// Tambahkan GeoJSON ke peta
const geojsonLayer = L.geoJSON(geoJsonData, {
    style: styleFeature,
    onEachFeature: function(feature, layer) {
        // Tooltip hover
        layer.bindTooltip(`<b>${feature.properties.name}</b><br>Kec. ${feature.properties.kecamatan}<br>CTPI: ${feature.properties.kelas_ctpi}`, 
            { sticky: true, className: "custom-tooltip" });
        
        // Event klik untuk update panel & grafik
        layer.on('click', function(e) {
            updatePanelAndChart(feature.properties);
            // Highlight polygon sementara
            layer.setStyle({ weight: 4, color: "#000", fillOpacity: 0.85 });
            setTimeout(() => {
                geojsonLayer.resetStyle(layer);
            }, 800);
        });
    }
}).addTo(map);

// Zoom ke area Malang
map.fitBounds(geojsonLayer.getBounds());

// ======================= GRAFIK (Chart.js) =======================
let ctpiChart = null;

function initChart() {
    const ctx = document.getElementById('ctpi-chart').getContext('2d');
    ctpiChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: 'CTPI Score (Potensi Karbon)',
                data: [],
                backgroundColor: 'rgba(44, 122, 71, 0.7)',
                borderColor: '#1e4d2e',
                borderWidth: 1,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'top' },
                tooltip: { callbacks: { label: (ctx) => `Skor: ${ctx.raw}` } }
            },
            scales: {
                y: { beginAtZero: true, max: 105, title: { display: true, text: 'Indeks Potensi' } },
                x: { ticks: { autoSkip: true, maxRotation: 45 } }
            }
        }
    });
}

function updatePanelAndChart(properties) {
    // Update panel detail
    document.getElementById('wilayah-name').innerText = properties.name;
    document.getElementById('kecamatan').innerText = properties.kecamatan;
    document.getElementById('luas').innerText = properties.luas_ha.toLocaleString('id-ID') + " Ha";
    document.getElementById('total-carbon').innerText = properties.total_carbon.toLocaleString('id-ID') + " ton";
    document.getElementById('total-co2').innerText = properties.total_co2.toLocaleString('id-ID') + " ton";
    document.getElementById('agb-mean').innerText = properties.agb_mean.toFixed(4) + " Mg/Ha";
    document.getElementById('ndvi-mean').innerText = properties.ndvi_mean.toFixed(6);
    
    const kelasElem = document.getElementById('kelas-ctpi');
    kelasElem.innerText = properties.kelas_ctpi;
    // Warna badge kelas
    let bgColor = "#eee";
    if (properties.kelas_ctpi === "BERPOTENSI") bgColor = "#2c7a47";
    else if (properties.kelas_ctpi === "CUKUP") bgColor = "#ffc107";
    else if (properties.kelas_ctpi === "SANGAT TIDAK") bgColor = "#d9534f";
    else if (properties.kelas_ctpi === "SANGAT BERPOTENSI") bgColor = "#fd7e14";
    else if (properties.kelas_ctpi === "KURANG") bgColor = "#8a6d3b";
    kelasElem.style.backgroundColor = bgColor;
    kelasElem.style.color = (properties.kelas_ctpi === "CUKUP") ? "#333" : "#fff";
    
    // Update grafik dengan perbandingan semua wilayah (atau highlight yang dipilih)
    const allScores = wilayahData.map(w => w.ctpi_hitung);
    const allNames = wilayahData.map(w => w.name);
    const currentIndex = wilayahData.findIndex(w => w.name === properties.name);
    
    // set chart data
    if (ctpiChart) {
        ctpiChart.data.labels = allNames;
        ctpiChart.data.datasets[0].data = allScores;
        // warna batang berbeda untuk yang dipilih
        const backgroundColors = allNames.map((_, idx) => 
            idx === currentIndex ? '#f39c12' : 'rgba(44, 122, 71, 0.6)'
        );
        ctpiChart.data.datasets[0].backgroundColor = backgroundColors;
        ctpiChart.update();
    }
    
    // Juga tampilkan pesan sukses
    document.getElementById('click-instruction').innerHTML = `📍 Wilayah terpilih: ${properties.name}`;
}

// ======================= INITIALISASI APLIKASI =======================
document.addEventListener('DOMContentLoaded', () => {
    initChart();
    // Pilih wilayah pertama secara default untuk tampilkan grafik awal (opsional)
    if (wilayahData.length > 0) {
        const defaultProps = geojsonFeatures[0].properties;
        updatePanelAndChart(defaultProps);
        // Cari layer pertama dan trigger style ringan
        geojsonLayer.eachLayer(layer => {
            if (layer.feature.properties.name === defaultProps.name) {
                layer.openTooltip();
            }
        });
    }
});