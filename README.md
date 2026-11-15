# DANA Aerodynamics Laboratory Webpage

> **DANA Aerodynamics Laboratory**  
> Subsonic Wind Tunnel &amp; Computational Fluid Dynamics  
> Department of Aerospace Engineering, Amirkabir University of Technology (Tehran Polytechnic)  
> Managed by **Prof. Masoud Mani** | Established August 2012

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Deployed-brightgreen)](https://drunkseal.github.io/dana/)
[![OpenDynamo](https://img.shields.io/badge/Flagship%20Solver-OpenDynamo-00d4ff)](https://github.com/drunkseal/opendynamo)
[![Discretization](https://img.shields.io/badge/CFD-Flux%20Reconstruction%20P%3D3-blue)](https://github.com/drunkseal/opendynamo)
[![Wind Tunnel](https://img.shields.io/badge/Wind%20Tunnel-60%20m%2Fs%20%7C%202%C3%971%C3%971%20m-emerald)](./facilities.html)

---

## Overview

Official repository for the **DANA Aerodynamics Laboratory** website at Amirkabir University of Technology. DANA bridges three foundational pillars of modern fluid mechanics:
1. **Numerical Aerodynamics & High-Performance Computing (CFD):** High-order Flux Reconstruction (FR, $P=3$), Discontinuous Galerkin (DG), Direct Numerical Simulation (DNS), and wall-resolved Large-Eddy Simulation (LES) powered by GPU acceleration.
2. **Precision Experimental Diagnostics:** An open-circuit suction subsonic wind tunnel ($2.0 \times 1.0 \times 1.0$ m test section, up to $60$ m/s, turbulence intensity $< 0.1\%$), equipped with constant-temperature hotwire anemometry (2 kHz), 80-channel DPS pressure scanners, 3-component and 6-component dynamic force balances, automated 3D traversing systems, and laser/UV optical flow visualization.
3. **Machine Learning & Active Flow Control:** Physics-Informed Neural Networks (PINNs), reduced-order surrogate modeling, and active boundary layer control via Dielectric Barrier Discharge (DBD) plasma actuators.

---

## Featured Flagship Project: OpenDynamo

The website prominently highlights [**OpenDynamo**](https://github.com/drunkseal/opendynamo), a GPU spectral-element solver for 3D compressible Navier–Stokes written in Rust with runtime CUDA synthesis via NVRTC:
- **Interactive Flow Animation:** Embedded MP4 and GIF showing instantaneous Q-criterion coherent turbulent structures.
- **Publication DNS Multi-Panel Figure:** High-resolution near-wall streaks ($y^+ \approx 15$), streamwise velocity contours, and cross-plane vorticity slices.
- **Interactive DNS Validation Chart:** Live in-browser verification comparing OpenDynamo channel data against the canonical Kim, Moin & Moser (1987, $Re_\tau \approx 180$) DNS database, complete with viscous sublayer ($u^+ = y^+$) and log-law benchmarks.

---

## Research Projects Portfolio

The website catalogs the laboratory's major applied, fundamental, and industrial research projects:
- **IRJ-72 Regional Jet:** High-AoA wing stall cells, flap deflection, and pylon/nacelle aerodynamic interference (ASA Aerospace).
- **Smart Morphing Wings:** Actuated compliant internal rib mechanisms for real-time aerodynamic profile adaptation.
- **DBD Plasma Actuators:** Linear and serpentine Dielectric Barrier Discharge plasma actuators for stall delay and Ahmed body drag reduction.
- **JT8D Turbofan Inlet Ground Vortex (GV):** Ground vortex ingestion dynamics and Foreign Object Damage (FOD) risk prevention.
- **Biomimetic Wingtip Geometries:** Nature-inspired slotted and serrated wingtips for induced drag minimization.
- **Simorgh Transport Tail Aerodynamics:** Engine replacement exhaust jet wake velocity field mapping using fluorescent UV powder tracing.
- **Dena+ Automotive Aeroacoustics:** Side mirror wake detachment and cabin aerodynamic noise reduction.
- **Industrial Flare Stacks & Porous Barriers:** Crosswind plume interaction and bulk dust dispersion suppression (NIOC & Mana Sanat).

---

## Experimental Metrology & Facilities

- **Subsonic Wind Tunnel:** $2\times 1\times 1$ m test section, $60$ m/s max airspeed, $Tu < 0.1\%$, 9:1 contraction nozzle.
- **Dantec Hotwire Anemometer (CTA):** $0–100$ m/s range, $\pm 0.01$ m/s resolution, $2$ kHz turbulence frequency response.
- **80-Channel DPS Pressure Box:** $5, 12.5, 25, 69$ mbar transducers, $< 0.1\%$ FS accuracy.
- **Aerodynamic Force Balances:** 3-component external ($100$ N lift/drag, $2.5$ N.m pitch) and dynamic 6-component internal balance ($300$ N).
- **Automated 3-Axis Traversal & Alpha Pitch Rig:** $1$ mm spatial CNC resolution, $0.1^\circ$ angle of attack control.
- **Flow Visualization Suite:** Paraffin smoke wire, surface oil streaks, UV-illuminated fluorescent tracer particles, surface tufts.
- **Additive Manufacturing:** FDM $45 \times 30 \times 42$ cm rapid prototyping in PLA/ABS.

---

## Repository Structure

```
dana/
├── index.html                   # Main laboratory portal & interactive visualizers
├── opendynamo.html              # Dedicated OpenDynamo technical monograph & config guide
├── facilities.html              # Experimental wind tunnel & metrology documentation
├── .nojekyll                    # GitHub Pages bypass Jekyll configuration
├── .github/
│   └── workflows/
│       └── deploy.yml           # Automated GitHub Pages CI/CD workflow
├── assets/
│   ├── css/
│   │   └── style.css            # Responsive dark/light aerospace design system
│   ├── js/
│   │   ├── main.js              # UI state, theme, modals, project filtering
│   │   ├── simulator.js         # Real-time aerodynamic streamline & particle canvas simulator
│   │   └── charts.js            # Interactive DNS validation chart engine
│   ├── opendynamo/
│   │   ├── flow_animation.mp4   # 3D turbulent channel animation (MP4)
│   │   ├── flow_animation.gif   # Fallback animated GIF
│   │   ├── flow_visualization_final.png # 4-Panel publication DNS verification figure
│   │   ├── channel_stats_re180_final.csv # DNS validation raw dataset
│   │   └── stats_data.js        # High-precision JS dataset for interactive charts
│   └── images/                  # Authentic laboratory photographs, logos & instruments
│       ├── aut_logo.png         # Amirkabir University of Technology emblem
│       ├── dana_logo.png        # Official DANA Laboratory logo
│       ├── wind_tunnel_facility.png # Wind tunnel test section & settling chamber
│       ├── hotwire_*.png/jpeg   # CTA hotwire system & probes
│       ├── balance_*.png        # Aerodynamic force balances
│       ├── dps_*.png            # 80-channel DPS pressure scanner
│       ├── traversing_system.png# 3D traversing mechanism
│       ├── alpha_mechanism.png  # Alpha angle of attack positioning rig
│       ├── fdm_3d_printer.jpg   # Rapid prototyping printer
│       └── ...                  # Aircraft models, plasma actuators & flow visualization
└── README.md
```

---

## Local Development & Preview

Run a lightweight static HTTP server from the repository root:

```bash
# Using Python 3
python3 -m http.server 8000

# Or using Node.js npx serve
npx serve .
```

Open [http://localhost:8000](http://localhost:8000) in your web browser.

---

## GitHub Pages Deployment

The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically deploys pushes on `main` to GitHub Pages.

To enable GitHub Pages in your repository settings:
1. Navigate to **Settings** &rarr; **Pages** in `drunkseal/dana`.
2. Under **Build and deployment** &rarr; **Source**, select **GitHub Actions** (or select **Deploy from a branch** with branch `main` and `/ (root)`).
3. The site will be live at:  
   `https://drunkseal.github.io/dana/`

---

## Contact & Location

**DANA Aerodynamics Laboratory**  
Department of Aerospace Engineering  
Amirkabir University of Technology (Tehran Polytechnic)  
424 Hafez Avenue, Tehran, Iran  
- **Director:** Prof. Masoud Mani (`Mani@aut.ac.ir`)
- **Operations & Metrology:** Mostafa Kazemi (`kazemi.mostafa@aut.ac.ir`)
- **CFD & Scientific Computing:** Ilia Alizadeh (`iliaalizadee@gmail.com`)
- **Phone:** (+98 21) 6454-5641
