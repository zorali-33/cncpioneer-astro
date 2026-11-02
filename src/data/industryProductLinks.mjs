import { nativeParts } from './nativeParts.mjs';
import { isRetiredProduct } from './productRedirects.mjs';

// Reviewed destinations for industry cards that did not have product links.
// Keep existing product links, layouts, descriptions and suitable product photos.
const industryProductLinks = {
  'aerospace-swiss-machining': {
    'Structural Fasteners': { slug: 'aerospace-fasteners' },
    'Pneumatic Fittings': { slug: 'aerospace-fittings', image: '/wp-content/uploads/2026/04/as-aerospace-fittings.jpg' },
    'Sensor Housings': { slug: 'sensor-housings', image: '/wp-content/uploads/2026/04/threaded-sensor-housings.jpg' },
    'Avionics Connector Contacts': { slug: 'aerospace-connector-pins', image: '/wp-content/uploads/2026/04/solder-cup-contact-pins.jpg' },
  },
  'automotive-swiss-machining': {
    'Small Transmission Shafts': { slug: 'stainless-steel-precision-turning-shaft' },
    'Automotive Sensor Housings': { slug: 'sensor-housings' },
    'Braking Pins': { slug: 'cnc-machined-pins' },
    'EV Charging Terminals': { slug: 'precision-turned-ev-charging-pins' },
  },
  defense: {
    'Firing Pin': {
      slug: 'connector-pins', title: 'Connector Pins',
      image: '/wp-content/uploads/2025/12/connector-pins.jpg',
    },
    'Gas Piston Rod': {
      slug: 'rf-connectors', title: 'RF Connectors',
      image: '/wp-content/uploads/2026/05/rf-coaxial-connectors.jpg',
    },
    'Guidance System Pins': {
      slug: 'sensor-housings', title: 'Sensor Housings',
      image: '/wp-content/uploads/2026/04/threaded-sensor-housings.jpg',
    },
    'Suppressor Adapter': {
      slug: 'metal-enclosures', title: 'CNC Metal Enclosures',
      image: '/wp-content/uploads/2026/01/6061-aluminum-cnc-machining-enclosure-case.jpg',
    },
  },
  'defense-swiss-machining': {
    'RF Connector Contacts': { slug: 'precision-connector-contacts' },
    'Connector Pins': { slug: 'connector-pins' },
    'Threaded Sensor Housings': { slug: 'sensor-housings' },
    'Electrical Contacts': { slug: 'custom-electrical-contacts' },
  },
  evtol: {
    'Motor Shafts': { slug: 'motor-shaft' },
    'Tilt Shafts': { slug: 'aerospace-precision-shafts', title: 'Aerospace Precision Shafts' },
    'Structural Fittings': { slug: 'cnc-machining-for-aerospace-brackets', title: 'Aerospace Brackets & Fittings' },
    'Motor Stator Housings': { slug: 'electric-motor-stator-housing-machining' },
  },
  'humanoid-robot-cnc-machining': {
    'Actuator Components': { slug: 'robot-actuator-housings', title: 'Robot Actuator Housings' },
    'Leg Joint Components': { slug: '5-axis-cnc-machining-for-humanoid-robots', title: '5-Axis Humanoid Robot Parts' },
    'Dexterous Hand Components': { slug: 'humanoid-robot-joint-housings', title: 'Hand & Joint Housings' },
    'Torso Frame Components': { slug: '5-axis-cnc-machining-for-aluminum-structures', title: 'Aluminum Structural Parts' },
  },
  'medical-swiss-machining': {
    'Medical Connectors': { slug: 'medical-machining-parts' },
    'Surgical Instrument Shafts': { slug: 'medical-instrument-machining' },
    'Bone Screw Components': { slug: 'titanium-swiss-screw-machined-parts' },
    'Orthopedic Pins': { slug: 'medical-device-pins' },
  },
  'oil-gas-swiss-machining': {
    'Valve Stems': { slug: 'oil-gas-machining-components' },
    'Instrumentation Pins': { slug: 'cnc-machined-pins' },
    'Instrument Fittings': { slug: 'compression-tube-fitting' },
    'Orifice Fittings': { slug: 'stainless-steel-fittings' },
  },
  railway: {
    'Hydraulic Connector Body': { slug: 'hydraulic-fittings' },
    'Sensor Housing Pipe': { slug: 'sensor-housings' },
    'Signal Shaft': { slug: 'stainless-steel-precision-turning-shaft' },
    'Valve Spool': {
      slug: 'rail-machining', title: 'Precision Rail Machining Parts',
      image: '/wp-content/uploads/2026/06/precision-ground-linear-guide-rails.jpg',
    },
  },
  robotics: {
    'Joint Bearing Housings': { slug: 'cnc-turning-bearing-housings' },
    'Robot Arm Structural Links': { slug: 'industrial-robot-arms' },
    'End-Effector Interfaces': { slug: 'industrial-robot-arms' },
    'Joint Drive Components': { slug: 'harmonic-drive-gearbox' },
    'AMR Drive Hubs & Wheel Interfaces': {
      slug: 'robot-shaft-parts', title: 'Robot Drive Shafts',
      image: '/wp-content/uploads/2026/04/gearbox-shaft.jpg',
    },
    'Torque Sensor & Encoder Interfaces': { slug: 'robot-actuator-housings', title: 'Robot Actuator Housings' },
  },
  satellites: {
    'Structural & Interface Parts': { slug: 'satellite-structures', title: 'Satellite Structural Components' },
    'Attitude Control & Mechanism Parts': {
      slug: 'satellite-arms', title: 'Satellite Arms & Mechanism Parts',
      image: '/wp-content/uploads/2026/05/satellite-arm-link-structure.jpg',
      text: 'Machined arm links, joint interfaces, bearing seats, and mounting features for satellite mechanisms. Provide the component drawing and mating interfaces for manufacturing review.',
    },
    'Propulsion & Fluid-System Parts': {
      slug: 'aerospace-fittings', title: 'Aerospace Fluid Fittings',
      image: '/wp-content/uploads/2026/04/as-aerospace-fittings.jpg',
      text: 'Turned and milled fitting bodies, port adapters, and connection hardware for fluid-system assemblies. Specify thread standards, material, sealing faces, and inspection requirements.',
    },
    'Payload, Optical & RF Parts': { slug: 'satellite-milling-components', title: 'Satellite Milled Payload Parts' },
    'Power & Thermal Hardware': { slug: 'heat-sinks', title: 'Machined Heat Sinks' },
    'CubeSat & Custom Deployment Parts': {
      slug: 'satellite-brackets', title: 'Satellite Brackets',
      image: '/wp-content/uploads/2026/05/cubesat-smallsat-brackets.jpg',
      text: 'Machined mounting brackets, equipment supports, and interface hardware for CubeSats and other satellite assemblies. Identify critical datums, material, finish, and assembly requirements.',
    },
  },
  server: {
    'Server Chassis Hardware': { slug: 'chassis' },
    'GPU Cold Plates': { slug: 'liquid-cooling-plate' },
    'Rack Structural Hardware': { slug: 'server-components' },
    'Storage Drive Carriers': { slug: 'server-components' },
  },
};

const activeProducts = new Set(nativeParts
  .filter((part) => !isRetiredProduct(`custom-cnc-parts/${part.slug}`))
  .map((part) => part.slug));

export const hasIndustryProductLinks = (slug) => Object.hasOwn(industryProductLinks, slug);

export function withIndustryProductLinks(slug, detail) {
  const destinations = industryProductLinks[slug];
  if (!destinations || !detail?.parts) return detail;
  return {
    ...detail,
    parts: {
      ...detail.parts,
      items: detail.parts.items.map((part) => {
        if (part.href) return part;
        const destination = destinations[part.title];
        if (!destination) return part;
        if (!activeProducts.has(destination.slug)) {
          throw new Error(`Missing active product for ${slug}: ${destination.slug}`);
        }
        return {
          ...part,
          ...(destination.title ? { title: destination.title } : {}),
          ...(destination.image ? { image: destination.image } : {}),
          ...(destination.text ? { text: destination.text } : {}),
          href: `/custom-cnc-parts/${destination.slug}`,
        };
      }),
    },
  };
}
